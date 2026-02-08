import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { evolinkAxios } from '@/lib/axios-config';
import { log, logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    // 2. 从 URL 参数获取 taskId
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { code: 400, message: 'Task ID is required' },
        { status: 400 }
      );
    }

    log('[Video Task Status] 查询视频任务:', {
      user: session.user.email,
      taskId
    });

    // 3. 调用 Evolink API 查询任务状态
    const response = await evolinkAxios.get(`/v1/tasks/${taskId}`);

    const taskData = response.data;
    log(`[Video Task Status] 任务状态: ${taskData.status}, 进度: ${taskData.progress}`);

    // 4. 转换响应格式，适配前端期望的格式
    const responseData: Record<string, any> = {
      taskId: taskData.id,
      status: taskData.status,
      progress: taskData.progress || 0,
    };

    // 如果任务完成，添加视频 URL
    if (taskData.status === 'completed' && taskData.results && taskData.results.length > 0) {
      responseData.status = 'success';  // 前端期望的状态名
      responseData.videoUrl = taskData.results[0];
      log('[Video Task Status] 视频生成完成:', taskData.results[0]);
    }

    // 如果任务失败
    if (taskData.status === 'failed') {
      responseData.error = taskData.error || '视频生成失败';
      log('[Video Task Status] 任务失败:', taskData.error);
    }

    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: responseData
    });

  } catch (error: any) {
    logError('[Video Task Status] 查询失败:', error);
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
