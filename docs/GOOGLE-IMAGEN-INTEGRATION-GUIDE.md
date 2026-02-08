# Google Imagen 4 集成指南

## 📝 概述

本指南详细说明如何集成 **Google Imagen 4 系列**（Standard / Ultra / Fast）图像生成模型到本项目。

**当前状态**：
- ✅ **前端 UI 已完成**：模型选项已显示在 `txt-to-image/[model]/page.tsx`
- 🔜 **后端 API 待实现**：需要创建对应的 API 路由
- 🚀 **用户体验良好**：点击时显示"即将推出"提示，不会报错

---

## 🎯 集成步骤概览

### 步骤 1：获取 Google Cloud API 凭证
### 步骤 2：配置环境变量
### 步骤 3：创建后端 API 路由
### 步骤 4：测试功能
### 步骤 5：移除"即将推出"提示

---

## 📋 详细步骤

### 步骤 1：获取 Google Cloud API 凭证

#### 1.1 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Vertex AI API**：
   - 导航到 **APIs & Services** > **Library**
   - 搜索 "Vertex AI API"
   - 点击 **Enable**

#### 1.2 创建服务账号密钥

1. 导航到 **IAM & Admin** > **Service Accounts**
2. 点击 **Create Service Account**
3. 填写信息：
   - **Name**: `imagen-api-service`
   - **Role**: `Vertex AI User`
4. 点击 **Create and Continue**
5. 创建密钥：
   - 点击刚创建的服务账号
   - 进入 **Keys** 标签
   - 点击 **Add Key** > **Create New Key**
   - 选择 **JSON** 格式
   - 下载密钥文件（例如：`imagen-credentials.json`）

#### 1.3 获取项目信息

记下以下信息（后续需要）：
- **Project ID**：例如 `my-project-123456`
- **Location**：例如 `us-central1`（根据需要选择）

---

### 步骤 2：配置环境变量

#### 2.1 编辑 `.env.local` 文件

在项目根目录的 `.env.local` 文件中添加以下内容：

```env
# ============================================
# Google Cloud Vertex AI (Imagen 4)
# ============================================

# Google Cloud 项目 ID
GOOGLE_CLOUD_PROJECT_ID="your-project-id"

# Google Cloud 区域（例如 us-central1）
GOOGLE_CLOUD_LOCATION="us-central1"

# 服务账号密钥 JSON 文件路径（相对于项目根目录）
# 方法 A：使用文件路径
GOOGLE_APPLICATION_CREDENTIALS="./config/imagen-credentials.json"

# 方法 B：直接使用 Base64 编码的 JSON（推荐用于 Vercel 部署）
# GOOGLE_CREDENTIALS_BASE64="eyJ0eXBlIjoic2VydmljZV9hY2NvdW50..."
```

#### 2.2 存储密钥文件（推荐方法 A）

创建 `config/` 文件夹并放置密钥文件：

```bash
mkdir config
# 将下载的 imagen-credentials.json 移动到此文件夹
```

⚠️ **重要**：确保 `.gitignore` 包含此行：
```
config/
*.json
```

#### 2.3 Base64 编码（推荐用于生产环境）

如果部署到 Vercel/Cloudflare Pages，推荐使用 Base64 编码：

**Windows PowerShell**：
```powershell
$json = Get-Content imagen-credentials.json -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
[System.Convert]::ToBase64String($bytes)
```

**macOS/Linux**：
```bash
base64 -i imagen-credentials.json
```

将输出复制到 `GOOGLE_CREDENTIALS_BASE64` 环境变量。

---

### 步骤 3：创建后端 API 路由

#### 3.1 安装 Google Cloud SDK

```bash
npm install @google-cloud/vertexai --legacy-peer-deps
```

#### 3.2 创建 Vertex AI 客户端工具

创建 `lib/vertex-ai-client.ts`：

```typescript
import { VertexAI } from '@google-cloud/vertexai';

// 初始化 Vertex AI 客户端
export function initializeVertexAI() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID is not configured');
  }

  // 处理凭证
  let credentials;
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    // 方法 B：从 Base64 解码
    const jsonString = Buffer.from(
      process.env.GOOGLE_CREDENTIALS_BASE64,
      'base64'
    ).toString('utf-8');
    credentials = JSON.parse(jsonString);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // 方法 A：从文件路径读取
    credentials = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } else {
    throw new Error('Google credentials not configured');
  }

  const vertexAI = new VertexAI({
    project: projectId,
    location: location,
    googleAuthOptions: {
      credentials: credentials,
    },
  });

  return vertexAI;
}

// 导出可用的 Imagen 4 模型
export const IMAGEN_MODELS = {
  'imagen-4-standard': 'imagen-4.0-001',     // 标准版
  'imagen-4-ultra': 'imagen-4.0-ultra-001',  // 超清版
  'imagen-4-fast': 'imagen-4.0-fast-001',    // 快速版
} as const;

export type ImagenModelId = keyof typeof IMAGEN_MODELS;
```

