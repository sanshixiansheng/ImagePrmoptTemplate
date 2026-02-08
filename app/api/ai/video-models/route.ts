import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[Video Models] 获取视频模型列表');

    // 视频模型列表
    const videoModels = [
      {
        id: 'sora-2',
        name: 'Sora 2 Lite',
        description: 'Fast and cost-effective video generation from Evolink, powered by OpenAI Sora 2',
        provider: 'evolink',
        maxDuration: 15,
        supportedResolutions: ['480p', '720p', '1080p'],
        supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
        supportedAspectDuration: [10, 15],
        supportsTextToVideo: true,
        supportsImageToVideo: true
      },
      {
        id: 'seedance-1.5-pro',
        name: 'Seedance 1.5 Pro',
        description: 'Professional video generation from Evolink, optimized for dance and character animation',
        provider: 'evolink',
        maxDuration: 8,
        supportedResolutions: ['480p', '720p'],
        supportedAspectRatios: ['16:9', '9:16', '1:1'],
        supportedAspectDuration: [5, 8],
        supportsTextToVideo: true,
        supportsImageToVideo: false
      }
    ];

    console.log('[Video Models] 返回模型数量:', videoModels.length);

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: videoModels
    });

  } catch (error: any) {
    console.error('[Video Models] 错误:', error);
    return NextResponse.json(
      {
        code: 500,
        message: error.message || 'Failed to fetch video models',
      },
      { status: 500 }
    );
  }
}
