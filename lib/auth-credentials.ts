/**
 * 服务端用户验证服务
 * 用于 NextAuth Credentials Provider
 *
 * 注意：此文件只能在服务端使用（API Routes）
 * bcryptjs 不能在客户端运行
 */

import bcrypt from "bcryptjs";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getIsoTimestr } from "@/lib/time";

export interface UserCredentials {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

/**
 * 验证用户凭据（用于登录）
 * @param email 用户邮箱
 * @param password 用户密码
 * @returns 用户信息或 null
 */
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<UserCredentials | null> {
  try {
    const supabase = getSupabaseServer();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      console.error("[VerifyCredentials] User not found:", email);
      return null;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.error("[VerifyCredentials] Invalid password for:", email);
      return null;
    }

    // 更新最后登录时间
    await supabase
      .from("users")
      .update({
        last_signin_at: getIsoTimestr(),
      })
      .eq("id", user.id);

    console.log("[VerifyCredentials] User authenticated:", email);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: null,
    };
  } catch (error) {
    console.error("[VerifyCredentials] Error:", error);
    return null;
  }
}

/**
 * 通过邮箱获取用户（用于检查用户是否存在）
 */
export async function getUserByEmail(email: string) {
  try {
    const supabase = getSupabaseServer();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, email_verified, is_active")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("[GetUserByEmail] Error:", error);
    return null;
  }
}
