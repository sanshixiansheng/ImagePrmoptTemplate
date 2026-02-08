# Supabase 数据库集成指南

## 概述

本指南帮助你在项目中完整集成 Supabase 数据库，实现 AI 生成记录的存储和管理。

---

## 📋 配置步骤

### 第 1 步：获取 Supabase Service Role Key

#### 为什么需要 Service Role Key？

| Key 类型 | 用途 | 权限 |
|---------|------|------|
| **ANON_KEY** | 前端使用 | 受 RLS 限制，只能访问用户自己的数据 |
| **SERVICE_ROLE_KEY** | 后端 API 使用 | 可以绕过 RLS，访问所有数据 |

#### 如何获取：

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard

2. **选择你的项目**
   - 项目名称：`rxskzvjddqmhgqfarzxc`

3. **进入 Settings**
   - 左侧菜单 → **Settings** → **API**

4. **复制 Service Role Key**
   - 找到 **"Project API keys"** 部分
   - 找到 **"service_role"** 密钥
   - 点击 **"Reveal"** 显示
   - 复制完整的密钥（以 `eyJ` 开头）

5. **添加到 .env.local**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...你的密钥
   ```

---

### 第 2 步：创建数据库表

#### 方式 A：使用 Supabase SQL Editor（推荐）

1. **Supabase Dashboard** → 左侧菜单 → **SQL Editor**

2. **点击 "New query"**

3. **复制并执行以下 SQL**：

```sql
-- 执行项目中的建表脚本
-- 文件位置: supabase/migrations/001_create_generations_table.sql
```

或者直接在 SQL Editor 中粘贴：

```sql
-- 创建 generations 表
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  result TEXT,
  model VARCHAR(100),
  provider VARCHAR(50),
  user_id UUID NOT NULL,
  user_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  task_id VARCHAR(255),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_generations_user_email ON generations(user_email);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);

