# Gemini 2.5 Flash 集成指南

## 概述

你的项目现在已经成功集成了 **Gemini 2.5 Flash**（通过 OpenRouter），实现了以下功能：

### ✅ 已实现的功能

| 功能 | API 路由 | 前端页面 | 状态 |
|-----|---------|---------|------|
| 提示词增强 | `/api/text-to-prompt/magic-enhance` | `/text-to-prompt` | ✅ 完成 |
| 提示词编辑 | `/api/text-to-prompt/edit` | `/text-to-prompt` | ✅ 完成 |
| 提示词翻译 | `/api/text-to-prompt/translate` | `/text-to-prompt` | ✅ 完成 |
| 图像反推提示词 | `/api/image-to-prompt/analyze` | `/image-to-prompt` | ✅ 完成 |

---

## 配置信息

### 环境变量（已配置）

```env
# AI Models
OPENROUTER_API_KEY=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
```

### 模型信息

- **模型名称**: `google/gemini-2.5-flash`
- **提供商**: OpenRouter
- **类型**: 多模态理解模型（Chat + Vision）
- **能力**:
  - ✅ 文本对话
  - ✅ 图像理解
  - ✅ 视频理解
  - ✅ 音频理解
  - ❌ 不能生成图片（只能理解）

---

## 功能详解

### 1️⃣ Magic Enhance（提示词增强）

**用途**: 将简单提示词自动优化为详细、专业的提示词

**API**: `POST /api/text-to-prompt/magic-enhance`

**请求示例**:
```json
{
  "prompt": "一只猫"
}
```

**响应示例**:
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "original": "一只猫",
    "enhanced": "A majestic orange tabby cat with piercing green eyes, sitting elegantly on a weathered stone wall at golden hour, soft warm lighting, photorealistic, 4K resolution, detailed fur texture, shallow depth of field, professional photography"
  }
}
```

---

### 2️⃣ Edit（提示词编辑）

**用途**: 根据用户指令修改提示词

**API**: `POST /api/text-to-prompt/edit`

**请求示例**:
```json
{
  "prompt": "A cat sitting on a wall",
  "instruction": "Change the cat to a dog"
}
```

**响应示例**:
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "original": "A cat sitting on a wall",
    "instruction": "Change the cat to a dog",
    "edited": "A dog sitting on a wall"
  }
}
```

---

### 3️⃣ Translate（提示词翻译）

**用途**: 将提示词翻译为其他语言

**API**: `POST /api/text-to-prompt/translate`

**请求示例**:
```json
{
  "prompt": "A majestic cat sitting on a stone wall at sunset",
  "targetLanguage": "zh"
}
```

**响应示例**:
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "original": "A majestic cat sitting on a stone wall at sunset",
    "targetLanguage": "zh",
    "translated": "一只威严的猫坐在日落时分的石墙上"
  }
}
```

**支持的语言**:
- `en` - English
- `zh` - Chinese (Simplified)
- `zh-CN` - Chinese (Simplified)
- `zh-TW` - Chinese (Traditional)
- `ja` - Japanese
- `ko` - Korean
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ar` - Arabic
- `hi` - Hindi

---

### 4️⃣ Image-to-Prompt（图像反推提示词）

**用途**: 上传图片，AI 分析后生成提示词或描述

**API**: `POST /api/image-to-prompt/analyze`

**请求示例**:
```json
{
  "imageUrl": "https://pub-bdf54eeaabfa45439d502f7c16d1a167.r2.dev/uploads/2026/02/1770474345675-whrn8v.png",
  "mode": "prompt"
}
```

**Mode 参数说明**:
- `prompt` - 生成简洁的图像生成提示词（推荐）
- `describe` - 生成详细的图像描述
- `detailed` - 生成综合性、技术性的详细提示词

