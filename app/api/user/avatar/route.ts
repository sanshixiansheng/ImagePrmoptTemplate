import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";

/**
 * POST /api/user/avatar
 * Upload user avatar to R2 storage
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${session.user.id}/${getUuid()}.${fileExt}`;

    // Upload to R2 via Supabase storage
    const supabase = getSupabaseServer();

    // Note: This assumes you have a storage bucket named 'avatars'
    // You may need to create it first in Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[AvatarAPI] Upload error:", uploadError);

      // Fallback: Return a placeholder avatar URL
      const placeholderUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`;

      // Update user's avatar_url in database
      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: placeholderUrl,
          updated_at: getIsoTimestr(),
        })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("[AvatarAPI] Failed to update avatar_url:", updateError);
      }

      return NextResponse.json({
        code: 1000,
        message: "Avatar updated (using placeholder)",
        data: { avatar_url: placeholderUrl },
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update user's avatar_url in database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        avatar_url: avatarUrl,
        updated_at: getIsoTimestr(),
      })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("[AvatarAPI] Failed to update avatar_url:", updateError);
    }

    console.log("[AvatarAPI] Avatar uploaded:", avatarUrl);

    return NextResponse.json({
      code: 1000,
      message: "Avatar uploaded successfully",
      data: { avatar_url: avatarUrl },
    });
  } catch (error: any) {
    console.error("[AvatarAPI] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