-- 启用 RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Users can view their own generations" ON generations
  FOR SELECT USING (
    user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

CREATE POLICY "Users can insert their own generations" ON generations
  FOR INSERT WITH CHECK (
    user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

CREATE POLICY "Users can update their own generations" ON generations
  FOR UPDATE USING (
    user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

CREATE POLICY "Users can delete their own generations" ON generations
  FOR DELETE USING (
    user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );
```

4. **点击 "Run"** 执行

5. **验证表创建成功**
   - 左侧菜单 → **Table Editor**
   - 应该能看到 `generations` 表

#### 方式 B：使用命令行（如果安装了 Supabase CLI）

```bash
supabase migration new create_generations_table
# 将 SQL 粘贴到生成的文件中
supabase db push
```

---

### 第 3 步：更新环境变量

编辑 `.env.local`，确保包含：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://rxskzvjddqmhgqfarzxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...你的ANON_KEY
SUPABASE_URL=https://rxskzvjddqmhgqfarzxc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...你的SERVICE_ROLE_KEY
```

**重要**：`SUPABASE_SERVICE_ROLE_KEY` 必须配置，否则后端 API 无法工作！

---

### 第 4 步：重启开发服务器

```bash
# 停止服务器 (Ctrl+C)
npm run dev
```

---

### 第 5 步：测试功能

访问测试页面：
```
http://localhost:3006/zh/test/generations
```

测试操作：
1. ✅ 创建记录 - 填写提示词并提交
2. ✅ 查看列表 - 自动显示你的记录
3. ✅ 更新状态 - 点击"标记完成"
4. ✅ 删除记录 - 点击"删除"

---

## 📁 已创建的文件

| 文件路径 | 说明 |
|---------|------|
| ✅ `supabase/migrations/001_create_generations_table.sql` | 建表 SQL 脚本 |
| ✅ `lib/supabase-client.ts` | 前端 Supabase 客户端 |
| ✅ `lib/supabase-server.ts` | 后端 Supabase 客户端 |
| ✅ `lib/generations-service.ts` | CRUD 操作服务 |
| ✅ `app/api/generations/route.ts` | 查询和创建 API |
| ✅ `app/api/generations/[id]/route.ts` | 单条记录操作 API |
| ✅ `app/[locale]/(default)/test/generations/page.tsx` | 测试页面 |

---

## 🎯 API 端点说明

### GET /api/generations
- **功能**：获取用户的生成记录列表
- **参数**：`limit`, `offset`, `status`
- **认证**：需要登录

### POST /api/generations
- **功能**：创建新的生成记录
- **参数**：`prompt`, `model`, `provider`, `taskId`, `metadata`
- **认证**：需要登录

### GET /api/generations/[id]
- **功能**：获取单条记录
- **认证**：需要登录，只能查看自己的

### PUT /api/generations/[id]
- **功能**：更新记录（结果、状态等）
- **认证**：需要登录，只能更新自己的

### DELETE /api/generations/[id]
- **功能**：删除记录
- **认证**：需要登录，只能删除自己的

---

## 💻 在实际项目中使用

### 场景 1：AI 图像生成时保存记录

```typescript
// 在 app/api/ai/evolink/generate/route.ts 中

import { createGeneration, updateGeneration } from "@/lib/generations-service";

export async function POST(request: NextRequest) {
  const session = await auth();
  const { prompt, model } = await request.json();

  // 1. 创建数据库记录
  const generation = await createGeneration({
    prompt,
    userEmail: session.user.email!,
    userId: session.user.id,
    model: "nano-banana-2-lite",
    provider: "evolink",
  });

  // 2. 调用 AI 生成
  const response = await evolinkAxios.post("/v1/images/generations", {
    prompt,
    model,
  });

  const taskId = response.data.id;

  // 3. 更新记录（保存 taskId）
  await updateGeneration(generation.id, {
    status: "processing",
    metadata: { taskId },
  });

  return NextResponse.json({
    code: 1000,
    data: {
      generationId: generation.id,
      taskId,
    },
  });
}
```

### 场景 2：轮询任务状态并更新数据库

```typescript
// 在前端轮询时

const pollTaskStatus = async (generationId: string, taskId: string) => {
  const maxAttempts = 60;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await fetch(`/api/ai/evolink/task/${taskId}`);
    const result = await response.json();

    if (result.data.status === "completed") {
      // 更新数据库记录
      await fetch(`/api/generations/${generationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: result.data.results[0],
          status: "completed",
        }),
      });

      return result.data.results[0];
    }

    if (result.data.status === "failed") {
      // 更新失败状态
      await fetch(`/api/generations/${generationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "failed",
          errorMessage: "生成失败",
        }),
      });

      throw new Error("生成失败");
    }
  }
};
```

### 场景 3：显示用户的历史记录

```typescript
// 在用户个人中心页面

export default function MyGenerationsPage() {
  const [generations, setGenerations] = useState([]);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    const response = await fetch("/api/generations?limit=20");
    const result = await response.json();
    
    if (result.code === 1000) {
      setGenerations(result.data.generations);
    }
  };

  return (
    <div>
      <h1>我的创作历史</h1>
      {generations.map((gen) => (
        <div key={gen.id}>
          <p>{gen.prompt}</p>
          <img src={gen.result} alt="Generated" />
        </div>
      ))}
    </div>
  );
}
```

---

## 🔒 安全说明

### RLS（行级安全）策略

配置的 RLS 策略确保：
- ✅ 用户只能看到自己的记录
- ✅ 用户只能操作自己的记录
- ✅ 防止数据泄露和越权访问

### 关键点：

1. **前端使用 ANON_KEY**
   - 自动受 RLS 限制
   - 只能访问当前用户的数据

2. **后端使用 SERVICE_ROLE_KEY**
   - 可以绕过 RLS
   - 用于管理操作和后台任务

---

## ⚠️ 注意事项

### 1. Service Role Key 保密

```env
# ❌ 不要在前端暴露
# ❌ 不要提交到 Git
# ✅ 只在后端 API 中使用
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 2. 环境变量前缀

```env
# NEXT_PUBLIC_ 前缀 → 前端可访问
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# 无前缀 → 仅后端可访问
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # 不会暴露给前端
```

---

## 🎯 下一步操作清单

- [ ] 1. 获取 Supabase Service Role Key
- [ ] 2. 添加到 `.env.local`
- [ ] 3. 在 Supabase SQL Editor 中执行建表 SQL
- [ ] 4. 重启开发服务器
- [ ] 5. 访问 `http://localhost:3006/zh/test/generations` 测试
- [ ] 6. 集成到实际的 AI 生成流程中

---

## 🚀 实际应用场景

### 1. **AI 图像生成历史**
- 保存用户的每次生成请求
- 展示历史记录
- 支持重新生成

### 2. **用户数据统计**
- 统计生成次数
- 分析常用模型
- 计费依据

### 3. **任务追踪**
- 记录异步任务状态
- 失败重试
- 进度查询

### 4. **作品集**
- 用户的创作历史
- 公开分享
- 社交功能

---

## 📞 故障排查

### 错误：Missing Supabase environment variables

**原因**：缺少 `SUPABASE_SERVICE_ROLE_KEY`

**解决**：按照第 1 步获取并配置

### 错误：new row violates row-level security policy

**原因**：RLS 策略配置错误或用户信息不匹配

**解决**：
1. 检查 RLS 策略是否正确执行
2. 确认 `user_email` 字段与当前用户邮箱一致

### 表不存在

**原因**：建表 SQL 未执行

**解决**：在 Supabase SQL Editor 中执行建表脚本

---

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [RLS 策略指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js 集成指南](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**配置完成后，你的项目就有了完整的数据持久化能力！** 🎉
