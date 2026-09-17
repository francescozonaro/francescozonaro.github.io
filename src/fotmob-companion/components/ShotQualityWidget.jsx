import { useMemo, useState } from "react";
import { CollapsibleCard } from "../../components/CollapsibleCard";
import { getRedditSearchUrl } from "../utils/goalEvents";

export function ShotQualityWidget({ matches = [], matchDetailsMap = {} }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <CollapsibleCard
      title="Shot Quality"
      badge={
        greatFinishes.length > 0 && (
          <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-1 font-mono">
            {greatFinishes.length}
          </span>
        )
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="p-3.5 min-h-[220px] flex flex-col justify-between">
        {greatFinishes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 py-8">
            <p className="text-[11px] text-primary/50 font-medium">
              No standout finishes found for this date
            </p>
            <p className="text-[10px] text-primary/35">
              Goals where the finish beat the chance quality show up here
            </p>
          </div>
        ) : (
          <ul className="space-y-2 min-h-[160px] max-h-72 overflow-y-auto no-scrollbar">
            {greatFinishes.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-2 text-[11px] border-b border-background-dark/20 pb-1.5 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <a
                      href={getRedditSearchUrl(g.scorer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:text-secondary hover:underline transition-colors"
                      title={`Search ${g.scorer} on r/soccer`}
                    >
                      {g.scorer}
                    </a>
                    {g.delta !== null && g.delta !== undefined && (
                      <span className="text-secondary font-mono text-[10px] font-bold">
                        (Δ {g.delta.toFixed(2)})
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-primary/50 truncate">
                    {g.team} vs {g.opponent} · {g.leagueName}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {g.timeStr && (
                    <span className="text-primary/45 font-mono text-[10px] block">
                      {g.timeStr}′
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CollapsibleCard>
  );
}
