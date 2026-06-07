"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type VariableDraft = {
  code: string;
  description: string;
  name: string;
  position: number;
};

type QuestionDraft = {
  body: string;
  helpText: string;
  options: {
    body: string;
    position: number;
    score: number;
    variableCode: string;
  }[];
  position: number;
};

export async function createSimpleQuiz(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/quizzes/new");
  }

  const title = getString(formData, "title");
  const shortDescription = getString(formData, "short_description");
  const description = getString(formData, "description");
  const status = getString(formData, "status") === "published" ? "published" : "draft";

  if (!title) {
    redirect("/quizzes/new?error=title_required");
  }

  const variables = getVariableDrafts(formData);
  const questions = getQuestionDrafts(formData, variables);

  if (variables.length < 2) {
    redirect("/quizzes/new?error=variables_required");
  }

  if (questions.length < 1) {
    redirect("/quizzes/new?error=questions_required");
  }

  const slug = await createUniqueSlug(supabase, title);
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      creator_user_id: user.id,
      description: description || null,
      mode: "max_score",
      published_at: status === "published" ? new Date().toISOString() : null,
      short_description: shortDescription || null,
      slug,
      status,
      title
    })
    .select("id,slug")
    .single();

  if (quizError || !quiz) {
    redirect(`/quizzes/new?error=${encodeURIComponent(quizError?.message ?? "create_failed")}`);
  }

  const variableIdByCode = new Map<string, string>();

  for (const variable of variables) {
    const { data, error } = await supabase
      .from("quiz_variables")
      .insert({
        code: variable.code,
        description: variable.description || null,
        name: variable.name,
        position: variable.position,
        quiz_id: quiz.id
      })
      .select("id,code")
      .single();

    if (error || !data) {
      redirect(`/quizzes/new?error=${encodeURIComponent(error?.message ?? "variable_failed")}`);
    }

    variableIdByCode.set(data.code, data.id);

    const { error: resultError } = await supabase.from("quiz_results").insert({
      code: variable.code,
      name: variable.name,
      position: variable.position,
      quiz_id: quiz.id,
      short_description: variable.description || null
    });

    if (resultError) {
      redirect(`/quizzes/new?error=${encodeURIComponent(resultError.message)}`);
    }
  }

  for (const question of questions) {
    const { data: questionRow, error: questionError } = await supabase
      .from("quiz_questions")
      .insert({
        body: question.body,
        help_text: question.helpText || null,
        position: question.position,
        quiz_id: quiz.id
      })
      .select("id")
      .single();

    if (questionError || !questionRow) {
      redirect(`/quizzes/new?error=${encodeURIComponent(questionError?.message ?? "question_failed")}`);
    }

    for (const option of question.options) {
      const variableId = variableIdByCode.get(option.variableCode);

      if (!variableId) {
        continue;
      }

      const { data: optionRow, error: optionError } = await supabase
        .from("quiz_answer_options")
        .insert({
          body: option.body,
          position: option.position,
          question_id: questionRow.id
        })
        .select("id")
        .single();

      if (optionError || !optionRow) {
        redirect(`/quizzes/new?error=${encodeURIComponent(optionError?.message ?? "option_failed")}`);
      }

      const { error: effectError } = await supabase
        .from("quiz_answer_effects")
        .insert({
          answer_option_id: optionRow.id,
          quiz_id: quiz.id,
          score: option.score,
          variable_id: variableId
        });

      if (effectError) {
        redirect(`/quizzes/new?error=${encodeURIComponent(effectError.message)}`);
      }
    }
  }

  revalidatePath("/quizzes");
  redirect(`/quizzes/${quiz.slug}`);
}

