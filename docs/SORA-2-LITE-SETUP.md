# Sora 2 Lite 视频生成集成指南

## 📝 概述

**Sora 2 Lite** 是由 Evolink 提供的视频生成模型，基于 OpenAI Sora 2 技术，支持文本生成视频（Text-to-Video）和图片生成视频（Image-to-Video）。

---

## ✅ 集成完成状态

### 已完成：

1. ✅ **环境变量配置**：`EVOLINK_API_KEY` 已设置（与 Nano Banana 共用）
2. ✅ **视频模型列表 API**：`/api/ai/video-models`
3. ✅ **创建视频任务 API**：`/api/ai/video-generate/create`
4. ✅ **查询任务状态 API**：`/api/ai/video-generate/task-status`
5. ✅ **前端页面**：`/video-generate/[model]/page.tsx`

### 可用功能：

- ✅ **文本生成视频**（Text-to-Video）
- ✅ **图片生成视频**（Image-to-Video）
- ✅ **多种纵横比**（16:9、9:16、1:1、4:3、3:4）
- ✅ **多种时长**（5秒、10秒）
- ✅ **任务轮询机制**（自动查询生成进度）

---

## 🚀 使用指南

### 1️⃣ 访问视频生成页面

```
http://localhost:3006/en/video-generate/all
```

或指定 Sora 2 模型：

```
http://localhost:3006/en/video-generate/sora-2
```

---

### 2️⃣ 文本生成视频（Text-to-Video）

**步骤**：

1. **登录**：点击右上角使用 Google 登录
2. **输入提示词**（例如）：
   ```
   A cat playing piano in a cozy living room, soft lighting, cinematic
   ```
3. **选择参数**：
   - **模型**：Sora 2 Lite
   - **时长**：5秒 或 10秒
   - **纵横比**：16:9（横屏）、9:16（竖屏）、1:1（正方形）
   - **分辨率**：480p、720p、1080p
4. **点击 "Generate Video" 按钮**
5. **等待生成**（约 2-5 分钟）
   - 进度条会显示当前进度
   - 系统每 5 秒轮询一次任务状态
6. **观看视频**：生成完成后自动播放

---

### 3️⃣ 图片生成视频（Image-to-Video）

**步骤**：

1. **切换到 "Image to Video" 标签页**
2. **上传参考图片**：
   - 点击 "Upload Image" 上传
   - 支持 JPG、PNG 格式
   - 最大 10MB
3. **输入提示词**（例如）：
   ```
   Zoom in slowly, add gentle camera movement
   ```
4. **选择参数**（同上）
5. **点击 "Generate Video" 按钮**
6. **等待生成**（约 2-5 分钟）

---

## 📊 API 使用详情

### 创建视频任务

**请求**：

```typescript
POST /api/ai/video-generate/create
Content-Type: application/json
Authorization: <session-from-nextauth>

// 文本生成视频
{
  "prompt": "A cat playing piano",
  "model": "sora-2",
  "duration": "5",
  "resolution": "720p",
  "aspectRatio": "16:9",
  "generateAudio": false
}

// 图片生成视频（带 imageUrl）
{
  "prompt": "Zoom in slowly",
  "model": "sora-2",
  "aspectRatio": "16:9",
  "imageUrl": "https://pub-xxx.r2.dev/uploads/xxx.jpg"
}
```

**响应**：

```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "taskId": "task-unified-1757165031-uyujaw3d",
    "status": "pending",
    "progress": 0
  }
}
```

---

### 查询任务状态

**请求**：

```
GET /api/ai/video-generate/task-status?taskId=task-unified-xxx
Authorization: <session-from-nextauth>
```

**响应（处理中）**：

```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "taskId": "task-unified-xxx",
    "status": "processing",
    "progress": 45
  }
}
```

**响应（完成）**：

```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "taskId": "task-unified-xxx",
    "status": "success",
    "progress": 100,
    "videoUrl": "https://evolink.ai/.../video.mp4"
  }
}
```

---

## 🔄 生成流程

### 完整流程图：

```
用户输入提示词 + 选择参数
    ↓
前端调用: POST /api/ai/video-generate/create
    ↓
后端调用: POST https://api.evolink.ai/v1/videos/generations
    ↓
Evolink 返回任务 ID: task-unified-xxx
    ↓
前端开始轮询: GET /api/ai/video-generate/task-status?taskId=xxx
    ↓
每 5 秒轮询一次，最多 60 次（5 分钟）
    ↓
任务状态变为 "completed"
    ↓
返回视频 URL
    ↓
前端显示视频播放器
```

---

## 🎯 Sora 2 Lite 特点

### 支持的功能

| 功能 | 支持状态 | 说明 |
|------|---------|------|
| **文本生成视频** | ✅ | 从文本描述生成视频 |
| **图片生成视频** | ✅ | 从静态图片生成动态视频 |
| **多种纵横比** | ✅ | 16:9、9:16、1:1、4:3、3:4 |
| **多种时长** | ✅ | 5秒、10秒 |
| **多种分辨率** | ✅ | 480p、720p、1080p |
| **音频生成** | ⚠️ | 取决于 Evolink API 支持 |

