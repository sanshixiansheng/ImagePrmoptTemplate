/**
 * Generations API
 * 
 * GET /api/generations - 获取用户的生成记录列表
 * POST /api/generations - 创建新的生成记录
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createGeneration,
  getUserGenerations,
  countUserGenerations,
} from "@/lib/generations-service";
import { log, logError } from "@/lib/logger";

/**
 * GET - 获取用户的生成记录
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { code: 401, message: "未登录" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;

    log("[Generations API] 查询记录:", { userEmail, limit, offset, status });

    // 查询数据
    const generations = await getUserGenerations(userEmail, {
      limit,
      offset,
      status,
    });

    // 获取总数
    const total = await countUserGenerations(userEmail, status);

    return NextResponse.json({
      code: 1000,
      message: "success",
      data: {
        generations,
        total,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    logError("[Generations API] 查询失败:", error);
    return NextResponse.json(
      { code: 500, message: error.message || "查询失败" },
      { status: 500 }
    );
  }
}

/**
 * POST - 创建新的生成记录
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { code: 401, message: "未登录" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const userId = (session.user as any).uuid || (session.user as any).id || userEmail;

    // 获取请求体
    const body = await request.json();
    const { prompt, model, provider, taskId, metadata } = body;

    if (!prompt) {
      return NextResponse.json(
        { code: 400, message: "prompt 不能为空" },
        { status: 400 }
      );
    }

    log("[Generations API] 创建记录:", {
      userEmail,
      prompt: prompt.substring(0, 50) + "...",
      model,
      provider,
    });

    // 创建记录
    const generation = await createGeneration({
      prompt,
      userEmail,
      userId,
      model,
      provider,
      taskId,
      metadata,
    });

    return NextResponse.json({
      code: 1000,
      message: "创建成功",
      data: generation,
    });
  } catch (error: any) {
    logError("[Generations API] 创建失败:", error);
    return NextResponse.json(
      { code: 500, message: error.message || "创建失败" },
      { status: 500 }
    );
  }
}
