import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DisplayType = {
  system: string;
  value: string;
};

type VoteSummaryRow = {
  total_count: number;
  type_system_id: string;
  type_value_id: string;
  vote_count: number;
};

type TypeSystem = {
  id: string;
  name: string;
  position: number;
};

type TypeValue = {
  code: string;
  id: string;
  name: string;
  position: number;
};

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export async function getTopVotedTypesForUser(
  supabase: SupabaseServerClient,
  userId: string
) {
  const byUserId = await getTopVotedTypesForUsers(supabase, [userId]);
  return byUserId.get(userId) ?? [];
}

export async function getTopVotedTypesForUsers(
  supabase: SupabaseServerClient,
  userIds: string[]
) {
  const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean);
  const result = new Map<string, DisplayType[]>();

  if (uniqueUserIds.length === 0) {
    return result;
  }

  const summaries = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const { data } = await supabase.rpc("get_type_vote_summary", {
        p_target_user_id: userId
      });

      return {
        rows: ((data ?? []) as VoteSummaryRow[]).filter(
          (row) => row.total_count > 0 && row.vote_count > 0
        ),
        userId
      };
    })
  );
  const allRows = summaries.flatMap(({ rows }) => rows);
  const systemIds = Array.from(new Set(allRows.map((row) => row.type_system_id)));
  const valueIds = Array.from(new Set(allRows.map((row) => row.type_value_id)));
  const { data: systemRows } =
    systemIds.length > 0
      ? await supabase
          .from("type_systems")
          .select("id,name,position")
          .in("id", systemIds)
      : { data: [] };
  const { data: valueRows } =
    valueIds.length > 0
      ? await supabase
          .from("type_values")
          .select("id,code,name,position")
          .in("id", valueIds)
      : { data: [] };
  const systems = new Map(
    ((systemRows ?? []) as TypeSystem[]).map((system) => [system.id, system])
  );
  const values = new Map(
    ((valueRows ?? []) as TypeValue[]).map((value) => [value.id, value])
  );

  for (const summary of summaries) {
    const topRows = getTopRowsBySystem(summary.rows);
    const votedTypes = topRows
      .map((row) => {
        const system = systems.get(row.type_system_id);
        const value = values.get(row.type_value_id);

        if (!system || !value) {
          return null;
        }

        return {
          system: system.name,
          value: value.name || value.code
        };
      })
      .filter((type): type is DisplayType => type !== null);

    result.set(summary.userId, votedTypes);
  }

  return result;
}

function getTopRowsBySystem(rows: VoteSummaryRow[]) {
  const topBySystem = new Map<string, VoteSummaryRow>();

  for (const row of rows) {
    const current = topBySystem.get(row.type_system_id);

    if (!current || isBetterVoteRow(row, current)) {
      topBySystem.set(row.type_system_id, row);
    }
  }

  return Array.from(topBySystem.values()).sort((a, b) =>
    a.type_system_id.localeCompare(b.type_system_id)
  );
}

function isBetterVoteRow(candidate: VoteSummaryRow, current: VoteSummaryRow) {
  if (candidate.vote_count !== current.vote_count) {
    return candidate.vote_count > current.vote_count;
  }

  const candidatePercentage = candidate.vote_count / candidate.total_count;
  const currentPercentage = current.vote_count / current.total_count;

  if (candidatePercentage !== currentPercentage) {
    return candidatePercentage > currentPercentage;
  }

  return candidate.type_value_id.localeCompare(current.type_value_id) < 0;
}
