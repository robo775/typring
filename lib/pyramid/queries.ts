import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PyramidMode } from "@/types/pyramid";

export type PyramidCreationRow = {
  background_id: string;
  created_at: string;
  creator:
    | { display_name: string; twitter_handle: string | null }
    | { display_name: string; twitter_handle: string | null }[]
    | null;
  id: string;
  mode: PyramidMode;
  placed_parts: unknown;
  synergy_bonus: number;
  title: string;
  total_score: number;
};

export async function getPublicPyramidCreations(
  order: "created_at" | "total_score",
  mode?: PyramidMode
) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("pyramid_creations")
    .select(
      "id,title,background_id,placed_parts,total_score,mode,synergy_bonus,created_at,creator:profiles!pyramid_creations_user_id_fkey(display_name,twitter_handle)"
    )
    .eq("is_public", true)
    .limit(order === "total_score" ? 10 : 24);

  if (mode) {
    query = query.eq("mode", mode);
  }

  const { data } =
    order === "total_score"
      ? await query.order("total_score", { ascending: false }).order("created_at", {
          ascending: true
        })
      : await query.order("created_at", { ascending: false });

  return (data ?? []) as unknown as PyramidCreationRow[];
}
