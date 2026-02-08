# 文件上传 API 文档

## 概述

这个 API 提供了安全的文件上传功能，支持将图片上传到 Cloudflare R2 存储。

## API 端点

### POST /api/upload

上传文件到 R2 存储

**认证要求**: 需要登录（使用 NextAuth session）

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| file | File | 是 | 要上传的文件 |

**文件限制**:

- 最大大小: 10MB
- 支持格式: JPG, PNG, GIF, WebP
- 其他格式会被拒绝

**成功响应** (200):

```json
{
  "code": 1000,
  "message": "文件上传成功",
  "data": {
    "fileKey": "uploads/2026/02/1707312345678-abc123.jpg",
    "fileName": "1707312345678-abc123.jpg",
    "fileUrl": "https://6211726a06a81200271bc624e042a08c.r2.cloudflarestorage.com/uploads/2026/02/1707312345678-abc123.jpg",
    "fileSize": 204800,
    "fileType": "image/jpeg",
    "bucket": "z-image"
  }
}
```

**错误响应**:

| 状态码 | 说明 | 示例响应 |
|--------|------|----------|
| 400 | 请求参数错误 | `{"code": 400, "message": "未上传文件"}` |
| 401 | 未登录 | `{"code": 401, "message": "未登录，请先登录"}` |
| 500 | 服务器错误 | `{"code": 500, "message": "服务器内部错误"}` |

### GET /api/upload

获取上传 API 配置信息

**认证要求**: 无

**成功响应** (200):

```json
{
  "code": 1000,
  "message": "Upload API is ready",
  "config": {
    "maxFileSize": "10MB",
    "allowedTypes": ["image/jpeg", "image/png", "image/gif", "image/webp"],
    "bucket": "z-image"
  }
}
```

## 使用示例

### JavaScript/TypeScript

```typescript
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  
  if (result.code === 1000) {
    console.log("上传成功！");
    console.log("文件 URL:", result.data.fileUrl);
    return result.data.fileUrl;
  } else {
    throw new Error(result.message);
  }
}
```

### React 组件示例

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function UploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.code === 1000) {
        toast.success("上传成功！");
        console.log("文件 URL:", result.data.fileUrl);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? "上传中..." : "上传"}
      </button>
    </div>
  );
}
```

### cURL 示例

```bash
curl -X POST http://localhost:3006/api/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@/path/to/image.jpg"
```

## 文件存储结构

上传的文件会按照以下结构存储：

```
uploads/
  └── 2026/
      └── 02/
          ├── 1707312345678-abc123.jpg
          ├── 1707312345679-def456.png
          └── ...
```

- 按年份和月份分文件夹
- 文件名格式: `{时间戳}-{随机字符串}.{扩展名}`
- 确保文件名唯一，避免冲突

## 安全特性

1. **用户认证**: 必须登录才能上传
2. **文件大小限制**: 最大 10MB
3. **文件类型验证**: 仅允许图片格式
4. **唯一文件名**: 自动生成，防止覆盖
5. **错误处理**: 完善的错误提示

## 环境变量配置

确保 `.env.local` 中配置了以下变量：

```env
# Storage 配置
STORAGE_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_BUCKET=your-bucket-name

# 可选：自定义域名
STORAGE_DOMAIN=https://cdn.yourdomain.com
```

## 故障排查

### 上传失败：401 未登录

**原因**: 用户未登录或 session 过期

**解决方案**: 
1. 确保用户已登录
2. 检查 NextAuth 配置是否正确
3. 查看浏览器 Cookie 是否正常

### 上传失败：500 服务器错误

**原因**: R2 配置错误或网络问题

**解决方案**:
1. 检查 `.env.local` 中的 R2 配置
2. 确认 R2 Access Key 和 Secret Key 正确
3. 检查服务器日志获取详细错误信息

### 文件类型被拒绝

**原因**: 文件类型不在允许列表中

**解决方案**:
1. 确保文件是图片格式（JPG, PNG, GIF, WebP）
2. 如需支持其他格式，修改 `ALLOWED_TYPES` 数组

## 扩展功能

### 添加进度条

```typescript
const handleUpload = async () => {
  const formData = new FormData();
  formData.append("file", file);

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      console.log(`上传进度: ${percentComplete.toFixed(2)}%`);
    }
  });

  xhr.open("POST", "/api/upload");
  xhr.send(formData);
};
```

### 支持多文件上传

修改 API 以接受多个文件：

```typescript
const files = formData.getAll("file") as File[];
const uploadPromises = files.map(file => uploadSingleFile(file));
const results = await Promise.all(uploadPromises);
```

## 相关文件

- API 实现: `app/api/upload/route.ts`
- Storage 工具: `lib/storage.ts`
- 使用示例: `app/api/upload/example-usage.tsx`

## 支持

如有问题，请查看：
1. 项目主文档: `README.md`
2. 环境配置指南: `CLAUDE.md`
3. 控制台日志获取详细错误信息
