# 图片压缩功能设置指南

## 📝 概述

本项目的图片压缩功能支持 **PNG、JPEG、WebP** 三种格式，使用 **Sharp** 库进行高质量压缩。

---

## 🚀 快速开始

### 步骤 1：安装 Sharp 依赖

在项目根目录运行：

```bash
npm install sharp --legacy-peer-deps
```

或使用 pnpm：

```bash
pnpm add sharp
```

**为什么需要 Sharp？**
- Sharp 是 Node.js 中最快的图片处理库
- 支持多种格式（PNG、JPEG、WebP、TIFF 等）
- 提供高质量压缩算法
- 支持 mozjpeg 优化

---

### 步骤 2：重启开发服务器

安装完成后，**必须重启**开发服务器：

```bash
# 按 Ctrl + C 停止当前服务器
# 然后重新启动
npm run dev
```

---

### 步骤 3：测试功能

1. 访问：`http://localhost:3006/zh/image-compress`
2. 选择输出格式：
   - **Auto 自动**：自动选择 WebP（前端压缩）
   - **WebP**：前端压缩
   - **JPEG 格式**：后端 API 压缩 ✅
   - **PNG**：后端 API 压缩 ✅
3. 上传图片（最大 10MB）
4. 等待压缩完成
5. 点击 "Download" 下载压缩后的图片

---

## 🎯 压缩效果

### WebP 格式
- **质量**：85%
- **压缩比**：通常 30-50%
- **适用场景**：Web 展示、社交媒体

### JPEG 格式
- **质量**：85%
- **优化**：mozjpeg 算法
- **压缩比**：通常 20-40%
- **适用场景**：照片、复杂图像

### PNG 格式
- **质量**：80%
- **压缩级别**：9（最高）
- **压缩比**：通常 40-70%
- **适用场景**：透明图、图标、截图

---

## 📊 API 使用示例

### 请求格式

```typescript
POST /api/image-slimCompress
Content-Type: application/json

{
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "format": "jpeg"  // "png" | "jpeg" | "webp"
}
```

### 响应格式

```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "originalSize": 2048576,
    "compressedSize": 819200,
    "compressionRatio": 60,
    "format": "jpeg"
  }
}
```

---

## 🔧 技术细节

### 图片处理流程

```
用户上传图片
    ↓
选择输出格式
    ↓
┌─────────────┬──────────────┐
│  WebP       │  PNG / JPEG  │
│ (前端压缩)   │  (后端压缩)   │
├─────────────┼──────────────┤
│ Canvas API  │  Sharp 库    │
│ 质量: 85%   │  质量: 80-85%│
│ 前端执行    │  服务器执行   │
└─────────────┴──────────────┘
    ↓
生成压缩后的图片
    ↓
用户下载
```

### Sharp 配置参数

#### PNG 压缩
```typescript
.png({
  quality: 80,           // 质量 (0-100)
  compressionLevel: 9,   // 压缩级别 (0-9)
  palette: true,         // 使用调色板
})
```

#### JPEG 压缩
```typescript
.jpeg({
  quality: 85,           // 质量 (0-100)
  progressive: true,     // 渐进式加载
  optimizeScans: true,   // 优化扫描
  mozjpeg: true,        // 使用 mozjpeg
})
```

#### WebP 压缩
```typescript
.webp({
  quality: 85,           // 质量 (0-100)
  effort: 6,            // 压缩努力程度 (0-6)
})
```

### 尺寸限制

- **最大输入尺寸**：10MB
- **最大输出尺寸**：4096 x 4096 像素
- **超出限制**：自动缩放（保持纵横比）

---

## 🐛 常见问题

### Q1: 安装 Sharp 失败？

**Windows 用户**：
```bash
npm install --global windows-build-tools
npm install sharp --legacy-peer-deps
```

**macOS 用户**：
```bash
xcode-select --install
npm install sharp
```

**Linux 用户**：
```bash
sudo apt-get install -y libvips-dev
npm install sharp
```

### Q2: 压缩后文件反而变大？

**原因**：原图已经是高度优化的格式（如已经是 WebP）

**解决**：
- 尝试不同的输出格式
- 调整质量参数（在 API 代码中修改）

### Q3: 压缩速度慢？

**优化方法**：
- 减小输入图片尺寸
- 降低 `effort` 参数（WebP）
- 降低 `compressionLevel` 参数（PNG）

### Q4: 服务器报错 "Cannot find module 'sharp'"

**解决**：
1. 确认已安装 Sharp：`npm list sharp`
2. 重启开发服务器
3. 清除缓存：`npm run dev -- --reset-cache`

### Q5: 部署到 Vercel/Cloudflare 失败？

**Vercel**：
- Sharp 在 Vercel 上可以正常工作
- 确保 `package.json` 包含 Sharp 依赖

**Cloudflare Pages**：
- Cloudflare Workers 不支持 Sharp
- 使用 Cloudflare Images API 替代
- 或使用前端 WebP 压缩

---

## 📈 性能优化

### 1. 批量压缩优化

当前实现支持批量上传，但**串行处理**每张图片。如需优化：

```typescript
// 并行处理多张图片
const results = await Promise.all(
  files.map(file => compressImage(file, format))
);
```

### 2. 缓存压缩结果

为避免重复压缩：

```typescript
// 使用文件哈希作为缓存键
const hash = await getFileHash(file);
const cached = await redis.get(hash);
if (cached) return cached;
```

### 3. CDN 加速

压缩后的图片建议上传到 CDN：

```typescript
// 上传到 R2 或其他对象存储
const url = await uploadToR2(compressedBlob);
```

---

## 🔒 安全考虑

### 文件类型验证

API 已验证：
- ✅ 只接受图片 MIME 类型
- ✅ 限制文件大小（10MB）
- ✅ 防止恶意文件上传

### 内存管理

Sharp 会自动管理内存：
- ✅ 流式处理大图片
- ✅ 自动释放缓冲区
- ✅ 避免内存泄漏

---

## 📚 参考资源

- [Sharp 官方文档](https://sharp.pixelplumbing.com/)
- [WebP 格式说明](https://developers.google.com/speed/webp)
- [mozjpeg 压缩算法](https://github.com/mozilla/mozjpeg)
- [Canvas API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

## 🎉 完成！

现在你的图片压缩功能已经完全可用了！

**测试步骤**：
1. ✅ 安装 Sharp：`npm install sharp --legacy-peer-deps`
2. ✅ 重启服务器：`npm run dev`
3. ✅ 访问：`http://localhost:3006/zh/image-compress`
4. ✅ 上传图片并测试所有格式

如有问题，请查看浏览器控制台和服务器终端的日志！🚀

---

**最后更新**: 2026-02-06  
**作者**: AI 助手
