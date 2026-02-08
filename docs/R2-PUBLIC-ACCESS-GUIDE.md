# Cloudflare R2 公开访问配置指南

## 问题描述

上传文件后得到 URL 如：
```
https://z-image.6211726a06a81200271bc624e042a08c.r2.cloudflarestorage.com/uploads/2026/02/xxx.png
```

但访问时显示错误：
```xml
<Error>
  <Code>InvalidArgument</Code>
  <Message>Authorization</Message>
</Error>
```

**原因**：R2 存储桶默认是私有的，需要配置公开访问权限。

---

## 解决方案 1：配置公开访问（推荐 - 最简单）

### 步骤：

1. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com/

2. **进入 R2 页面**
   - 左侧菜单 → **R2**
   - 或直接访问：https://dash.cloudflare.com/?to=/:account/r2

3. **选择你的存储桶**
   - 点击存储桶名称：`z-image`

4. **配置公开访问**
   - 点击 **"Settings"（设置）** 标签
   - 找到 **"Public Access"** 部分
   - 点击 **"Allow Access"** 按钮
   - 确认启用

5. **（可选）配置 CORS**
   如果需要从网页直接访问，还需要配置 CORS：
   
   在 Settings 中找到 CORS Policy，添加：
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": [],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### ✅ 完成后

刷新浏览器，再次访问你的图片 URL，应该能正常显示了！

---

## 解决方案 2：配置自定义域名（推荐 - 用于生产环境）

使用自己的域名访问图片，例如：`https://cdn.yourdomain.com/xxx.png`

### 步骤：

1. **进入 R2 存储桶设置**
   - Cloudflare Dashboard → R2 → 选择 `z-image`

2. **连接自定义域名**
   - 点击 **"Settings"** 标签
   - 找到 **"Custom Domains"** 部分
   - 点击 **"Connect Domain"**

3. **输入域名**
   - 例如：`cdn.yourdomain.com`
   - 点击 **"Continue"**

4. **Cloudflare 自动配置 DNS**
   - 会自动创建 CNAME 记录
   - 等待几分钟生效

5. **更新项目配置**
   
   编辑 `.env.local`，添加：
   ```env
   STORAGE_DOMAIN=https://cdn.yourdomain.com
   ```

6. **重启开发服务器**
   ```bash
   npm run dev
   ```

### ✅ 完成后

上传的文件 URL 会自动变成：
```
https://cdn.yourdomain.com/uploads/2026/02/xxx.png
```

---

## 解决方案 3：使用预签名 URL（临时访问）

如果你的存储桶必须保持私有，可以使用预签名 URL。

### 特点：
- ✅ 存储桶保持私有，更安全
- ✅ 可以设置链接过期时间
- ❌ URL 会很长且包含签名参数
- ❌ 链接有时效性（默认 7 天）

### 使用方法：

1. **调用预签名 URL API**

创建新的 API 端点：`app/api/upload/signed-url/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { newStorage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: "未登录" }, { status: 401 });
    }

    const { fileKey } = await request.json();

    if (!fileKey) {
      return NextResponse.json({ code: 400, message: "缺少 fileKey 参数" }, { status: 400 });
    }

    const storage = newStorage();
    const signedUrl = await storage.getSignedUrl({
      key: fileKey,
      expiresIn: 7 * 24 * 60 * 60, // 7 天
    });

    return NextResponse.json({
      code: 1000,
      message: "success",
      data: {
        signedUrl,
        expiresIn: 7 * 24 * 60 * 60,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { code: 500, message: error.message },
      { status: 500 }
    );
  }
}
```

2. **在前端使用**

```typescript
// 上传完成后，获取预签名 URL
const response = await fetch("/api/upload/signed-url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ fileKey: uploadResult.data.fileKey }),
});

const { data } = await response.json();
console.log("可访问的 URL:", data.signedUrl);
```

---

## 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **公开访问** | 配置简单，URL 简洁 | 任何人都可访问 | 公开内容（产品图、文章配图等） |
| **自定义域名** | 专业，支持 CDN | 需要域名 | 生产环境 |
| **预签名 URL** | 安全，可控制时效 | URL 复杂，有时效 | 私密内容（用户资料、付费内容） |

---

## 常见问题

### Q1: 配置公开访问后还是无法访问？

**检查步骤**：
1. 确认 "Allow Access" 已启用（显示绿色）
2. 清除浏览器缓存
3. 尝试无痕模式访问
4. 等待 1-2 分钟（DNS 传播）

### Q2: 自定义域名配置后显示 404？

**解决方法**：
1. 检查 DNS 是否生效：`nslookup cdn.yourdomain.com`
2. 确认域名在 Cloudflare 管理
3. 等待 DNS 传播（最多 24 小时）

### Q3: 预签名 URL 过期后怎么办？

重新调用 `/api/upload/signed-url` 生成新的 URL。

### Q4: 可以同时使用多种方案吗？

可以！例如：
- 公开内容用公开访问
- 私密内容用预签名 URL

---

## 测试验证

配置完成后，测试访问：

```bash
# 测试公开访问
curl -I https://z-image.6211726a06a81200271bc624e042a08c.r2.cloudflarestorage.com/uploads/2026/02/xxx.png

# 应该返回：
# HTTP/2 200
# content-type: image/png
# ...
```

---

## 相关资源

- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [R2 公开访问配置](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [自定义域名配置](https://developers.cloudflare.com/r2/buckets/public-buckets/#custom-domains)

---

**推荐：对于你的项目，最简单的方法是启用公开访问！**

只需要在 Cloudflare Dashboard 中点击几下，就能让所有上传的图片可以直接访问。
