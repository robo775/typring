import { NextResponse, type NextRequest } from "next/server";
import { calculatePyramidScore } from "@/lib/pyramid/calculate-pyramid-score";
import {
  sanitizeBackgroundId,
  sanitizePlacedParts
} from "@/lib/pyramid/sanitize-pyramid";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as {
    backgroundId?: unknown;
    isPublic?: unknown;
    placedParts?: unknown;
    title?: unknown;
  } | null;

  const title =
    typeof payload?.title === "string" && payload.title.trim()
      ? payload.title.trim().slice(0, 80)
      : "無題のピラミッド";
  const backgroundId = sanitizeBackgroundId(payload?.backgroundId);
  const placedParts = sanitizePlacedParts(payload?.placedParts);
  const score = calculatePyramidScore(placedParts);

  if (placedParts.length === 0) {
    return NextResponse.json({ error: "parts_required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pyramid_creations")
    .insert({
      background_id: backgroundId,
      category_count: score.categoryCount,
      is_public: payload?.isPublic !== false,
      part_count: score.partCount,
      placed_parts: placedParts,
      title,
      total_score: score.totalScore,
      user_id: user.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "create_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