#### 3.3 创建文生图 API 路由

创建 `app/api/ai/google-imagen/text-to-image/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { initializeVertexAI, IMAGEN_MODELS, type ImagenModelId } from '@/lib/vertex-ai-client';

export const runtime = 'nodejs'; // Vertex AI SDK 需要 Node.js 运行时

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 401 },
        { status: 401 }
      );
    }

    // 2. 解析请求参数
    const { prompt, model, aspectRatio } = await request.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required', code: 400 },
        { status: 400 }
      );
    }

    // 3. 验证模型
    const modelKey = model as ImagenModelId;
    const vertexModelName = IMAGEN_MODELS[modelKey];

    if (!vertexModelName) {
      return NextResponse.json(
        { error: `Unsupported model: ${model}`, code: 400 },
        { status: 400 }
      );
    }

    console.log('[Google Imagen] 开始生成:', {
      user: session.user.email,
      model: modelKey,
      vertexModel: vertexModelName,
      prompt: prompt.substring(0, 50) + '...',
    });

    // 4. 初始化 Vertex AI
    const vertexAI = initializeVertexAI();
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: vertexModelName,
    });

    // 5. 转换纵横比格式
    const aspectRatioMap: Record<string, string> = {
      '1:1': '1:1',
      '16:9': '16:9',
      '9:16': '9:16',
      '4:3': '4:3',
      '3:4': '3:4',
    };

    const imageAspectRatio = aspectRatioMap[aspectRatio] || '1:1';

    // 6. 调用 Imagen 4 生成图片
    const result = await generativeModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt.trim(),
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['image'],
        aspectRatio: imageAspectRatio,
        // 可选参数：
        // numberOfImages: 1,
        // negativePrompt: '...',
      },
    });

    // 7. 提取生成的图片
    const response = result.response;
    const images: string[] = [];

    if (response.candidates && response.candidates.length > 0) {
      for (const candidate of response.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              // 将 base64 图片转换为 data URL
              const mimeType = part.inlineData.mimeType || 'image/png';
              const base64Image = part.inlineData.data;
              const dataUrl = `data:${mimeType};base64,${base64Image}`;
              images.push(dataUrl);
            }
          }
        }
      }
    }

    if (images.length === 0) {
      console.error('[Google Imagen] 没有生成图片');
      return NextResponse.json(
        {
          code: 500,
          message: 'No images generated',
          data: null,
        },
        { status: 500 }
      );
    }

    console.log('[Google Imagen] 生成成功:', images.length, '张图片');

    // 8. 返回结果
    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        images: images,
        model: modelKey,
        prompt: prompt,
      },
    });
  } catch (error: any) {
    console.error('[Google Imagen] 错误:', error);

    return NextResponse.json(
      {
        code: 500,
        message: error.message || 'Image generation failed',
        data: null,
      },
      { status: 500 }
    );
  }
}
```

#### 3.4 创建图生图 API 路由（可选）

