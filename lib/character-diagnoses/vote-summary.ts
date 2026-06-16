export type CharacterTypeVoteRow = {
  character_diagnosis_id: string;
  created_at: string;
  type_system_id: string;
  type_value_id: string;
};

export type TypeSystemForSummary = {
  id: string;
  name: string;
  position: number | null;
};

export type TypeValueForSummary = {
  code: string;
  id: string;
  name: string;
  position: number | null;
  type_system_id: string;
};

export type CharacterTopType = {
  firstVotedAt: string | null;
  percentage: number;
  system: string;
  systemPosition: number;
  totalCount: number;
  typeSystemId: string;
  typeValueId: string;
  value: string;
  valuePosition: number;
  voteCount: number;
};

export type CharacterVoteSummaryItem = CharacterTopType;

export function buildCharacterVoteSummary({
  typeSystems,
  typeValues,
  votes
}: {
  typeSystems: TypeSystemForSummary[];
  typeValues: TypeValueForSummary[];
  votes: CharacterTypeVoteRow[];
}) {
  const counts = new Map<
    string,
    {
      firstVotedAt: string | null;
      typeSystemId: string;
      typeValueId: string;
      voteCount: number;
    }
  >();
  const totals = new Map<string, number>();

  for (const vote of votes) {
    const key = `${vote.type_system_id}:${vote.type_value_id}`;
    const current = counts.get(key);
    counts.set(key, {
      firstVotedAt: getEarlierDate(current?.firstVotedAt ?? null, vote.created_at),
      typeSystemId: vote.type_system_id,
      typeValueId: vote.type_value_id,
      voteCount: (current?.voteCount ?? 0) + 1
    });
    totals.set(vote.type_system_id, (totals.get(vote.type_system_id) ?? 0) + 1);
  }

  return Array.from(counts.values())
    .map((count) => {
      const system = typeSystems.find((item) => item.id === count.typeSystemId);
      const value = typeValues.find((item) => item.id === count.typeValueId);
      const totalCount = totals.get(count.typeSystemId) ?? 0;

      if (!system || !value || totalCount === 0) {
        return null;
      }

      return {
        firstVotedAt: count.firstVotedAt,
        percentage: Math.round((count.voteCount / totalCount) * 100),
        system: system.name,
        systemPosition: system.position ?? 0,
        totalCount,
        typeSystemId: count.typeSystemId,
        typeValueId: count.typeValueId,
        value: value.name || value.code,
        valuePosition: value.position ?? 0,
        voteCount: count.voteCount
      };
    })
    .filter((item): item is CharacterVoteSummaryItem => item !== null)
    .sort(compareVoteSummaryItems);
}

export function getTopTypesBySystem(items: CharacterVoteSummaryItem[]) {
  const topTypes = new Map<string, CharacterTopType>();

  for (const item of items) {
    const current = topTypes.get(item.typeSystemId);

    if (!current || compareVoteSummaryItems(item, current) < 0) {
      topTypes.set(item.typeSystemId, item);
    }
  }

  return Array.from(topTypes.values()).sort((a, b) => {
    if (a.systemPosition !== b.systemPosition) {
      return a.systemPosition - b.systemPosition;
    }

    return a.valuePosition - b.valuePosition;
  });
}

export function compareVoteSummaryItems(
  a: CharacterVoteSummaryItem,
  b: CharacterVoteSummaryItem
) {
  if (a.systemPosition !== b.systemPosition) {
    return a.systemPosition - b.systemPosition;
  }

  if (a.voteCount !== b.voteCount) {
    return b.voteCount - a.voteCount;
  }

  const firstVoteDiff = getTime(a.firstVotedAt) - getTime(b.firstVotedAt);
  if (firstVoteDiff !== 0) {
    return firstVoteDiff;
  }

  return a.valuePosition - b.valuePosition;
}

function getEarlierDate(current: string | null, next: string) {
  if (!current) {
    return next;
  }

  return getTime(current) <= getTime(next) ? current : next;
}

function getTime(value: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}
