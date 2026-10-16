import { useMemo } from "react";
import { ListCard } from "../../components/ListCard";
import { LinkRow } from "../../components/LinkRow";
import { getGoalSearchLinks } from "../utils/goalEvents";

export function LongRangeGoalsWidget({ matches = [], matchDetailsMap = {} }) {
  const longRangeGoals = useMemo(() => {
    const list = [];

    matches.forEach((m) => {
      const goals = matchDetailsMap[m.id];
      if (!Array.isArray(goals)) return;

      goals.forEach((g) => {
        if (!g.isLongRange) return;
        const team = g.isHomeGoal ? m.home.name : m.away.name;
        const opponent = g.isHomeGoal ? m.away.name : m.home.name;

        list.push({
          id: `${m.id}-${g.time}-${g.scorer}`,
          scorer: g.scorer || "Goal",
          links: getGoalSearchLinks(g.scorer),
          team,
          opponent,
          leagueName: m.leagueName,
          timeStr: g.timeStr,
          distance: g.distance,
        });
      });
    });

    return list.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
  }, [matches, matchDetailsMap]);

  return (
    <ListCard
      title="Long Range Goals"
      count={longRangeGoals.length}
      emptyTitle="No long range goals found for this date"
      emptyHint="Goals scored from outside the box show up here"
    >
      {longRangeGoals.map((g) => (
        <LinkRow key={g.id} links={g.links}>
          <div className="flex items-baseline flex-wrap gap-x-1.5 text-[11px]">
            <span className="font-semibold text-primary">{g.scorer}</span>
            {g.timeStr && (
              <span className="text-primary/45 font-mono text-[10px]">
                {g.timeStr}′
              </span>
            )}
            {g.distance != null && (
              <span className="text-secondary font-mono text-[10px] font-bold">
                ({Math.round(g.distance)}m)
              </span>
            )}
          </div>
          <p className="text-[10px] text-primary/50 truncate">
            {g.team} vs {g.opponent} · {g.leagueName}
          </p>
        </LinkRow>
      ))}
    </ListCard>
  );
}