创建 `app/api/ai/google-imagen/image-to-image/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { initializeVertexAI, IMAGEN_MODELS, type ImagenModelId } from '@/lib/vertex-ai-client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 401 },
        { status: 401 }
      );
    }

    // 2. 解析 FormData
    const formData = await request.formData();
    const referenceImage = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const model = formData.get('model') as string;
    const aspectRatio = formData.get('aspectRatio') as string;

    if (!referenceImage || !prompt) {
      return NextResponse.json(
        { error: 'Reference image and prompt are required', code: 400 },
        { status: 400 }
      );
    }

    // 3. 验证模型
    const modelKey = model as ImagenModelId;
    const vertexModelName = IMAGEN_MODELS[modelKey];

    if (!vertexModelName) {
      return NextResponse.json(
        { error: `Unsupported model: ${model}`, code: 400 },
        { status: 400 }
      );
    }

    console.log('[Google Imagen I2I] 开始生成:', {
      user: session.user.email,
      model: modelKey,
      imageSize: referenceImage.size,
    });

    // 4. 初始化 Vertex AI
    const vertexAI = initializeVertexAI();
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: vertexModelName,
    });

    // 5. 读取参考图片为 base64
    const imageBuffer = await referenceImage.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // 6. 转换纵横比格式
    const aspectRatioMap: Record<string, string> = {
      '1:1': '1:1',
      '16:9': '16:9',
      '9:16': '9:16',
      '4:3': '4:3',
      '3:4': '3:4',
    };

    const imageAspectRatio = aspectRatioMap[aspectRatio] || '1:1';

    // 7. 调用 Imagen 4 生成图片（带参考图）
    const result = await generativeModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              // 参考图片
              inlineData: {
                mimeType: referenceImage.type,
                data: base64Image,
              },
            },
            {
              // 文本提示
              text: prompt.trim(),
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['image'],
        aspectRatio: imageAspectRatio,
      },
    });

    // 8. 提取生成的图片
    const response = result.response;
    const images: string[] = [];

    if (response.candidates && response.candidates.length > 0) {
      for (const candidate of response.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              const base64OutputImage = part.inlineData.data;
              const dataUrl = `data:${mimeType};base64,${base64OutputImage}`;
              images.push(dataUrl);
            }
          }
        }
      }
    }

    if (images.length === 0) {
      console.error('[Google Imagen I2I] 没有生成图片');
      return NextResponse.json(
        {
          code: 500,
          message: 'No images generated',
          data: null,
        },
        { status: 500 }
      );
    }

    console.log('[Google Imagen I2I] 生成成功:', images.length, '张图片');

    // 9. 返回结果
    return NextResponse.json({
      code: 1000,
      message: 'success',
      data: {
        images: images,
        model: modelKey,
        prompt: prompt,
      },
    });
  } catch (error: any) {
    console.error('[Google Imagen I2I] 错误:', error);

    return NextResponse.json(
      {
        code: 500,
        message: error.message || 'Image-to-image generation failed',
        data: null,
      },
      { status: 500 }
    );
  }
}
```

---

### 步骤 4：修改前端调用逻辑

#### 4.1 更新文生图逻辑

编辑 `app/[locale]/(default)/txt-to-image/[model]/page.tsx`：

**找到第 488 行附近的"即将推出"提示部分**，将其替换为真实的 API 调用：

```typescript
// 🔜 Google Imagen 系列模型：即将推出
if (model.includes('imagen-4')) {
  console.log('[Google Imagen] 使用 Google Imagen API');

  const response = await fetch('/api/ai/google-imagen/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: model,  // 'imagen-4-standard', 'imagen-4-ultra', 'imagen-4-fast'
      aspectRatio: aspectRatio
    })
  });

  const result = await response.json();
  console.log('[Google Imagen] API 响应:', result);

  if (result.code !== 1000) {
    throw new Error(result.message || 'Generation failed');
  }

  if (result.data?.images && result.data.images.length > 0) {
    setGeneratedImage(result.data.images[0]);
    toast.success(t('generation_success'));
  } else {
    throw new Error('No images generated');
  }
  return;
}
```

#### 4.2 更新图生图逻辑

**找到第 573 行附近的图生图"即将推出"提示部分**，将其替换为：

```typescript
// 🔜 Google Imagen 系列模型：即将推出
if (i2iModel.includes('imagen-4')) {
  console.log('[ImageToImage] 使用 Google Imagen I2I API');

  const formData = new FormData();
  formData.append('image', referenceImage);
  formData.append('prompt', i2iPrompt);
  formData.append('model', i2iModel);
  formData.append('aspectRatio', i2iAspectRatio);

  const response = await fetch('/api/ai/google-imagen/image-to-image', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  console.log('[ImageToImage] API 响应:', result);

  if (result.code !== 1000) {
    throw new Error(result.message || 'Generation failed');
  }

  if (result.data?.images && result.data.images.length > 0) {
    setGeneratedI2IImage(result.data.images[0]);
    toast.success(t('generation_success'));
  } else {
    throw new Error('No images generated');
  }
  setIsGeneratingI2I(false);
  return;
}
```

---

### 步骤 5：测试功能

#### 5.1 重启开发服务器

```bash
npm run dev
# 或
pnpm dev
```

#### 5.2 测试文生图

1. 访问 `http://localhost:3006/en/txt-to-image/google-imagen`
2. 选择任意 Imagen 4 模型（Standard / Ultra / Fast）
3. 输入提示词，例如：`A serene sunset over mountains`
4. 点击"Generate"
5. 查看控制台输出和生成的图片

#### 5.3 测试图生图

