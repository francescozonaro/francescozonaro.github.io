import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import CollapsibleCard from "./CollapsibleCard";
import { getGoalSearchUrl, filterFavoriteMatches } from "./utilities";

export default function LongRangeGoalsWidget({
  allMatches = [],
  matchDetailsMap = {},
  isFavoriteLeague,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const longRangeGoals = useMemo(() => {
    const list = [];

    filterFavoriteMatches(allMatches, isFavoriteLeague).forEach((m) => {
      const goals = matchDetailsMap[m.id];
      if (!Array.isArray(goals)) return;

      goals.forEach((g) => {
        if (!g.isLongRangeGoal) return;
        const team = g.isHome ? m.home.name : m.away.name;
        const opponent = g.isHome ? m.away.name : m.home.name;

        list.push({
          id: `${m.id}-${g.minuteRaw}-${g.scorer}`,
          scorer: g.scorer || "Goal",
          team,
          opponent,
          leagueName: m.leagueName,
          time: g.time,
          distance: g.distance,
        });
      });
    });

    return list.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
  }, [allMatches, matchDetailsMap, isFavoriteLeague]);

  return (
    <CollapsibleCard
      title="Long Range Goals"
      badge={
        longRangeGoals.length > 0 && (
          <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-1 font-mono">
            {longRangeGoals.length} today
          </span>
        )
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="p-3.5 min-h-[220px] flex flex-col justify-between">
        {longRangeGoals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 py-8">
            <p className="text-[11px] text-primary/50 font-medium">
              No long range goals yet today
            </p>
            <p className="text-[10px] text-primary/35">
              Goals scored from outside the box show up here
            </p>
          </div>
        ) : (
          <ul className="space-y-2 min-h-[160px] max-h-72 overflow-y-auto no-scrollbar">
            {longRangeGoals.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-2 text-[11px] border-b border-background-light/20 pb-1.5 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <a
                      href={getGoalSearchUrl(g.scorer, g.team)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:text-secondary hover:underline transition-colors"
                      title={`Search ${g.scorer} on X`}
                    >
                      {g.scorer}
                    </a>
                    {g.distance !== null && g.distance !== undefined && (
                      <span className="text-secondary font-mono text-[10px] font-bold">
                        ({g.distance}m)
                      </span>
                    )}
                  </div>
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CollapsibleCard>
  );
}

LongRangeGoalsWidget.propTypes = {
  allMatches: PropTypes.array,
  matchDetailsMap: PropTypes.object,
  isFavoriteLeague: PropTypes.func,
};