**响应示例**:
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "imageUrl": "https://...",
    "mode": "prompt",
    "result": "A majestic orange tabby cat with green eyes, sitting on a weathered stone wall, golden hour lighting, photorealistic, 4K resolution, detailed fur texture, shallow depth of field"
  }
}
```

---

## 测试步骤

### 测试 1: Text-to-Prompt（提示词增强）

1. 访问：`http://localhost:3006/zh/text-to-prompt`
2. 在输入框输入：`一只猫`
3. 点击 **"Magic Enhance"** 按钮
4. 等待 2-3 秒
5. 查看增强后的提示词

**预期结果**: 简单的"一只猫"被扩展为详细的英文提示词

---

### 测试 2: 提示词编辑

1. 在同一页面，输入：`A cat sitting on a wall`
2. 点击 **"Edit with AI"** 按钮
3. 在弹出框输入指令：`Change the cat to a dog`
4. 点击 **"Edit Prompt"**
5. 查看修改后的提示词

**预期结果**: 提示词中的 "cat" 被替换为 "dog"

---

### 测试 3: 提示词翻译

1. 在同一页面，输入英文提示词
2. 点击 **"Translate"** 按钮
3. 选择目标语言（如：Chinese）
4. 点击 **"Translate Prompt"**
5. 查看翻译结果

**预期结果**: 英文提示词被翻译为中文

---

### 测试 4: Image-to-Prompt（图像反推）

1. 访问：`http://localhost:3006/zh/image-to-prompt`
2. 点击上传区域，选择一张图片
3. 等待图片上传完成（会显示 toast 提示）
4. 选择 Analysis Mode:
   - **Prompt**: 生成简洁提示词
   - **Describe**: 生成详细描述
   - **Detailed**: 生成技术性提示词
5. 点击 **"Analyze Image"**
6. 等待 3-5 秒
7. 查看分析结果

**预期结果**: AI 根据图片内容生成对应的提示词或描述

---

## 完整工作流演示

### 场景：从零开始生成一张图片

**第 1 步**: 简单输入 → **Magic Enhance**
- 用户输入：`一只猫`
- Gemini 2.5 Flash 优化：
  ```
  A majestic orange tabby cat with piercing green eyes, 
  sitting elegantly on a weathered stone wall at sunset, 
  soft golden hour lighting, photorealistic, 4K
  ```

**第 2 步**: 优化提示词 → **生成图片**
- 使用优化后的提示词
- 调用 Nano Banana 2 Lite（Evolink）
- 生成高质量图片

**第 3 步**: 分析生成结果 → **Image-to-Prompt**
- 上传生成的图片
- Gemini 2.5 Flash 分析
- 反推出精确提示词
- 用于生成相似风格的新图片

---

## 常见问题

### Q1: Gemini 2.5 Flash 能生成图片吗？

**A**: ❌ **不能！**

Gemini 2.5 Flash 是**多模态理解模型**，它只能：
- ✅ 看懂图片、视频、音频
- ✅ 生成文本（描述、对话、提示词）
- ❌ 不能生成图片

**生成图片**需要用：
- ✅ Nano Banana 2 Lite（你已有）
- 或 Google Imagen 4（需要配置）

---

### Q2: 我有几个大模型？

**A**: 你现在有 **2 个大模型**：

1. **Nano Banana 2 Lite**（Evolink）
   - 类型：图像生成模型
   - 用途：文生图、图生图
   - API: ✅ 已实现
   - Key: ⚠️ 需要配置 `EVOLINK_API_KEY`

2. **Gemini 2.5 Flash**（OpenRouter）
   - 类型：多模态理解模型
   - 用途：提示词优化、图像理解、对话
   - API: ✅ 已实现（4 个 API）
   - Key: ✅ 已配置

---

### Q3: 页面标题为什么显示"Nano Banana - Gemini 2.5 Flash"？

**A**: 这是**前端显示错误**！

- 页面标题混淆了两个模型
- 实际上页面只使用 **Nano Banana** 生成图片
- Gemini 2.5 Flash 用在 `/text-to-prompt` 和 `/image-to-prompt` 页面

