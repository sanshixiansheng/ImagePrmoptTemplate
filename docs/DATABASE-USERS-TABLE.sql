-- ============================================
-- 用户认证表
-- 用于邮箱密码登录功能
-- ============================================

-- 创建 users 表
CREATE TABLE IF NOT EXISTS public.users (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 基本信息
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,

  -- OAuth 信息（可选，用于 Google 登录）
  oauth_provider VARCHAR(50),
  oauth_account_id VARCHAR(255),

  -- 登录信息
  last_signin_at TIMESTAMPTZ,
  last_signin_ip VARCHAR(45),

  -- 状态
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON public.users(oauth_provider, oauth_account_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看和修改自己的数据
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- 服务端策略：使用 service_role_key 可以绕过 RLS
-- (不需要额外策略，service_role_key 会自动绕过)

-- ============================================
-- 使用说明
-- ============================================
-- 1. 在 Supabase 控制台的 SQL Editor 中执行此脚本
-- 2. 或者使用 Supabase CLI: supabase db push
-- 3. 表创建后，NextAuth 的 Credentials Provider 会使用此表
