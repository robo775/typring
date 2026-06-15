"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createCharacterDiagnosis(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/character-diagnoses/new");
  }

  const workTitle = nullableString(formData, "work_title", 120);
  const characterName = getString(formData, "character_name").slice(0, 120);
  const imageUrl = nullableUrl(formData, "image_url");
  const description = nullableString(formData, "description", 800);
  const relatedUrl = nullableUrl(formData, "related_url");

  if (!characterName) {
    redirect("/character-diagnoses/new?error=character_name_required");
  }

  const { data, error } = await supabase
    .from("character_diagnoses")
    .insert({
      character_name: characterName,
      creator_user_id: user.id,
      description,
      image_url: imageUrl,
      is_public: true,
      related_url: relatedUrl,
      work_title: workTitle
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      `/character-diagnoses/new?error=${encodeURIComponent(
        error?.message ?? "create_failed"
      )}`
    );
  }

  revalidatePath("/character-diagnoses");
  redirect(`/character-diagnoses/${data.id}?created=1`);
}

export async function submitCharacterTypeVotes(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const characterId = getString(formData, "character_diagnosis_id");

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/character-diagnoses/${characterId}`)}`
    );
  }

  if (!characterId) {
    redirect("/character-diagnoses?error=character_required");
  }

  const { data: character } = await supabase
    .from("character_diagnoses")
    .select("id")
    .eq("id", characterId)
    .maybeSingle();

  if (!character) {
    redirect("/character-diagnoses?error=character_not_found");
  }

  const selections = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("vote:"))
    .map(([key, value]) => ({
      typeSystemId: key.replace("vote:", ""),
      typeValueId: typeof value === "string" ? value : ""
    }))
    .filter((selection) => selection.typeSystemId);

  for (const selection of selections) {
    if (!selection.typeValueId) {
      const { error } = await supabase
        .from("character_type_votes")
        .delete()
        .eq("character_diagnosis_id", characterId)
        .eq("voter_user_id", user.id)
        .eq("type_system_id", selection.typeSystemId);

      if (error) {
        redirect(
          `/character-diagnoses/${characterId}?error=${encodeURIComponent(
            error.message
          )}`
        );
      }

      continue;
    }

    const { error } = await supabase.from("character_type_votes").upsert(
      {
        character_diagnosis_id: characterId,
        type_system_id: selection.typeSystemId,
        type_value_id: selection.typeValueId,
        voter_user_id: user.id
      },
      {
        onConflict: "character_diagnosis_id,voter_user_id,type_system_id"
      }
    );

    if (error) {
      redirect(
        `/character-diagnoses/${characterId}?error=${encodeURIComponent(
          error.message
        )}`
      );
    }
  }

  revalidatePath(`/character-diagnoses/${characterId}`);
  redirect(`/character-diagnoses/${characterId}?voted=1`);
}

export async function deleteCharacterDiagnosis(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const characterId = getString(formData, "character_diagnosis_id");

  if (!user || !characterId) {
    redirect("/character-diagnoses");
  }

  const { data: character } = await supabase
    .from("character_diagnoses")
    .select("creator_user_id")
    .eq("id", characterId)
    .maybeSingle();

  if (!character || character.creator_user_id !== user.id) {
    redirect(`/character-diagnoses/${characterId}?error=delete_not_allowed`);
  }

  const { error } = await supabase
    .from("character_diagnoses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", characterId)
    .eq("creator_user_id", user.id);

  if (error) {
    redirect(
      `/character-diagnoses/${characterId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/character-diagnoses");
  redirect("/character-diagnoses?deleted=1");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(formData: FormData, key: string, maxLength: number) {
  const value = getString(formData, key).slice(0, maxLength);
  return value ? value : null;
}

function nullableUrl(formData: FormData, key: string) {
  const value = getString(formData, key).slice(0, 500);

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
