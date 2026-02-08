import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { newStorage } from "@/lib/storage";
import { log, logError } from "@/lib/logger";

/**
 * 文件上传 API
 * POST /api/upload
 * 
 * 支持功能：
 * - 用户认证检查
 * - 文件大小限制
 * - 文件类型验证
 * - 自动生成唯一文件名
 * - 上传到 Cloudflare R2
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          code: 401, 
          message: "未登录，请先登录" 
        },
        { status: 401 }
      );
    }

    log("[Upload API] 收到上传请求，用户:", session.user.email);

    // 2. 获取上传的文件
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { 
          code: 400, 
          message: "未上传文件" 
        },
        { status: 400 }
      );
    }

    // 3. 验证文件大小（限制为 10MB）
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          code: 400, 
          message: "文件大小超过限制（最大 10MB）" 
        },
        { status: 400 }
      );
    }

    // 4. 验证文件类型（仅允许图片）
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          code: 400, 
          message: "不支持的文件类型，仅支持 JPG、PNG、GIF、WebP 格式" 
        },
        { status: 400 }
      );
    }

    log("[Upload API] 文件验证通过:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`,
    });

    // 5. 将文件转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split(".").pop() || "jpg";
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

    // 可选：按日期分文件夹存储
    const date = new Date();
    const folder = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    const fileKey = `uploads/${folder}/${uniqueFileName}`;

    log("[Upload API] 准备上传文件:", fileKey);

    // 7. 上传到 R2
    const storage = newStorage();
    const result = await storage.uploadFile({
      body: buffer,
      key: fileKey,
      contentType: file.type,
      disposition: "inline", // 可以在浏览器中直接预览
    });

    log("[Upload API] 上传成功:", result);

    // 8. 返回成功响应
    return NextResponse.json({
      code: 1000,
      message: "文件上传成功",
      data: {
        fileKey: result.key,
        fileName: result.filename,
        fileUrl: result.url,
        fileSize: file.size,
        fileType: file.type,
        bucket: result.bucket,
      },
    });
  } catch (error: any) {
    logError("[Upload API] 上传失败:", error);

    // 返回详细错误信息（开发环境）
    const isDev = process.env.NODE_ENV === "development";
    
    return NextResponse.json(
      {
        code: 500,
        message: "服务器内部错误",
        error: isDev ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * 获取上传配置信息（可选）
 * GET /api/upload
 */
export async function GET() {
  return NextResponse.json({
    code: 1000,
    message: "Upload API is ready",
    config: {
      maxFileSize: "10MB",
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      bucket: process.env.STORAGE_BUCKET || "Not configured",
    },
  });
}