### 技术参数

- **最大时长**：10秒
- **推荐分辨率**：720p（平衡质量和速度）
- **生成时间**：约 2-5 分钟
- **轮询间隔**：5秒
- **最大轮询次数**：60次（5分钟超时）

---

## 💡 提示词建议

### 文本生成视频（Text-to-Video）

**好的提示词**：
```
A serene mountain landscape at sunrise, camera slowly panning left, 
golden light illuminating snow-capped peaks, cinematic, 4K quality
```

**包含的要素**：
- ✅ **主体**：mountain landscape
- ✅ **时间/环境**：at sunrise
- ✅ **动作**：camera slowly panning left
- ✅ **光线**：golden light
- ✅ **风格**：cinematic, 4K

**避免**：
- ❌ 太复杂的场景
- ❌ 多个快速切换的镜头
- ❌ 特别长的描述

---

### 图片生成视频（Image-to-Video）

**好的提示词**：
```
Zoom in slowly, soft breeze blowing, natural camera movement
```

**包含的要素**：
- ✅ **镜头运动**：Zoom in slowly
- ✅ **场景动作**：soft breeze blowing
- ✅ **运镜风格**：natural camera movement

**避免**：
- ❌ 与原图差异太大的描述
- ❌ 复杂的物体变化
- ❌ 剧烈的场景转换

---

## 🔍 调试日志

### 成功的日志示例

**浏览器控制台（F12）**：

```
[T2V] 开始生成视频: {
  prompt: "A cat playing piano",
  model: "sora-2",
  duration: "5",
  aspectRatio: "16:9"
}

[T2V] API 响应: {
  code: 1000,
  data: { taskId: "task-unified-xxx", status: "pending" }
}

[T2V] 任务状态: { status: "processing", progress: 25 }
[T2V] 任务状态: { status: "processing", progress: 60 }
[T2V] 任务状态: { status: "processing", progress: 95 }
[T2V] ✅ 视频生成成功，设置结果...
[T2V] status: success videoUrl: https://evolink.ai/.../video.mp4
```

**服务器终端**：

```
[Video Generate] 收到请求: {
  user: 'user@gmail.com',
  model: 'sora-2',
  prompt: 'A cat playing piano',
  duration: '5',
  aspectRatio: '16:9'
}

[Video Generate] 使用 Evolink Sora 2 Lite API
[Video Generate] 调用 Evolink API: {
  model: 'sora-2',
  prompt: 'A cat playing piano',
  aspect_ratio: '16:9'
}

[Video Generate] Evolink 响应: { id: 'task-unified-xxx', status: 'pending' }
POST /api/ai/video-generate/create 200 in 1234ms

[Video Task Status] 查询视频任务: { taskId: 'task-unified-xxx' }
[Video Task Status] 任务状态: processing 进度: 45
GET /api/ai/video-generate/task-status?taskId=task-unified-xxx 200 in 234ms

[Video Task Status] 任务状态: completed 进度: 100
[Video Task Status] 视频生成完成: https://evolink.ai/.../video.mp4
GET /api/ai/video-generate/task-status?taskId=task-unified-xxx 200 in 198ms
```

---

## ❓ 常见问题

### Q1: 视频生成需要多长时间？

**答**：
- **5秒视频**：约 2-3 分钟
- **10秒视频**：约 3-5 分钟
- 视具体内容复杂度而定

### Q2: 为什么进度条到 95% 就不动了？

**答**：这是正常现象！
- 视频渲染的最后阶段（编码、上传）比较耗时
- 保持耐心，通常再等 30-60 秒就会完成

### Q3: 任务超时怎么办？

**答**：
- 系统最多等待 5 分钟（60 次轮询 × 5 秒）
- 如果超时，可以：
  - 简化提示词
  - 降低分辨率
  - 减少视频时长
  - 重试

### Q4: 生成失败的常见原因？

**答**：
- ❌ 提示词包含敏感内容
- ❌ 提示词过于复杂
- ❌ 参考图片分辨率过低（I2V）
- ❌ API 配额不足

### Q5: 可以生成带音频的视频吗？

**答**：
- 前端有 "Enable Audio" 选项
- 需要确认 Evolink API 是否支持
- 如不支持，音频选项不会影响生成

---

## 🎬 测试案例

### 测试案例 1：简单场景

**提示词**：
```
A red car driving on a winding mountain road, aerial view, sunny day
```

**参数**：
- 时长：5秒
- 纵横比：16:9
- 分辨率：720p

**预期时间**：2-3 分钟

---

### 测试案例 2：自然景观

**提示词**：
```
Ocean waves crashing on a sandy beach, sunset, slow motion, cinematic
```

**参数**：
- 时长：10秒
- 纵横比：16:9
- 分辨率：1080p

**预期时间**：3-5 分钟

---

### 测试案例 3：图生视频

**上传图片**：一张风景照

**提示词**：
```
Camera slowly zooms in, clouds moving in the sky, natural lighting changes
```

**参数**：
- 时长：5秒
- 纵横比：16:9

**预期时间**：2-3 分钟

---

## 🔧 环境变量

