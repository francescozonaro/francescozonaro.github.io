import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { BoltIcon } from "@heroicons/react/24/solid";
import CollapsibleCard from "./CollapsibleCard";
import { getGoalSearchUrl } from "./goalSearchUrl";

export default function GreatGoalsWidget({
  allMatches = [],
  matchDetailsMap = {},
  isFavoriteLeague,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const greatGoals = useMemo(() => {
    const list = [];

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
        if (!g.isGreatGoal) return;
        const team = g.isHome ? m.home.name : m.away.name;
        const opponent = g.isHome ? m.away.name : m.home.name;

        list.push({
          id: `${m.id}-${g.minuteRaw}-${g.scorer}`,
          scorer: g.scorer || "Goal",
          team,
          opponent,
          leagueName: m.leagueName,
          time: g.time,
          xG: g.xG,
          sortKey: (m.timeTS || 0) + (g.minuteRaw || 0) * 60000,
        });
      });
    });

    return list.sort((a, b) => b.sortKey - a.sortKey);
  }, [allMatches, matchDetailsMap, isFavoriteLeague]);

  return (
    <CollapsibleCard
      icon={BoltIcon}
      title="Great Goals"
      badge={
        <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-1 font-mono">
          {greatGoals.length} today
        </span>
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="p-3">
        {greatGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-1 py-6">
            <p className="text-[11px] text-primary/50 font-medium">
              No great goals yet today
            </p>
            <p className="text-[10px] text-primary/35">
              Long-range strikes, free kicks, and low-odds finishes show up
              here
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
            {greatGoals.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-2 text-[11px] border-b border-background-light/20 pb-1.5 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={getGoalSearchUrl(g.scorer, g.team)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:text-secondary hover:underline transition-colors"
                    title={`Search ${g.scorer} on X`}
                  >
                    {g.scorer}
                  </a>
                  <p className="text-[10px] text-primary/50 truncate">
                    {g.team} vs {g.opponent} · {g.leagueName}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {g.time && (
                    <span className="text-primary/45 font-mono text-[10px] block">
                      {g.time}
                    </span>
                  )}
                  {g.xG !== null && g.xG !== undefined && (
                    <span className="text-secondary font-mono text-[9px] block">
                      xG {g.xG.toFixed(2)}
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

GreatGoalsWidget.propTypes = {
  allMatches: PropTypes.array,
  matchDetailsMap: PropTypes.object,
  isFavoriteLeague: PropTypes.func,
};
