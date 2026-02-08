import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getIsoTimestr } from "@/lib/time";

/**
 * GET /api/user/profile
 * Get user profile information
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServer();

    // Get user profile from database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, created_at")
      .eq("id", session.user.id)
      .single();

    if (error || !user) {
      console.error("[ProfileAPI] Failed to fetch user:", error);
      // Return session data as fallback
      return NextResponse.json({
        code: 1000,
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          avatar_url: session.user.image,
        },
      });
    }

    console.log("[ProfileAPI] User profile fetched:", user.email);

    return NextResponse.json({
      code: 1000,
      message: "success",
      data: user,
    });
  } catch (error: any) {
    console.error("[ProfileAPI] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update user profile information
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatar_url } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Update user profile
    const { data: user, error } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        avatar_url: avatar_url || null,
        updated_at: getIsoTimestr(),
      })
      .eq("id", session.user.id)
      .select("id, email, name, avatar_url")
      .single();

    if (error) {
      console.error("[ProfileAPI] Failed to update user:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    console.log("[ProfileAPI] User profile updated:", user.email);

    return NextResponse.json({
      code: 1000,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("[ProfileAPI] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
