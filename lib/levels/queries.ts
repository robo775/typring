import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserLevelSummary = {
  introductionsReceivedPoints: number;
  introductionsWrittenPoints: number;
  level: number;
  nextLevelPoints: number;
  pollAnswerPoints: number;
  pollReceivedPoints: number;
  selfTypePoints: number;
  totalPoints: number;
  userId: string;
  votesGivenPoints: number;
  votesReceivedPoints: number;
};

type LevelSummaryRow = {
  introductions_received_points: number;
  introductions_written_points: number;
  level: number;
  next_level_points: number;
  poll_answer_points: number;
  poll_received_points: number;
  self_type_points: number;
  total_points: number;
  user_id: string;
  votes_given_points: number;
  votes_received_points: number;
};

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function getUserLevelSummary(
  supabase: SupabaseServerClient,
  userId: string
) {
  const summaries = await getUserLevelSummaries(supabase, [userId]);
  return summaries.get(userId) ?? createEmptyLevelSummary(userId);
}

export async function getUserLevelSummaries(
  supabase: SupabaseServerClient,
  userIds: string[]
) {
  const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean);
  const result = new Map<string, UserLevelSummary>();

  if (uniqueUserIds.length === 0) {
    return result;
  }

  const { data } = await supabase.rpc("get_user_level_summaries", {
    p_user_ids: uniqueUserIds
  });

  for (const row of (data ?? []) as LevelSummaryRow[]) {
    result.set(row.user_id, normalizeLevelSummary(row));
  }

  for (const userId of uniqueUserIds) {
    if (!result.has(userId)) {
      result.set(userId, createEmptyLevelSummary(userId));
    }
  }

  return result;
}

function normalizeLevelSummary(row: LevelSummaryRow): UserLevelSummary {
  return {
    introductionsReceivedPoints: row.introductions_received_points,
    introductionsWrittenPoints: row.introductions_written_points,
    level: row.level,
    nextLevelPoints: row.next_level_points,
    pollAnswerPoints: row.poll_answer_points,
    pollReceivedPoints: row.poll_received_points,
    selfTypePoints: row.self_type_points,
    totalPoints: row.total_points,
    userId: row.user_id,
    votesGivenPoints: row.votes_given_points,
    votesReceivedPoints: row.votes_received_points
  };
}

function createEmptyLevelSummary(userId: string): UserLevelSummary {
  return {
    introductionsReceivedPoints: 0,
    introductionsWrittenPoints: 0,
    level: 1,
    nextLevelPoints: 50,
    pollAnswerPoints: 0,
    pollReceivedPoints: 0,
    selfTypePoints: 0,
    totalPoints: 0,
    userId,
    votesGivenPoints: 0,
    votesReceivedPoints: 0
  };
}
