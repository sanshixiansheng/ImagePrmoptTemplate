import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs'; // Sharp 需要 Node.js 运行时

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const { imageBase64, format } = await request.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // 验证格式
    const validFormats = ['png', 'jpeg', 'webp'];
    const targetFormat = validFormats.includes(format) ? format : 'jpeg';

    console.log('[Image Compress] Starting compression, format:', targetFormat);

    // 移除 Base64 前缀（如果存在）
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const inputBuffer = Buffer.from(base64Data, 'base64');

    console.log('[Image Compress] Input size:', inputBuffer.length, 'bytes');

    // 使用 Sharp 压缩图片
    let sharpInstance = sharp(inputBuffer);

    // 获取图片元数据
    const metadata = await sharpInstance.metadata();
    console.log('[Image Compress] Original dimensions:', metadata.width, 'x', metadata.height);

    // 限制最大尺寸（保持纵横比）
    const maxDimension = 4096;
    if (metadata.width && metadata.width > maxDimension || metadata.height && metadata.height > maxDimension) {
      sharpInstance = sharpInstance.resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      console.log('[Image Compress] Resizing to max dimension:', maxDimension);
    }

    // 根据格式压缩
    let outputBuffer: Buffer;
    
    switch (targetFormat) {
      case 'png':
        outputBuffer = await sharpInstance
          .png({
            quality: 80,
            compressionLevel: 9,
            palette: true, // 使用调色板减小文件大小
          })
          .toBuffer();
        break;

      case 'jpeg':
        outputBuffer = await sharpInstance
          .jpeg({
            quality: 85,
            progressive: true,
            optimizeScans: true,
            mozjpeg: true, // 使用 mozjpeg 进一步优化
          })
          .toBuffer();
        break;

      case 'webp':
        outputBuffer = await sharpInstance
          .webp({
            quality: 85,
            effort: 6, // 压缩努力程度 (0-6)
          })
          .toBuffer();
        break;

      default:
        outputBuffer = await sharpInstance
          .jpeg({ quality: 85 })
          .toBuffer();
    }

    console.log('[Image Compress] Output size:', outputBuffer.length, 'bytes');
    
    const compressionRatio = Math.round(
      ((inputBuffer.length - outputBuffer.length) / inputBuffer.length) * 100
    );
    console.log('[Image Compress] Compression ratio:', compressionRatio, '%');

    // 转换为 Base64
    const outputBase64 = `data:image/${targetFormat};base64,${outputBuffer.toString('base64')}`;

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        imageBase64: outputBase64,
        originalSize: inputBuffer.length,
        compressedSize: outputBuffer.length,
        compressionRatio: compressionRatio,
        format: targetFormat,
      },
    });

  } catch (error: any) {
    console.error('[Image Compress] Error:', error);
    
    // 提供更友好的错误信息
    let errorMessage = 'Image compression failed';
    
    if (error.message?.includes('Input buffer')) {
      errorMessage = 'Invalid image data';
    } else if (error.message?.includes('sharp')) {
      errorMessage = 'Image processing library error';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message 
      },
      { status: 500 }
    );
  }
}
