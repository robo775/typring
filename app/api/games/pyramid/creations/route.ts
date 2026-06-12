import { NextResponse, type NextRequest } from "next/server";
import {
  calculateChallengeScore,
  calculatePyramidScore
} from "@/lib/pyramid/calculate-pyramid-score";
import { validateChallengeParts } from "@/lib/pyramid/challenge-rules";
import {
  sanitizeBackgroundId,
  sanitizePlacedParts
} from "@/lib/pyramid/sanitize-pyramid";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PyramidMode } from "@/types/pyramid";

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
    mode?: unknown;
    placedParts?: unknown;
    title?: unknown;
  } | null;

  const title =
    typeof payload?.title === "string" && payload.title.trim()
      ? payload.title.trim().slice(0, 80)
      : "無題のピラミッド";
  const mode: PyramidMode = payload?.mode === "challenge" ? "challenge" : "free";
  const backgroundId = sanitizeBackgroundId(payload?.backgroundId);
  const placedParts = sanitizePlacedParts(payload?.placedParts);

  if (placedParts.length === 0) {
    return NextResponse.json({ error: "parts_required" }, { status: 400 });
  }

  if (mode === "challenge") {
    const validation = validateChallengeParts(placedParts);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }
  }

  const score =
    mode === "challenge"
      ? calculateChallengeScore(placedParts, backgroundId)
      : calculatePyramidScore(placedParts);

  const { data, error } = await supabase
    .from("pyramid_creations")
    .insert({
      background_id: backgroundId,
      category_count: score.categoryCount,
      cost_used: score.costUsed,
      is_public: payload?.isPublic !== false,
      mode,
      part_count: score.partCount,
      placed_parts: placedParts,
      synergy_bonus: score.synergyBonus,
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