1. 切换到"Image to Image"标签页
2. 上传参考图片
3. 输入提示词
4. 选择 Imagen 4 模型
5. 点击"Generate"

#### 5.4 排查错误

**常见错误**：

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `GOOGLE_CLOUD_PROJECT_ID is not configured` | 环境变量未设置 | 检查 `.env.local` |
| `Vertex AI API has not been used` | API 未启用 | 在 Google Cloud Console 启用 Vertex AI API |
| `Permission denied` | 服务账号权限不足 | 确保服务账号有 `Vertex AI User` 角色 |
| `Invalid credentials` | 凭证文件错误 | 检查 JSON 文件路径或 Base64 编码 |

---

## 🚀 部署到生产环境

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量：
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_CLOUD_LOCATION`
   - `GOOGLE_CREDENTIALS_BASE64`（推荐）

2. 部署：
   ```bash
   vercel --prod
   ```

### Cloudflare Pages 部署

1. 在 Cloudflare Pages 设置中添加环境变量
2. 使用 Node.js 兼容模式：
   ```bash
   pnpm cf:build
   pnpm cf:deploy
   ```

---

## 📊 费用估算

**Google Imagen 4 定价**（截至 2026 年）：

| 模型 | 每张图片价格 |
|------|-------------|
| Imagen 4 Standard | ~$0.04 |
| Imagen 4 Ultra | ~$0.08 |
| Imagen 4 Fast | ~$0.02 |

**建议**：
- 开发测试时使用 **Fast** 版本
- 生产环境根据用户需求选择
- 设置每日配额限制，避免意外费用

---

## 🔧 优化建议

### 1. 图片存储优化

生成的图片是 base64 格式，建议上传到 R2 或其他存储：

```typescript
// 在 API 路由中添加
import { Storage } from '@/lib/storage';

// 将 base64 转换为 Buffer
const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
const buffer = Buffer.from(base64Data, 'base64');

// 上传到 R2
const storage = new Storage();
const fileName = `imagen-${Date.now()}.png`;
await storage.uploadFile({
  body: buffer,
  key: `generations/${fileName}`,
  contentType: 'image/png',
  disposition: 'inline'
});

const publicUrl = `${process.env.STORAGE_DOMAIN}/generations/${fileName}`;
images.push(publicUrl);
```

### 2. 添加生成记录

将生成记录保存到 Supabase：

```typescript
import { createGenerationRecord } from '@/lib/generations-service';

await createGenerationRecord({
  user_id: session.user.id,
  model: modelKey,
  prompt: prompt,
  image_url: publicUrl,
  provider: 'google-imagen',
  status: 'completed'
});
```

### 3. 添加错误重试

```typescript
import pRetry from 'p-retry';

const result = await pRetry(
  async () => {
    return await generativeModel.generateContent({ ... });
  },
  {
    retries: 3,
    onFailedAttempt: (error) => {
      console.warn('[Google Imagen] 重试:', error.attemptNumber);
    }
  }
);
```

---

## 📚 参考资源

- [Google Cloud Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)
- [Imagen 4 API 参考](https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview)
- [Node.js SDK 文档](https://googleapis.dev/nodejs/vertexai/latest/)
- [定价详情](https://cloud.google.com/vertex-ai/pricing)

---

## ❓ 常见问题

**Q: 为什么前端显示模型但点击没反应？**  
A: 这是正常的！当前是"即将推出"状态，完成上述步骤后即可使用。

**Q: 必须用 Google Cloud 吗？有免费额度吗？**  
A: 是的，Imagen 4 仅在 Google Cloud Vertex AI 上提供。新用户有 $300 免费额度。

**Q: 可以用其他提供商的 Imagen API 吗（如 OpenRouter）？**  
A: 目前 OpenRouter 不支持 Imagen 4。你可以关注他们的更新。

**Q: 图片生成速度如何？**  
A: 
- **Fast**: ~5-10 秒
- **Standard**: ~15-30 秒
- **Ultra**: ~30-60 秒

**Q: 如何选择使用哪个版本？**  
A: 
- 需要快速预览 → **Fast**
- 需要高质量输出 → **Standard**
- 需要超高清细节 → **Ultra**

---

## 🎉 完成集成后

✅ 前端 UI 已显示模型  
✅ 后端 API 已实现  
✅ 用户可以正常生成图片  
✅ 数据库记录已保存

**恭喜你完成集成！** 🚀

---

**最后更新**: 2026-02-06  
**作者**: AI 助手 for ImagePromptTemplate 项目
