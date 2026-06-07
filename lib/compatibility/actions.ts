"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const FEATURE = "compatibility";
const DAILY_LIMIT = 3;

export async function generateCompatibility(formData: FormData) {
  if (process.env.NEXT_PUBLIC_ENABLE_AI_COMPATIBILITY !== "true") {
    redirect("/?error=compatibility_disabled");
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const handle = getString(formData, "handle");
  const targetUserId = getString(formData, "target_user_id");

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/users/${handle}`)}`);
  }

  if (!targetUserId || !handle) {
    redirect("/search");
  }

  if (user.id === targetUserId) {
    redirect(`/users/${handle}?error=compatibility_self_not_allowed`);
  }

  const input = await buildCompatibilityInput(user.id, targetUserId);

  if (!input) {
    redirect(`/users/${handle}?error=compatibility_requires_types`);
  }

  const inputHash = hashInput(input.cacheSource);
  const { data: cached } = await supabase
    .from("compatibility_results")
    .select("id")
    .eq("requester_user_id", user.id)
    .eq("target_user_id", targetUserId)
    .eq("input_hash", inputHash)
    .maybeSingle();

  if (cached) {
    revalidatePath(`/users/${handle}`);
    redirect(`/users/${handle}?compatibility=cached`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const { count } = await supabase
    .from("ai_usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("feature", FEATURE)
    .eq("used_on", today);

  if ((count ?? 0) >= DAILY_LIMIT) {
    redirect(`/users/${handle}?error=compatibility_daily_limit`);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    redirect(`/users/${handle}?error=openai_not_configured`);
  }

  let resultText = "";
  try {
    resultText = await callOpenAI({
      apiKey,
      input: input.prompt,
      model
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ai_request_failed";
    redirect(`/users/${handle}?error=${encodeURIComponent(message)}`);
  }

  const { error: insertError } = await supabase.from("compatibility_results").insert({
    input_hash: inputHash,
    model,
    requester_user_id: user.id,
    result_text: resultText,
    target_user_id: targetUserId
  });

  if (insertError) {
    redirect(`/users/${handle}?error=${encodeURIComponent(insertError.message)}`);
  }

  await supabase.from("ai_usage_logs").insert({
    feature: FEATURE,
    user_id: user.id,
    used_on: today
  });

  revalidatePath(`/users/${handle}`);
  redirect(`/users/${handle}?compatibility=generated`);
}

async function buildCompatibilityInput(requesterUserId: string, targetUserId: string) {
  const supabase = createSupabaseServerClient();
  const [requesterTypes, targetTypes] = await Promise.all([
    getUserTypeLines(supabase, requesterUserId),
    getUserTypeLines(supabase, targetUserId)
  ]);

  if (requesterTypes.length === 0 || targetTypes.length === 0) {
    return null;
  }

  const cacheSource = JSON.stringify({
    requesterTypes,
    targetTypes
  });
  const prompt = [
    "You are writing a short entertainment-only compatibility comment for Typring.",
    "Use only the public type information below.",
    "Do not present it as medical, psychological, or scientific diagnosis.",
    "Keep it friendly, non-deterministic, and under 120 Japanese characters.",
    "",
    `Viewer types: ${requesterTypes.join(" / ")}`,
    `Target types: ${targetTypes.join(" / ")}`
  ].join("\n");

  return { cacheSource, prompt };
}

async function getUserTypeLines(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userId: string
) {
  const { data: userTypes } = await supabase
    .from("user_types")
    .select("type_system_id,type_value_id")
    .eq("user_id", userId);
  const rows = userTypes ?? [];
  const typeSystemIds = rows.map((row) => row.type_system_id);
  const typeValueIds = rows.map((row) => row.type_value_id);
  const typeSystemResult =
    typeSystemIds.length > 0
      ? await supabase
          .from("type_systems")
          .select("id,name,description")
          .in("id", typeSystemIds)
      : { data: [] };
  const typeValueResult =
    typeValueIds.length > 0
      ? await supabase
          .from("type_values")
          .select("id,code,name,description")
          .in("id", typeValueIds)
      : { data: [] };

  return rows
    .map((row) => {
      const system = (typeSystemResult.data ?? []).find(
        (typeSystem) => typeSystem.id === row.type_system_id
      );
      const value = (typeValueResult.data ?? []).find(
        (typeValue) => typeValue.id === row.type_value_id
      );

      if (!system || !value) {
        return null;
      }

      return `${system.name}: ${value.name || value.code}`;
    })
    .filter((line): line is string => line !== null);
}

async function callOpenAI({
  apiKey,
  input,
  model
}: {
  apiKey: string;
  input: string;
  model: string;
}) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    body: JSON.stringify({
      messages: [{ content: input, role: "user" }],
      model,
      temperature: 0.7
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed");
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenAI response was empty");
  }

  return content.slice(0, 500);
}

function hashInput(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
