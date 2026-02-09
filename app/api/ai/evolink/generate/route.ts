import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { evolinkAxios } from "@/lib/axios-config";
import { log, logError } from "@/lib/logger";
import { createHash } from "crypto";
import { supabase } from "@/models/db";
import { insertUser } from "@/models/user";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { addCreditHistory, consumeUserCredits, updateUserCredits } from "@/models/credit";

const DAILY_FREE_IMAGE_LIMIT = 1;
const IMAGE_PAID_CREDITS = 3;

function stableUuidFromEmail(email: string): string {
  const hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

async function resolveUserUuid(sessionUser: any): Promise<string | null> {
  // Fast path: if session already carries uuid, trust it.
  if (sessionUser?.uuid) {
    return String(sessionUser.uuid);
  }
  if (sessionUser?.id && typeof sessionUser.id === "string" && sessionUser.id.length >= 16) {
    return String(sessionUser.id);
  }

  if (!sessionUser?.email) {
    const base =
      String(sessionUser?.sub || sessionUser?.id || sessionUser?.name || "session-user")
        .trim()
        .toLowerCase();
    return stableUuidFromEmail(`${base}@session.local`);
  }

  const { data, error } = await supabase
    .from("users")
    .select("uuid")
    .eq("email", sessionUser.email)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!error && data && data.length > 0 && data[0]?.uuid) {
    return data[0].uuid as string;
  }

  // Self-heal path: create a user row when OAuth session exists but public.users has no row.
  try {
    const created = await insertUser({
      uuid: getUuid(),
      email: sessionUser.email,
      nickname: sessionUser.name || String(sessionUser.email).split("@")[0] || "User",
      avatar_url: sessionUser.image || "",
      signin_type: "oauth",
      signin_provider: sessionUser.signin_provider || "google",
      signin_openid: sessionUser.sub || sessionUser.id || "",
      signin_ip: "127.0.0.1",
      created_at: getIsoTimestr(),
      locale: "en",
    } as any);

    if (created?.uuid) {
      return created.uuid as string;
    }
  } catch (e) {
    console.error("[resolveUserUuid] failed to auto-create user:", e);
  }

  // Final fallback: keep quota/credits functional even if public.users row is missing.
  return stableUuidFromEmail(sessionUser.email);
}
function getUtcDayRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function POST(request: NextRequest) {
  let chargedCredits = 0;
  let chargedUserUuid: string | null = null;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: "Please login first." }, { status: 401 });
    }

    let userUuid = await resolveUserUuid(session.user);
    if (!userUuid) {
      const fallbackBase = String(session.user?.email || session.user?.id || session.user?.name || "session-user").trim().toLowerCase();
      userUuid = stableUuidFromEmail(`${fallbackBase}@fallback.local`);
      log("[Evolink Generate] fallback user uuid used:", { email: session.user?.email, userUuid });
    }

    const body = await request.json();
    const { prompt, size = "auto", quality = "2K", image_urls } = body;

    log("[Evolink Generate] request received:", {
      user: session.user.email,
      prompt,
      size,
      quality,
      hasImageUrls: !!image_urls,
    });

    const { start, end } = getUtcDayRange();
    const { count, error: countError } = await supabase
      .from("credit_history")
      .select("id", { count: "exact", head: true })
      .eq("user_uuid", userUuid)
      .in("type", ["image_generate_free_daily", "image_generate_paid"])
      .gte("created_at", start)
      .lt("created_at", end);

    if (countError) {
      logError("[Evolink Generate] failed to query daily image usage:", countError);
      return NextResponse.json({ code: 500, message: "Failed to check daily free quota." }, { status: 500 });
    }

    const usedToday = count || 0;
    const freeQuotaUsedUp = usedToday >= DAILY_FREE_IMAGE_LIMIT;

    if (freeQuotaUsedUp) {
      const consumeResult = await consumeUserCredits(
        userUuid,
        IMAGE_PAID_CREDITS,
        "image_generate_paid",
        "Image generation after free daily quota used"
      );

      if (!consumeResult.success) {
        return NextResponse.json(
          {
            code: 4021,
            errorCode: "FREE_DAILY_IMAGE_QUOTA_USED",
            message: "Free daily image quota used. 3 credits are required for each extra image.",
            dailyFreeLimit: DAILY_FREE_IMAGE_LIMIT,
            requiredCredits: IMAGE_PAID_CREDITS,
            remainingCredits: consumeResult.balance,
          },
          { status: 402 }
        );
      }

      chargedCredits = IMAGE_PAID_CREDITS;
      chargedUserUuid = userUuid;
    }

    const requestBody: Record<string, any> = {
      model: "nano-banana-2-lite",
      prompt,
      size,
      quality,
    };

    if (image_urls && image_urls.length > 0) {
      requestBody.image_urls = image_urls;
    }

    log("[Evolink Generate] calling Evolink API:", requestBody);
    const response = await evolinkAxios.post("/v1/images/generations", requestBody);
    log("[Evolink Generate] response:", response.data);

    if (!freeQuotaUsedUp) {
      await addCreditHistory(userUuid, 0, "image_generate_free_daily", "Daily free image generation");
    }

    return NextResponse.json({ code: 1000, message: "success", data: response.data });
  } catch (error: any) {
    logError("[Evolink Generate] error:", error);

    if (chargedCredits > 0 && chargedUserUuid) {
      await updateUserCredits(
        chargedUserUuid,
        chargedCredits,
        "image_generate_refund",
        "Refund after upstream image generation failure"
      );
    }

    const errorData = error.response?.data?.error || {};
    return NextResponse.json(
      {
        code: error.response?.status || 500,
        message: errorData.message || error.message || "Image generation failed.",
        error: errorData,
      },
      { status: error.response?.status || 500 }
    );
  }
}