export async function submitQuizAttempt(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const quizId = getString(formData, "quiz_id");
  const slug = getString(formData, "slug");

  if (!quizId || !slug) {
    redirect("/quizzes?error=quiz_missing");
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id,slug,status")
    .eq("id", quizId)
    .eq("status", "published")
    .maybeSingle();

  if (!quiz) {
    redirect("/quizzes?error=quiz_not_found");
  }

  const { data: variableRows } = await supabase
    .from("quiz_variables")
    .select("id,code,position")
    .eq("quiz_id", quiz.id)
    .order("position", { ascending: true });
  const variables = variableRows ?? [];
  const scores = new Map<string, number>();

  for (const variable of variables) {
    scores.set(variable.id, 0);
  }

  const { data: questionRows } = await supabase
    .from("quiz_questions")
    .select("id")
    .eq("quiz_id", quiz.id);
  const questionIds = new Set((questionRows ?? []).map((question) => question.id));
  const selectedOptionIds = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("answer:"))
    .map(([key, value]) => ({
      questionId: key.replace("answer:", ""),
      optionId: typeof value === "string" ? value : ""
    }))
    .filter((answer) => questionIds.has(answer.questionId) && answer.optionId);

  if (selectedOptionIds.length !== questionIds.size) {
    redirect(`/quizzes/${slug}?error=answer_all_questions`);
  }

  const { data: effectRows } = await supabase
    .from("quiz_answer_effects")
    .select("answer_option_id,variable_id,score")
    .in(
      "answer_option_id",
      selectedOptionIds.map((answer) => answer.optionId)
    );

  for (const effect of effectRows ?? []) {
    scores.set(effect.variable_id, (scores.get(effect.variable_id) ?? 0) + effect.score);
  }

  const winningVariable = variables.reduce<(typeof variables)[number] | null>(
    (winner, variable) => {
      if (!winner) {
        return variable;
      }

      const currentScore = scores.get(variable.id) ?? 0;
      const winnerScore = scores.get(winner.id) ?? 0;

      if (currentScore > winnerScore) {
        return variable;
      }

      if (currentScore === winnerScore && variable.position < winner.position) {
        return variable;
      }

      return winner;
    },
    null
  );

  if (!winningVariable) {
    redirect(`/quizzes/${slug}?error=result_missing`);
  }

  const { data: result } = await supabase
    .from("quiz_results")
    .select("id,code")
    .eq("quiz_id", quiz.id)
    .eq("code", winningVariable.code)
    .maybeSingle();

  if (!result) {
    redirect(`/quizzes/${slug}?error=result_missing`);
  }

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quiz.id,
      result_code: result.code,
      result_id: result.id,
      user_id: user.id
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    redirect(`/quizzes/${slug}?error=${encodeURIComponent(attemptError?.message ?? "attempt_failed")}`);
  }

  const { error: answerError } = await supabase.from("quiz_attempt_answers").insert(
    selectedOptionIds.map((answer) => ({
      answer_option_id: answer.optionId,
      attempt_id: attempt.id,
      question_id: answer.questionId
    }))
  );

  if (answerError) {
    redirect(`/quizzes/${slug}?error=${encodeURIComponent(answerError.message)}`);
  }

  const { error: scoreError } = await supabase.from("quiz_attempt_scores").insert(
    Array.from(scores.entries()).map(([variableId, score]) => ({
      attempt_id: attempt.id,
      quiz_id: quiz.id,
      score,
      variable_id: variableId
    }))
  );

  if (scoreError) {
    redirect(`/quizzes/${slug}?error=${encodeURIComponent(scoreError.message)}`);
  }

  revalidatePath(`/quizzes/${slug}`);
  redirect(`/quizzes/${slug}/attempts/${attempt.id}`);
}

function getVariableDrafts(formData: FormData): VariableDraft[] {
  return Array.from({ length: 4 }, (_, index) => {
    const position = index + 1;
    const code = normalizeCode(getString(formData, `variable_${position}_code`));
    const name = getString(formData, `variable_${position}_name`);
    const description = getString(formData, `variable_${position}_description`);

    if (!code || !name) {
      return null;
    }

    return { code, description, name, position };
  }).filter((variable): variable is VariableDraft => variable !== null);
}

function getQuestionDrafts(formData: FormData, variables: VariableDraft[]) {
  const variableCodes = new Set(variables.map((variable) => variable.code));
  return Array.from({ length: 5 }, (_, questionIndex) => {
    const position = questionIndex + 1;
    const body = getString(formData, `question_${position}_body`);
    const helpText = getString(formData, `question_${position}_help`);

    if (!body) {
      return null;
    }

    const options = Array.from({ length: 3 }, (_, optionIndex) => {
      const optionPosition = optionIndex + 1;
      const optionBody = getString(
        formData,
        `question_${position}_option_${optionPosition}_body`
      );
      const variableCode = normalizeCode(
        getString(formData, `question_${position}_option_${optionPosition}_variable`)
      );
      const score = Number(
        getString(formData, `question_${position}_option_${optionPosition}_score`) || "1"
      );

      if (!optionBody || !variableCodes.has(variableCode)) {
        return null;
      }

      return {
        body: optionBody,
        position: optionPosition,
        score: Number.isFinite(score) ? Math.max(-20, Math.min(20, score)) : 1,
        variableCode
      };
    }).filter((option): option is QuestionDraft["options"][number] => option !== null);

    if (options.length < 2) {
      return null;
    }

    return { body, helpText, options, position };
  }).filter((question): question is QuestionDraft => question !== null);
}

async function createUniqueSlug(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  title: string
) {
  const base = slugify(title).slice(0, 56) || "quiz";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${base}-${suffix}`;
    const { data } = await supabase
      .from("quizzes")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      return slug;
    }
  }

  return `${base}-${Date.now().toString(36)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeCode(value: string) {
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