**建议**: 修改页面标题，只显示 "Nano Banana Pro"

---

### Q4: 我的项目能生成图片了吗？

**A**: ✅ **能！** 但需要补充 Evolink API Key

**步骤**:
1. 去 [Evolink](https://evolink.ai) 注册账号
2. 获取 API Key
3. 添加到 `.env.local`:
   ```env
   EVOLINK_API_KEY=sk-your-evolink-key
   EVOLINK_API_URL=https://api.evolink.ai
   ```
4. 重启 Next.js 服务器

---

## 六大模型分类（你的作业要求）

### 你现在的情况：

| 序号 | 类型 | 你有的模型 | 状态 | 在六大类型中 |
|-----|------|-----------|------|-------------|
| 1️⃣ | **图像生成** | Nano Banana 2 Lite | ⚠️ 缺 API Key | ✅ 算一个 |
| 2️⃣ | **文本大模型** | Gemini 2.5 Flash | ✅ 可用 | ✅ 算一个 |
| 3️⃣ | **多模态** | Gemini 2.5 Flash | ✅ 可用 | ✅ 算一个 |
| 4️⃣ | **视频生成** | 无 | ❌ 缺失 | ❌ 需要补充 |
| 5️⃣ | **图像编辑** | 无 | ❌ 缺失 | ❌ 需要补充 |
| 6️⃣ | **3D 生成** | 无 | ❌ 缺失 | ❌ 需要补充 |

**注意**: Gemini 2.5 Flash 既可以当**文本大模型**，也可以当**多模态模型**，因为它支持文本对话 + 图像理解。

**你目前有**: 3 个大模型能力（图像生成、文本、多模态）
**你还缺**: 3 个大模型能力（视频、图像编辑、3D）

---

## 下一步计划

### 方案 A：4 种核心能力（推荐）

```
1️⃣ 图像生成：Nano Banana ✅
2️⃣ 文本大模型：Gemini 2.5 Flash ✅
3️⃣ 多模态：Gemini 2.5 Flash ✅
4️⃣ 图像生成（备选）：Stable Diffusion XL ← 需要添加
```

**成本**: 低（约 $5）
**时间**: 1-2 小时

---

### 方案 B：6 种完整能力（豪华版）

```
1️⃣ 图像生成：Nano Banana ✅
2️⃣ 文本大模型：Gemini 2.5 Flash ✅
3️⃣ 多模态：Gemini 2.5 Flash ✅
4️⃣ 视频生成：Luma Dream Machine ← 需要添加
5️⃣ 图像编辑：DALL-E 2 Edit ← 需要添加
6️⃣ 3D 生成：Meshy AI ← 需要添加
```

**成本**: 中等（约 $20-30）
**时间**: 3-5 小时

---

## 测试清单

在演示作业前，请测试以下功能：

- [ ] Google OAuth 登录
- [ ] Text-to-Prompt 提示词增强
- [ ] Text-to-Prompt 提示词编辑
- [ ] Text-to-Prompt 提示词翻译
- [ ] Image-to-Prompt 图像分析（3 种模式）
- [ ] 图片上传到 R2
- [ ] Nano Banana 图像生成（需要 API Key）
- [ ] Supabase 数据库记录

---

## 技术栈总结

### 你的项目现在使用：

**AI 能力**:
- 图像生成：Nano Banana 2 Lite（Evolink）
- 文本 + 多模态：Gemini 2.5 Flash（OpenRouter）

**基础设施**:
- 认证：NextAuth.js + Google OAuth
- 数据库：Supabase（PostgreSQL）
- 存储：Cloudflare R2
- 前端：Next.js 15 + React 19 + TypeScript
- UI：Tailwind CSS + Shadcn UI

---

## 最后更新

- **日期**: 2026-02-07
- **状态**: Text-to-Prompt 和 Image-to-Prompt 功能已完成
- **待办**: 配置 Evolink API Key，测试图像生成
