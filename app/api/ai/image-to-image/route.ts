import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { evolinkAxios } from '@/lib/axios-config';
import { Storage } from '@/lib/storage';
import { log, logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    // 2. 解析 FormData
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const model = formData.get('model') as string;
    const aspectRatio = formData.get('aspectRatio') as string;

    log('[Image-to-Image] 收到请求:', {
      user: session.user.email,
      model,
      prompt: prompt?.substring(0, 50),
      aspectRatio,
      imageSize: imageFile?.size
    });

    // 3. 验证参数
    if (!imageFile) {
      return NextResponse.json(
        { code: 400, message: '请上传参考图片' },
        { status: 400 }
      );
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { code: 400, message: '请输入提示词' },
        { status: 400 }
      );
    }

    // 4. 上传参考图片到 R2
    log('[Image-to-Image] 上传参考图片到 R2...');
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const storage = new Storage();
    
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `i2i-ref-${timestamp}-${randomStr}.${imageFile.name.split('.').pop()}`;
    const fileKey = `uploads/image-to-image/${fileName}`;

    await storage.uploadFile({
      body: buffer,
      key: fileKey,
      contentType: imageFile.type,
      disposition: 'inline'
    });

    const publicUrl = `${process.env.STORAGE_DOMAIN}/${fileKey}`;
    log('[Image-to-Image] 参考图片上传成功:', publicUrl);

    // 5. 根据模型调用对应的 API
    if (model === 'nano-banana-2-lite') {
      // Evolink Nano Banana Pro
      log('[Image-to-Image] 使用 Evolink API 生成图片');

      const sizeMap: Record<string, string> = {
        '1:1': '1:1',
        '16:9': '16:9',
        '9:16': '9:16',
        '4:3': '4:3',
        '3:4': '3:4'
      };

      // 创建任务
      const response = await evolinkAxios.post('/v1/images/generations', {
        model: 'nano-banana-2-lite',
        prompt: prompt.trim(),
        size: sizeMap[aspectRatio] || 'auto',
        quality: '2K',
        image_urls: [publicUrl] // 添加参考图片 URL
      });

      log('[Image-to-Image] Evolink 任务创建响应:', response.data);

      if (!response.data || !response.data.id) {
        throw new Error('创建任务失败');
      }

      const taskId = response.data.id;
      log('[Image-to-Image] 任务ID:', taskId);

      // 轮询任务状态
      const maxAttempts = 120; // 4 分钟超时
      const pollInterval = 2000; // 2 秒轮询一次

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        const statusResponse = await evolinkAxios.get(`/v1/tasks/${taskId}`);
        const taskData = statusResponse.data;

        log(`[Image-to-Image] 轮询 ${attempt + 1}/${maxAttempts}, 状态: ${taskData.status}, 进度: ${taskData.progress}`);

        if (taskData.status === 'completed' && taskData.results && taskData.results.length > 0) {
          log('[Image-to-Image] 生成完成，图片URL:', taskData.results[0]);
          
          return NextResponse.json({
            code: 1000,
            message: 'success',
            data: {
              images: taskData.results,
              model: model,
              prompt: prompt
            }
          });
        }

        if (taskData.status === 'failed') {
          throw new Error('图片生成失败');
        }
      }

      throw new Error('任务超时');
    }

    // 6. Google Imagen 系列：即将推出
    if (model.includes('imagen-4')) {
      log('[Image-to-Image] Google Imagen 模型即将推出');
      return NextResponse.json(
        { 
          code: 501, 
          message: '🚀 Google Imagen 4 图生图功能即将推出，敬请期待！\n\n当前可用模型：Nano Banana Pro' 
        },
        { status: 501 }
      );
    }

    // 7. 其他模型：不支持
    return NextResponse.json(
      { 
        code: 400, 
        message: `模型 ${model} 暂不支持图生图功能` 
      },
      { status: 400 }
    );

  } catch (error: any) {
    logError('[Image-to-Image] 错误:', error);
    const errorData = error.response?.data?.error || {};
    return NextResponse.json(
      {
        code: error.response?.status || 500,
        message: errorData.message || error.message || '图生图失败',
        error: errorData
      },
      { status: error.response?.status || 500 }
    );
  }
}