### 已配置（共用 Nano Banana）

```env
# Evolink (Nano Banana Pro + Sora 2 Lite)
EVOLINK_API_URL=https://api.evolink.ai
EVOLINK_API_KEY=sk-uQn2jQybLkkTzmTXMspz8YefngnSDdnxghGw8Hq2y0iTClIU
```

**共用一个 API Key** 的好处：
- ✅ 管理简单（只需一个 Key）
- ✅ 统一计费
- ✅ 相同的认证逻辑

---

## 📋 Evolink API 调用详情

### 创建视频任务

**端点**：`POST https://api.evolink.ai/v1/videos/generations`

**请求头**：
```
Authorization: Bearer sk-uQn2jQybLkkTzmTXMspz8YefngnSDdnxghGw8Hq2y0iTClIU
Content-Type: application/json
```

**请求体（文本生成视频）**：
```json
{
  "model": "sora-2",
  "prompt": "A cat playing piano",
  "aspect_ratio": "16:9"
}
```

**请求体（图片生成视频）**：
```json
{
  "model": "sora-2",
  "prompt": "Camera zooms in slowly",
  "aspect_ratio": "16:9",
  "image_url": "https://pub-xxx.r2.dev/uploads/image.jpg"
}
```

**响应**：
```json
{
  "created": 1757165031,
  "id": "task-unified-1757165031-uyujaw3d",
  "model": "sora-2",
  "object": "video.generation.task",
  "progress": 0,
  "status": "pending",
  "task_info": {
    "can_cancel": true,
    "estimated_time": 180
  },
  "type": "video"
}
```

---

### 查询任务状态

**端点**：`GET https://api.evolink.ai/v1/tasks/{taskId}`

**请求头**：
```
Authorization: Bearer sk-uQn2jQybLkkTzmTXMspz8YefngnSDdnxghGw8Hq2y0iTClIU
```

**响应（处理中）**：
```json
{
  "id": "task-unified-xxx",
  "status": "processing",
  "progress": 45,
  "type": "video"
}
```

**响应（完成）**：
```json
{
  "id": "task-unified-xxx",
  "status": "completed",
  "progress": 100,
  "results": [
    "https://evolink.ai/storage/videos/xxx.mp4"
  ],
  "type": "video"
}
```

---

## 🎯 与图像生成的对比

| 项目 | 图像生成（Nano Banana） | 视频生成（Sora 2 Lite） |
|------|----------------------|---------------------|
| **API 端点** | `/v1/images/generations` | `/v1/videos/generations` |
| **提供商** | Evolink | Evolink |
| **API Key** | 共用 | 共用 |
| **生成时间** | 30-60 秒 | 2-5 分钟 |
| **轮询间隔** | 2 秒 | 5 秒 |
| **最大轮询次数** | 120 次（4 分钟） | 60 次（5 分钟） |
| **结果格式** | JPG/PNG URL | MP4 URL |

---

## 💰 费用估算

**Sora 2 Lite 定价**（参考 Evolink 官网）：

| 时长 | 分辨率 | 预估价格 |
|------|--------|---------|
| 5秒 | 720p | ~$0.10 |
| 10秒 | 720p | ~$0.20 |
| 5秒 | 1080p | ~$0.15 |
| 10秒 | 1080p | ~$0.30 |

**建议**：
- 开发测试时使用 **5秒 + 720p**
- 生产环境根据需求选择

---

## 🐛 排查错误

### 错误 1: `未登录`

**原因**：没有登录 Google 账号

**解决**：点击右上角登录

---

### 错误 2: `创建任务失败`

**可能原因**：
- API Key 无效
- 网络问题
- Evolink 服务异常

**排查**：
1. 检查 `.env.local` 中的 `EVOLINK_API_KEY`
2. 查看终端错误日志
3. 访问 Evolink 官网确认服务状态

---

### 错误 3: `任务超时`

**可能原因**：
- 生成时间超过 5 分钟
- 提示词过于复杂
- Evolink 服务繁忙

**解决**：
- 简化提示词
- 降低分辨率（1080p → 720p）
- 减少时长（10秒 → 5秒）
- 重试

---

## 📝 最佳实践

### 提示词编写

1. **简洁明了**：一句话描述核心内容
2. **包含运镜**：camera movement, zoom in/out
3. **风格描述**：cinematic, slow motion, aerial view
4. **光线描述**：golden hour, soft lighting, dramatic

### 参数选择

**快速测试**：
- 时长：5秒
- 分辨率：720p
- 纵横比：16:9

**高质量输出**：
- 时长：10秒
- 分辨率：1080p
- 纵横比：根据内容选择

---

## 🎉 完成！

### 当前状态：

✅ **Sora 2 Lite 视频生成功能已完全集成**

### 立即测试：

1. **访问**：`http://localhost:3006/en/video-generate/sora-2`
2. **登录 Google 账号**
3. **输入提示词**
4. **点击生成**
5. **等待 2-5 分钟**
6. **观看生成的视频**

---

**最后更新**: 2026-02-06  
**集成模型**: Sora 2 Lite (Evolink)  
**API 文档**: https://evolink.ai/sora-2
