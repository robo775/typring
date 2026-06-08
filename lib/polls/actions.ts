"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createPoll(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/polls/new");
  }

  const title = getString(formData, "title");
  const question = getString(formData, "question");
  const description = getString(formData, "description");
  const status = getString(formData, "status") === "draft" ? "draft" : "published";
  const options = getOptions(formData);

  if (!title || !question) {
    redirect("/polls/new?error=title_question_required");
  }

  if (options.length < 2) {
    redirect("/polls/new?error=options_required");
  }

  const slug = await createUniqueSlug(supabase, title);
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      creator_user_id: user.id,
      description: description || null,
      published_at: status === "published" ? new Date().toISOString() : null,
      question,
      slug,
      status,
      title
    })
    .select("id,slug")
    .single();

  if (pollError || !poll) {
    redirect(`/polls/new?error=${encodeURIComponent(pollError?.message ?? "create_failed")}`);
  }

  const { error: optionError } = await supabase.from("poll_options").insert(
    options.map((option, index) => ({
      body: option,
      poll_id: poll.id,
      position: index + 1
    }))
  );

  if (optionError) {
    redirect(`/polls/new?error=${encodeURIComponent(optionError.message)}`);
  }

  revalidatePath("/polls");
  redirect(`/polls/${poll.slug}`);
}

export async function submitPollResponse(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pollId = getString(formData, "poll_id");
  const slug = getString(formData, "slug");
  const optionId = getString(formData, "option_id");

  if (!pollId || !slug || !optionId) {
    redirect("/polls?error=poll_missing");
  }

  const { data: option } = await supabase
    .from("poll_options")
    .select("id,poll_id")
    .eq("id", optionId)
    .eq("poll_id", pollId)
    .maybeSingle();

  if (!option) {
    redirect(`/polls/${slug}?error=option_missing`);
  }

  const { error } = await supabase.from("poll_responses").upsert(
    {
      option_id: optionId,
      poll_id: pollId,
      respondent_user_id: user.id
    },
    {
      onConflict: "poll_id,respondent_user_id"
    }
  );

  if (error) {
    redirect(`/polls/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/polls/${slug}`);
  revalidatePath(`/polls/${slug}/stats`);
  redirect(`/polls/${slug}?answered=1`);
}

export async function updatePoll(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pollId = getString(formData, "poll_id");
  const slug = getString(formData, "slug");
  const title = getString(formData, "title");
  const question = getString(formData, "question");
  const description = getString(formData, "description");
  const status = getString(formData, "status") === "draft" ? "draft" : "published";
  const options = getOptionDrafts(formData);

  if (!pollId || !slug) {
    redirect("/polls?error=poll_missing");
  }

  if (!title || !question) {
    redirect(`/polls/${slug}/edit?error=title_question_required`);
  }

  if (options.length < 2) {
    redirect(`/polls/${slug}/edit?error=options_required`);
  }

  const { data: poll } = await supabase
    .from("polls")
    .select("id,creator_user_id")
    .eq("id", pollId)
    .maybeSingle();

  if (!poll || poll.creator_user_id !== user.id) {
    redirect(`/polls/${slug}?error=owner_required`);
  }

  const { error: pollError } = await supabase
    .from("polls")
    .update({
      description: description || null,
      published_at: status === "published" ? new Date().toISOString() : null,
      question,
      status,
      title
    })
    .eq("id", pollId)
    .eq("creator_user_id", user.id);

  if (pollError) {
    redirect(`/polls/${slug}/edit?error=${encodeURIComponent(pollError.message)}`);
  }

  const keptOptionIds = options
    .map((option) => option.id)
    .filter((id): id is string => Boolean(id));

  if (keptOptionIds.length > 0) {
    const { error: deleteRemovedError } = await supabase
      .from("poll_options")
      .delete()
      .eq("poll_id", pollId)
      .not("id", "in", `(${keptOptionIds.join(",")})`);

    if (deleteRemovedError) {
      redirect(
        `/polls/${slug}/edit?error=${encodeURIComponent(deleteRemovedError.message)}`
      );
    }
  } else {
    const { error: deleteAllError } = await supabase
      .from("poll_options")
      .delete()
      .eq("poll_id", pollId);

    if (deleteAllError) {
      redirect(`/polls/${slug}/edit?error=${encodeURIComponent(deleteAllError.message)}`);
    }
  }

  for (const [index, option] of options.entries()) {
    if (option.id) {
      const { error } = await supabase
        .from("poll_options")
        .update({
          body: option.body,
          position: index + 1
        })
        .eq("id", option.id)
        .eq("poll_id", pollId);

      if (error) {
        redirect(`/polls/${slug}/edit?error=${encodeURIComponent(error.message)}`);
      }
    } else {
      const { error } = await supabase.from("poll_options").insert({
        body: option.body,
        poll_id: pollId,
        position: index + 1
      });

      if (error) {
        redirect(`/polls/${slug}/edit?error=${encodeURIComponent(error.message)}`);
      }
    }
  }

  revalidatePath("/polls");
  revalidatePath(`/polls/${slug}`);
  revalidatePath(`/polls/${slug}/stats`);
  redirect(`/polls/${slug}?updated=1`);
}

export async function deletePoll(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pollId = getString(formData, "poll_id");
  const slug = getString(formData, "slug");

  if (!pollId || !slug) {
    redirect("/polls?error=poll_missing");
  }

  const { data: poll } = await supabase
    .from("polls")
    .select("id,creator_user_id")
    .eq("id", pollId)
    .maybeSingle();

  if (!poll || poll.creator_user_id !== user.id) {
    redirect(`/polls/${slug}?error=owner_required`);
  }

  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", pollId)
    .eq("creator_user_id", user.id);

  if (error) {
    redirect(`/polls/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/polls");
  redirect("/polls?deleted=1");
}

async function createUniqueSlug(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  title: string
) {
  const base = slugify(title).slice(0, 56) || "poll";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${base}-${suffix}`;
    const { data } = await supabase
      .from("polls")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      return slug;
    }
  }

  return `${base}-${Date.now().toString(36)}`;
}

function getOptions(formData: FormData) {
  const seen = new Set<string>();
  const options: string[] = [];

  for (let index = 1; index <= 10; index += 1) {
    const option = getString(formData, `option_${index}`);

    if (!option || seen.has(option)) {
      continue;
    }

    seen.add(option);
    options.push(option);
  }

  return options;
}

function getOptionDrafts(formData: FormData) {
  const seen = new Set<string>();
  const options: { body: string; id: string | null }[] = [];

  for (let index = 1; index <= 10; index += 1) {
    const body = getString(formData, `option_${index}`);
    const id = getString(formData, `option_${index}_id`) || null;

    if (!body || seen.has(body)) {
      continue;
    }

    seen.add(body);
    options.push({ body, id });
  }

  return options;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
