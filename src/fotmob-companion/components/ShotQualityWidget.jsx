import { useMemo } from "react";
import { ListCard } from "../../components/ListCard";
import { LinkRow } from "../../components/LinkRow";
import { getGoalSearchLinks } from "../utils/goalEvents";

export function ShotQualityWidget({ matches = [], matchDetailsMap = {} }) {
  const greatFinishes = useMemo(() => {
    const list = [];

    matches.forEach((m) => {
      const goals = matchDetailsMap[m.id];
      if (!Array.isArray(goals)) return;

      goals.forEach((g) => {
        if (!g.isGreatFinish) return;
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
          delta: g.delta,
        });
      });
    });

    return list.sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  }, [matches, matchDetailsMap]);

  return (
    <ListCard
      title="Shot Quality"
      count={greatFinishes.length}
      emptyTitle="No standout finishes found for this date"
      emptyHint="Goals where the finish beat the chance quality show up here"
    >
      {greatFinishes.map((g) => (
        <LinkRow key={g.id} links={g.links}>
          <div className="flex items-baseline flex-wrap gap-x-1.5 text-[11px]">
            <span className="font-semibold text-primary">{g.scorer}</span>
            {g.delta != null && (
              <span className="text-secondary font-mono text-[10px] font-bold">
                (Δ {g.delta.toFixed(2)})
              </span>
            )}
          </div>
          <p className="text-[10px] text-primary/50 truncate">
            {g.timeStr && (
              <span className="text-primary/45 font-mono mr-1.5">
                {g.timeStr}′
              </span>
            )}
            {g.team} vs {g.opponent} · {g.leagueName}
          </p>
        </LinkRow>
      ))}
    </ListCard>
  );
}
