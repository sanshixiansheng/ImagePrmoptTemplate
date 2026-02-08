/**
 * Single Generation API
 * 
 * GET /api/generations/[id] - 获取单条记录
 * PUT /api/generations/[id] - 更新记录
 * DELETE /api/generations/[id] - 删除记录
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getGenerationById,
  updateGeneration,
  deleteGeneration,
} from "@/lib/generations-service";
import { log, logError } from "@/lib/logger";

/**
 * GET - 获取单条记录
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证用户登录
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { code: 401, message: "未登录" },
        { status: 401 }
      );
    }

    log("[Generation API] 获取记录:", { id });

    // 获取记录
    const generation = await getGenerationById(id);

    // 验证权限（只能查看自己的记录）
    if (generation.user_email !== session.user.email) {
      return NextResponse.json(
        { code: 403, message: "无权访问" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      code: 1000,
      message: "success",
      data: generation,
    });
  } catch (error: any) {
    logError("[Generation API] 获取失败:", error);
    return NextResponse.json(
      { code: 500, message: error.message || "获取失败" },
      { status: 500 }
    );
  }
}

/**
 * PUT - 更新记录
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证用户登录
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { code: 401, message: "未登录" },
        { status: 401 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { result, status, errorMessage, metadata } = body;

    log("[Generation API] 更新记录:", { id, updates: body });

    // 先检查记录是否属于当前用户
    const existingGeneration = await getGenerationById(id);
    if (existingGeneration.user_email !== session.user.email) {
      return NextResponse.json(
        { code: 403, message: "无权操作" },
        { status: 403 }
      );
    }

    // 更新记录
    const generation = await updateGeneration(id, {
      result,
      status,
      errorMessage,
      metadata,
    });

    return NextResponse.json({
      code: 1000,
      message: "更新成功",
      data: generation,
    });
  } catch (error: any) {
    logError("[Generation API] 更新失败:", error);
    return NextResponse.json(
      { code: 500, message: error.message || "更新失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 删除记录
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证用户登录
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { code: 401, message: "未登录" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    log("[Generation API] 删除记录:", { id, userEmail });

    // 删除记录（会自动验证权限）
    await deleteGeneration(id, userEmail);

    return NextResponse.json({
      code: 1000,
      message: "删除成功",
    });
  } catch (error: any) {
    logError("[Generation API] 删除失败:", error);
    return NextResponse.json(
      { code: 500, message: error.message || "删除失败" },
      { status: 500 }
    );
  }
}
