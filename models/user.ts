import { supabase } from "./db";
import { User } from "@/types/user";
import { getSupabaseClient } from "@/models/db";

export async function insertUser(user: User): Promise<User> {
  console.log("[DB] Inserting new user into Supabase...");
  console.log("[DB] User data:", {
    uuid: user.uuid,
    email: user.email,
    nickname: user.nickname,
    signin_provider: user.signin_provider
  });

  const now = user.created_at || new Date().toISOString();
  const safeUuid = user.uuid || (user as any).id;
  const safeName =
    user.nickname ||
    (user as any).name ||
    (user.email ? user.email.split("@")[0] : "User");

  const payloadCandidates: Record<string, any>[] = [
    // Legacy schema payload
    { ...user },
    // Current schema payload observed in production database
    {
      id: safeUuid,
      uuid: safeUuid,
      email: user.email?.toLowerCase(),
      name: safeName,
      avatar_url: user.avatar_url || "",
      oauth_provider: user.signin_provider || null,
      oauth_account_id: user.signin_openid || null,
      last_signin_ip: user.signin_ip || "127.0.0.1",
      email_verified: true,
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    // Minimal fallback payload
    {
      id: safeUuid,
      uuid: safeUuid,
      email: user.email?.toLowerCase(),
      name: safeName,
      created_at: now,
      updated_at: now,
    },
  ];

  let lastError: any = null;
  for (const payload of payloadCandidates) {
    const { data, error } = await supabase
      .from("users")
      .insert([payload])
      .select("*")
      .single();

    if (!error && data) {
      const normalized = {
        ...(data as any),
        uuid: (data as any).uuid || (data as any).id,
        nickname: (data as any).nickname || (data as any).name,
        signin_provider: (data as any).signin_provider || (data as any).oauth_provider,
      } as User;

      console.log("[DB] User inserted successfully");
      console.log("[DB] Inserted user ID:", (data as any).id);
      console.log("[DB] Inserted user UUID:", normalized.uuid);
      return normalized;
    }

    lastError = error;
    console.error("[DB] Insert attempt failed:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
    });

    // Email unique conflict: fetch and return existing row.
    if (error?.code === "23505") {
      const existing = await findUserByEmail(user.email);
      if (existing) {
        return existing;
      }
    }
  }

  console.error("[DB] Error inserting user:", lastError);
  throw lastError;
}

export async function findUserByEmail(email: string, provider?: string): Promise<User | null> {
  console.log("[DB] Finding user by email:", email, "provider:", provider || "any");

  let query = supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1);

  // Provider filtering is intentionally skipped here to avoid schema mismatch
  // across environments (signin_provider vs oauth_provider). Email should be unique.

  const { data, error } = await query;

  if (error && error.code !== "PGRST116") {
    console.error("[DB] Error finding user by email:", error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log("[DB] User not found (PGRST116)");
    return null;
  }

  const raw = data[0] as any;
  const row = {
    ...raw,
    uuid: raw.uuid || raw.id,
    nickname: raw.nickname || raw.name,
    signin_provider: raw.signin_provider || raw.oauth_provider,
  } as User;

  console.log("[DB] User found:", {
    uuid: row.uuid,
    email: row.email,
    created_at: row.created_at,
  });

  return row;
}

function oauthUuidFromEmail(email: string): string {
  const input = email.trim().toLowerCase();
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;

  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= c;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }

  const hex =
    `${h1.toString(16).padStart(8, "0")}` +
    `${h2.toString(16).padStart(8, "0")}` +
    `${(h1 ^ h2).toString(16).padStart(8, "0")}` +
    `${Math.imul(h1, 0x27d4eb2d).toString(16).padStart(8, "0")}`;

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function syncOauthUserByEmail(params: {
  email: string;
  provider?: string;
  providerAccountId?: string;
  name?: string;
  avatarUrl?: string;
  signinIp?: string;
}): Promise<void> {
  const email = params.email?.trim().toLowerCase();
  if (!email) return;

  const now = new Date().toISOString();
  const safeIp = params.signinIp || "127.0.0.1";

  const existing = await findUserByEmail(email);
  if (!existing) {
    try {
      await insertUser({
        uuid: oauthUuidFromEmail(email),
        email,
        nickname: params.name || email.split("@")[0] || "User",
        avatar_url: params.avatarUrl || "",
        signin_type: "oauth",
        signin_provider: params.provider || "google",
        signin_openid: params.providerAccountId || "",
        signin_ip: safeIp,
        created_at: now,
        locale: "en",
      } as User);
    } catch (e) {
      console.error("[DB] OAuth ensure-user insert failed:", e);
    }
  }

  const payloadCandidates: Record<string, any>[] = [
    // Legacy schema
    {
      signin_provider: params.provider || null,
      signin_openid: params.providerAccountId || null,
      signin_ip: safeIp,
      nickname: params.name || undefined,
      avatar_url: params.avatarUrl || undefined,
      updated_at: now,
    },
    // Current schema
    {
      oauth_provider: params.provider || null,
      oauth_account_id: params.providerAccountId || null,
      last_signin_ip: safeIp,
      name: params.name || undefined,
      avatar_url: params.avatarUrl || undefined,
      updated_at: now,
    },
  ];

  for (const payload of payloadCandidates) {
    const { error } = await supabase.from("users").update(payload).eq("email", email);
    if (!error) {
      console.log("[DB] OAuth user sync success:", { email, provider: params.provider });
      return;
    }

    console.error("[DB] OAuth user sync attempt failed:", {
      email,
      code: error?.code,
      message: error?.message,
    });
  }
}

export async function findUserByUuid(uuid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error finding user by uuid:", error);
    return null;
  }

  return data as User | null;
}

export async function updateUser(uuid: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("uuid", uuid)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return data as User;
}

export async function getUsersTotal(): Promise<number | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("id");

  if (error) {
    return undefined;
  }

  return data?.length || 0;
}

export async function getUserCountByDate(
  startTime: string
): Promise<Map<string, number> | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", startTime)
    .order("created_at", { ascending: true });

  if (error) {
    return undefined;
  }

  // Group by date in memory since Supabase doesn't support GROUP BY directly
  const dateCountMap = new Map<string, number>();
  data.forEach((item: any) => {
    const date = item.created_at.split("T")[0];
    dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1);
  });

  return dateCountMap;
}

export async function getUsers(
  page: number = 1,
  limit: number = 50
): Promise<User[]> {
  const supabase = getSupabaseClient();
  const offset = (page - 1) * limit;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data as User[];
}

export async function getUsersByUuids(uuids: string[]): Promise<User[]> {
  if (!uuids || uuids.length === 0) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("uuid", uuids);

  if (error) {
    console.error("Error fetching users by uuids:", error);
    return [];
  }

  return data as User[];
}



