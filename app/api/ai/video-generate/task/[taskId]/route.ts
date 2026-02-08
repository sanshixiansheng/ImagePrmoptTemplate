import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // 1. 验证用户登录
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    log('[Video Task] 查询视频任务状态:', {
      user: session.user.email,
      taskId
    });

    // 2. 调用 Evolink API 查询任务状态
    const response = await evolinkAxios.get(`/v1/tasks/${taskId}`);

    log('[Video Task] 任务状态响应:', response.data);

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: response.data
    });

  } catch (error: any) {
    logError('[Video Task] 查询失败:', error);
    const errorData = error.response?.data?.error || {};
    return NextResponse.json(
      {
        code: error.response?.status || 500,
        message: errorData.message || error.message || '查询失败',
        error: errorData
      },
      { status: error.response?.status || 500 }
    );
  }
}
