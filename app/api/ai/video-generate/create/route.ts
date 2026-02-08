import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { evolinkAxios } from '@/lib/axios-config';
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

    // 2. 解析请求参数
    const body = await request.json();
    const {
      prompt,
      model,
      duration,
      resolution,
      aspectRatio,
      generateAudio,
      imageUrl  // 图生视频需要
    } = body;

    log('[Video Generate] 收到请求:', {
      user: session.user.email,
      model,
      prompt: prompt?.substring(0, 50),
      duration,
      resolution,
      aspectRatio,
      hasImage: !!imageUrl
    });

    // 3. 验证参数
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { code: 400, message: '请输入提示词' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { code: 400, message: '请选择模型' },
        { status: 400 }
      );
    }

    // 4. 根据模型调用对应的 API
    if (model === 'sora-2') {
      // Evolink Sora 2 Lite
      log('[Video Generate] 使用 Evolink Sora 2 Lite API');

      const requestBody: Record<string, any> = {
        model: 'sora-2',
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio || '16:9',
      };

      // 如果有图片 URL，添加到请求中（图生视频）
      if (imageUrl) {
        requestBody.image_url = imageUrl;
        log('[Video Generate] 图生视频模式，图片URL:', imageUrl);
      }

      log('[Video Generate] 调用 Evolink API:', requestBody);

      const response = await evolinkAxios.post('/v1/videos/generations', requestBody);

      log('[Video Generate] Evolink 响应:', response.data);

      if (!response.data || !response.data.id) {
        throw new Error('创建任务失败');
      }

      return NextResponse.json({
        code: 1000,
        message: 'success',
        data: {
          taskId: response.data.id,
          status: response.data.status,
          progress: response.data.progress || 0
        }
      });
    }

    // Seedance 1.5 Pro
    if (model === 'seedance-1.5-pro') {
      log('[Video Generate] 使用 Evolink Seedance 1.5 Pro API');

      const requestBody: Record<string, any> = {
        model: 'seedance-1.5-pro',
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio || '16:9',
        duration: parseInt(duration) || 5,
        quality: resolution || '720p',
        generate_audio: generateAudio || false
      };

      log('[Video Generate] 调用 Evolink API:', requestBody);

      const response = await evolinkAxios.post('/v1/videos/generations', requestBody);

      log('[Video Generate] Evolink 响应:', response.data);

      if (!response.data || !response.data.id) {
        throw new Error('创建任务失败');
      }

      return NextResponse.json({
        code: 1000,
        message: 'success',
        data: {
          taskId: response.data.id,
          status: response.data.status,
          progress: response.data.progress || 0
        }
      });
    }

    // 其他模型：暂不支持
    return NextResponse.json(
      {
        code: 400,
        message: `模型 ${model} 暂不支持`
      },
      { status: 400 }
    );

  } catch (error: any) {
    logError('[Video Generate] 错误:', error);
    const errorData = error.response?.data?.error || {};
    return NextResponse.json(
      {
        code: error.response?.status || 500,
        message: errorData.message || error.message || '视频生成失败',
        error: errorData
      },
      { status: error.response?.status || 500 }
    );
  }
}
