/**
 * Generations 数据操作服务
 * 
 * 提供对 generations 表的 CRUD 操作
 */

import { supabaseServer } from "./supabase-server";
import { Generation } from "./supabase-client";
import { log, logError } from "./logger";

/**
 * 创建生成记录
 */
export async function createGeneration(data: {
  prompt: string;
  userEmail: string;
  userId: string;
  model?: string;
  provider?: string;
  taskId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    console.log("[Generations] Creating record for:", data.userEmail);

    const { data: generation, error } = await supabaseServer
      .from("generations")
      .insert([
        {
          prompt: data.prompt,
          user_id: data.userId,
          user_email: data.userEmail,
          model: data.model || null,
          provider: data.provider || null,
          task_id: data.taskId || null,
          status: "pending",
          metadata: data.metadata || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Generations] Insert error:", error.message || "Unknown error");
      throw new Error("Failed to create generation");
    }

    console.log("[Generations] Created successfully:", generation.id);
    return generation as Generation;
  } catch (error: any) {
    console.error("[Generations] Exception:", error.message || "Unknown error");
    throw new Error("Failed to create generation");
  }
}

/**
 * 更新生成记录
 */
export async function updateGeneration(
  id: string,
  updates: {
    result?: string;
    status?: "pending" | "processing" | "completed" | "failed";
    errorMessage?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    log("[Generations] 更新记录:", { id, updates });

    const updateData: any = {};
    if (updates.result !== undefined) updateData.result = updates.result;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.errorMessage !== undefined) updateData.error_message = updates.errorMessage;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { data: generation, error } = await supabaseServer
      .from("generations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logError("[Generations] 更新失败:", error);
      throw error;
    }

    log("[Generations] 更新成功:", generation);
    return generation as Generation;
  } catch (error: any) {
    logError("[Generations] 更新异常:", error);
    throw new Error(`更新记录失败: ${error.message}`);
  }
}

/**
 * 查询用户的生成记录
 */
export async function getUserGenerations(userEmail: string, options?: {
  limit?: number;
  offset?: number;
  status?: string;
}) {
  try {
    console.log("[Generations] Querying records for:", userEmail);

    let query = supabaseServer
      .from("generations")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false });

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: generations, error } = await query;

    if (error) {
      console.error("[Generations] Query error:", error.message || "Unknown error");
      throw new Error("Failed to query generations");
    }

    console.log("[Generations] Query success, count:", generations?.length || 0);
    return (generations || []) as Generation[];
  } catch (error: any) {
    console.error("[Generations] Exception:", error.message || "Unknown error");
    throw new Error("Failed to query generations");
  }
}

/**
 * 根据 ID 获取单条记录
 */
export async function getGenerationById(id: string) {
  try {
    const { data: generation, error } = await supabaseServer
      .from("generations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logError("[Generations] 获取记录失败:", error);
      throw error;
    }

    return generation as Generation;
  } catch (error: any) {
    logError("[Generations] 获取记录异常:", error);
    throw new Error(`获取记录失败: ${error.message}`);
  }
}

/**
 * 根据 task_id 获取记录
 */
export async function getGenerationByTaskId(taskId: string) {
  try {
    const { data: generation, error } = await supabaseServer
      .from("generations")
      .select("*")
      .eq("task_id", taskId)
      .single();

    if (error) {
      logError("[Generations] 通过 taskId 获取失败:", error);
      throw error;
    }

    return generation as Generation;
  } catch (error: any) {
    logError("[Generations] 通过 taskId 获取异常:", error);
    return null;
  }
}

/**
 * 删除记录
 */
export async function deleteGeneration(id: string, userEmail: string) {
  try {
    log("[Generations] 删除记录:", { id, userEmail });

    const { error } = await supabaseServer
      .from("generations")
      .delete()
      .eq("id", id)
      .eq("user_email", userEmail);

    if (error) {
      logError("[Generations] 删除失败:", error);
      throw error;
    }

    log("[Generations] 删除成功");
    return true;
  } catch (error: any) {
    logError("[Generations] 删除异常:", error);
    throw new Error(`删除记录失败: ${error.message}`);
  }
}

/**
 * 统计用户的生成次数
 */
export async function countUserGenerations(userEmail: string, status?: string) {
  try {
    let query = supabaseServer
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_email", userEmail);

    if (status) {
      query = query.eq("status", status);
    }

    const { count, error } = await query;

    if (error) {
      logError("[Generations] 统计失败:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    logError("[Generations] 统计异常:", error);
    return 0;
  }
}
