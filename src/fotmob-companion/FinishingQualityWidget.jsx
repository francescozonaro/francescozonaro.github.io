import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { ChartBarIcon } from "@heroicons/react/24/solid";
import CollapsibleCard from "./CollapsibleCard";

const MAX_ROWS = 8;

export default function FinishingQualityWidget({
  allMatches = [],
  matchDetailsMap = {},
  isFavoriteLeague,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const teams = useMemo(() => {
    const byTeam = {};

    (allMatches || []).forEach((m) => {
      if (
        typeof isFavoriteLeague === "function" &&
        !isFavoriteLeague(m.leagueName, m.leagueId)
      ) {
        return;
      }

      const goals = matchDetailsMap[m.id];
      if (!Array.isArray(goals)) return;

      goals.forEach((g) => {
        if (g.xG === null || g.xG === undefined) return;
        const team = g.isHome ? m.home.name : m.away.name;
        if (!byTeam[team]) byTeam[team] = { team, goals: 0, xgSum: 0 };
        byTeam[team].goals += 1;
        byTeam[team].xgSum += g.xG;
      });
    });

    const maxDelta = Math.max(
      0.01,
      ...Object.values(byTeam).map((t) => t.goals - t.xgSum),
    );

    return Object.values(byTeam)
      .map((t) => {
        const delta = Math.round((t.goals - t.xgSum) * 100) / 100;
        return { ...t, delta, barPct: Math.max(4, (delta / maxDelta) * 100) };
      })
      .sort((a, b) => b.delta - a.delta)
      .slice(0, MAX_ROWS);
  }, [allMatches, matchDetailsMap, isFavoriteLeague]);

  return (
    <CollapsibleCard
      icon={ChartBarIcon}
      title="Clinical Finishing"
      badge={
        <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-1 font-mono">
          Today
        </span>
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="p-3">
        <p className="text-[10px] text-primary/40 mb-2">
          Goals scored minus the xG of those chances — highest means the most
          efficient finishing today.
        </p>

        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-1 py-6">
            <p className="text-[11px] text-primary/50 font-medium">
              No rated goals yet today
            </p>
            <p className="text-[10px] text-primary/35">
              Leaderboard appears once a tracked league scores
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {teams.map((t) => (
              <li key={t.team} className="text-[11px]">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-primary truncate max-w-[60%]">
                    {t.team}
                  </span>
                  <span className="font-mono text-secondary font-bold">
                    +{t.delta.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-background-dark/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-secondary/70"
                      style={{ width: `${t.barPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-primary/40 font-mono flex-shrink-0">
                    {t.goals}g · {t.xgSum.toFixed(2)}xg
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CollapsibleCard>
  );
}

FinishingQualityWidget.propTypes = {
  allMatches: PropTypes.array,
  matchDetailsMap: PropTypes.object,
  isFavoriteLeague: PropTypes.func,
};
