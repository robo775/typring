import type { SupabaseClient } from "@supabase/supabase-js";

export const CHARACTER_IMAGE_BUCKET = "character-diagnosis-images";

export function getCharacterImageUrl(
  supabase: SupabaseClient<any>,
  imagePath: string | null
) {
  if (!imagePath) {
    return null;
  }

  const { data } = supabase.storage
    .from(CHARACTER_IMAGE_BUCKET)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}
