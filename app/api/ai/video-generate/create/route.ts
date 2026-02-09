import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createHash } from "crypto";
import { evolinkAxios } from "@/lib/axios-config";
import { log, logError } from "@/lib/logger";
import { supabase } from "@/models/db";
import { insertUser } from "@/models/user";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { consumeUserCredits, updateUserCredits } from "@/models/credit";

const VIDEO_CREDITS_PER_SECOND = 12;

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

  // Final fallback: keep credits functional even if public.users row is missing.
  return stableUuidFromEmail(sessionUser.email);
}
function parseDurationSeconds(rawDuration: unknown, model: string): number {
  const parsed = parseInt(String(rawDuration || ""), 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    return parsed;
  }
  return model === "seedance-1.5-pro" ? 5 : 5;
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
      log("[Video Generate] fallback user uuid used:", { email: session.user?.email, userUuid });
    }

    const body = await request.json();
    const { prompt, model, duration, resolution, aspectRatio, generateAudio, imageUrl } = body;

    log("[Video Generate] request received:", {
      user: session.user.email,
      model,
      prompt: prompt?.substring(0, 80),
      duration,
      resolution,
      aspectRatio,
      hasImage: !!imageUrl,
    });

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ code: 400, message: "Please input a prompt." }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ code: 400, message: "Please select a model." }, { status: 400 });
    }

    const durationSeconds = parseDurationSeconds(duration, model);
    const requiredCredits = durationSeconds * VIDEO_CREDITS_PER_SECOND;

    const consumeResult = await consumeUserCredits(
      userUuid,
      requiredCredits,
      "video_generate_paid",
      `Video generation ${durationSeconds}s`
    );

    if (!consumeResult.success) {
      return NextResponse.json(
        {
          code: 4022,
          errorCode: "INSUFFICIENT_CREDITS_VIDEO",
          message: `Insufficient credits. Video generation costs ${VIDEO_CREDITS_PER_SECOND} credits per second.`,
          requiredCredits,
          remainingCredits: consumeResult.balance,
          durationSeconds,
          unitPricePerSecond: VIDEO_CREDITS_PER_SECOND,
        },
        { status: 402 }
      );
    }

    chargedCredits = requiredCredits;
    chargedUserUuid = userUuid;

    if (model === "sora-2") {
      const requestBody: Record<string, any> = {
        model: "sora-2",
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio || "16:9",
      };

      if (imageUrl) {
        requestBody.image_url = imageUrl;
      }

      log("[Video Generate] calling Evolink Sora 2 API:", requestBody);
      const response = await evolinkAxios.post("/v1/videos/generations", requestBody);
      log("[Video Generate] Evolink response:", response.data);

      if (!response.data?.id) {
        throw new Error("Failed to create video task.");
      }

      return NextResponse.json({
        code: 1000,
        message: "success",
        data: {
          taskId: response.data.id,
          status: response.data.status,
          progress: response.data.progress || 0,
        },
      });
    }

    if (model === "seedance-1.5-pro") {
      const requestBody: Record<string, any> = {
        model: "seedance-1.5-pro",
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio || "16:9",
        duration: durationSeconds,
        quality: resolution || "720p",
        generate_audio: generateAudio || false,
      };

      log("[Video Generate] calling Evolink Seedance API:", requestBody);
      const response = await evolinkAxios.post("/v1/videos/generations", requestBody);
      log("[Video Generate] Evolink response:", response.data);

      if (!response.data?.id) {
        throw new Error("Failed to create video task.");
      }

      return NextResponse.json({
        code: 1000,
        message: "success",
        data: {
          taskId: response.data.id,
          status: response.data.status,
          progress: response.data.progress || 0,
        },
      });
    }

    return NextResponse.json({ code: 400, message: `Model ${model} is not supported.` }, { status: 400 });
  } catch (error: any) {
    logError("[Video Generate] error:", error);

    if (chargedCredits > 0 && chargedUserUuid) {
      await updateUserCredits(
        chargedUserUuid,
        chargedCredits,
        "video_generate_refund",
        "Refund after upstream video generation failure"
      );
    }

    const errorData = error.response?.data?.error || {};
    return NextResponse.json(
      {
        code: error.response?.status || 500,
        message: errorData.message || error.message || "Video generation failed.",
        error: errorData,
      },
      { status: error.response?.status || 500 }
    );
  }
}






