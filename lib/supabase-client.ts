/**
 * Supabase 客户端工具
 * 
 * 用于前端（客户端）调用 Supabase
 * 使用 ANON_KEY，只能访问用户自己的数据（受 RLS 保护）
 */

import { createClient } from "@supabase/supabase-js";

// 获取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase client environment variables");
}

// 创建客户端实例（前端使用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

/**
 * 类型定义
 */

export interface Generation {
  id: string;
  prompt: string;
  result: string | null;
  model: string | null;
  provider: string | null;
  user_id: string;
  user_email: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  task_id: string | null;
  error_message: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}
