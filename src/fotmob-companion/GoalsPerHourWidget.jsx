import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import CollapsibleCard from "./CollapsibleCard";
import { filterFavoriteMatches } from "./utilities";

const LEAGUE_COLORS = [
  "#818CF8", // Indigo
  "#F43F5E", // Rose
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#06B6D4", // Cyan
  "#A855F7", // Purple
];

// Chart domain is clipped to this hour range; matches outside it aren't plotted
const DAY_START_HOUR = 12;
const DAY_END_HOUR = 24;
// Never show a window narrower than this, even right after the first goal of the day
const MIN_WINDOW_HOURS = 3;

const formatHour = (h) =>
  h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`;

export default function GoalsPerHourWidget({
  allMatches = [],
  matchDetailsMap = {},
  isFavoriteLeague,
}) {
  const [hoveredHour, setHoveredHour] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute cumulative goals per game by hour of day (12..24)
  const { leagueData, maxGpg, avgGpgToday, hasGoals, startHour, endHour } =
    useMemo(() => {
      const rawCounts = {}; // { [leagueName]: Array(25).fill(0) }
      const matchCounts = {}; // { [leagueName]: number }
      let totalGoals = 0;
      let totalGames = 0;
      let earliestGoalHour = null;

      const recordGoal = (league, hour, count) => {
        rawCounts[league][hour] += count;
        totalGoals += count;
        if (earliestGoalHour === null || hour < earliestGoalHour) {
          earliestGoalHour = hour;
        }
      };

      filterFavoriteMatches(allMatches, isFavoriteLeague).forEach((m) => {
        const league = m.leagueName || "Unknown League";

        if (!rawCounts[league]) {
          rawCounts[league] = Array(25).fill(0);
          matchCounts[league] = 0;
        }
        matchCounts[league] += 1;
        totalGames += 1;

        const details = matchDetailsMap[m.id];
        const kickoffTS = m.timeTS;

        if (details && Array.isArray(details) && details.length > 0) {
          details.forEach((g) => {
            if (kickoffTS) {
              const goalTS = kickoffTS + (g.minuteRaw || 0) * 60 * 1000;
              const hour = new Date(goalTS).getHours();
              if (hour >= DAY_START_HOUR && hour <= DAY_END_HOUR) {
                recordGoal(league, hour, 1);
              }
            }
          });
        } else {
          // Fallback to match score at kickoff hour if details not fetched/available
          const matchGoals = (m.home?.score || 0) + (m.away?.score || 0);
          if (matchGoals > 0 && kickoffTS) {
            const hour = new Date(kickoffTS).getHours();
            if (hour >= DAY_START_HOUR && hour <= DAY_END_HOUR) {
              recordGoal(league, hour, matchGoals);
            }
          }
        }
      });

      // Convert raw hourly counts into cumulative goals per game for each league
      const leagueList = Object.entries(rawCounts)
        .map(([name, hourlyArr]) => {
          const gamesInLeague = matchCounts[name] || 1;
          const cumGpgArr = Array(25).fill(0);
          const cumGoalsArr = Array(25).fill(0);
          let runningTotalGoals = 0;

          for (let h = 12; h <= 24; h++) {
            runningTotalGoals += hourlyArr[h] || 0;
            cumGoalsArr[h] = runningTotalGoals;
            cumGpgArr[h] =
              Math.round((runningTotalGoals / gamesInLeague) * 100) / 100;
          }

          return {
            name,
            rawHours: hourlyArr,
            cumGoals: cumGoalsArr,
            hours: cumGpgArr, // Cumulative goals per game values for line plot
            matchCount: gamesInLeague,
            totalGoals: runningTotalGoals,
            finalGpg: cumGpgArr[24] || 0,
          };
        })
        .sort((a, b) => b.finalGpg - a.finalGpg);

      // Take top 5 leagues by goals/game
      const topLeagues = leagueList.slice(0, 5);

      // Attach colors
      const formattedData = topLeagues.map((item, idx) => ({
        ...item,
        color: LEAGUE_COLORS[idx % LEAGUE_COLORS.length],
      }));

      // Find max cumulative goals per game across top leagues
      let maxGpgVal = 0;
      formattedData.forEach((l) => {
        for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
          const cnt = l.hours[h] || 0;
          if (cnt > maxGpgVal) maxGpgVal = cnt;
        }
      });

      const avgGpg =
        totalGames > 0 ? Math.round((totalGoals / totalGames) * 100) / 100 : 0;

      // Chart window: from the first goal of the day to now, clipped to the day
      // range and never narrower than MIN_WINDOW_HOURS.
      const currentHour = Math.min(
        DAY_END_HOUR,
        Math.max(DAY_START_HOUR, new Date().getHours()),
      );
      let windowStart = DAY_START_HOUR;
      let windowEnd = currentHour;
      if (earliestGoalHour !== null) {
        windowStart = Math.max(DAY_START_HOUR, earliestGoalHour);
        windowEnd = Math.max(currentHour, windowStart);

        const span = windowEnd - windowStart;
        if (span < MIN_WINDOW_HOURS) {
          const deficit = MIN_WINDOW_HOURS - span;
          const extendedStart = Math.max(DAY_START_HOUR, windowStart - deficit);
          const backwardExtend = windowStart - extendedStart;
          windowStart = extendedStart;
          windowEnd = Math.min(
            DAY_END_HOUR,
            windowEnd + (deficit - backwardExtend),
          );
        }
      }

      return {
        leagueData: formattedData,
        maxGpg: maxGpgVal,
        avgGpgToday: avgGpg,
        hasGoals: totalGoals > 0,
        startHour: windowStart,
        endHour: windowEnd,
      };
    }, [allMatches, matchDetailsMap, isFavoriteLeague]);

  // SVG dimensions
  const svgWidth = 300;
  const svgHeight = 135;
  const paddingLeft = 26;
  const paddingRight = 12;
  const paddingTop = 14;
  const paddingBottom = 22;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const maxY = Math.max(2, Math.ceil(maxGpg * 10) / 10);
  const windowSpan = Math.max(1, endHour - startHour);

  // Map hour within [startHour, endHour] to X coordinate
  const getX = (hour) =>
    paddingLeft + ((hour - startHour) / windowSpan) * plotWidth;
  const getY = (val) => paddingTop + plotHeight - (val / maxY) * plotHeight;

  // Horizontal gridlines (Y-axis ticks formatted to 1 decimal place)
  const yTicks = [0, Number((maxY / 2).toFixed(1)), Number(maxY.toFixed(1))];
  // X-axis ticks: up to 5 evenly spaced hours across the current window
  const xTickCount = Math.min(windowSpan, 4);
  const xTicks = [
    ...new Set(
      Array.from({ length: xTickCount + 1 }, (_, i) =>
        Math.round(startHour + (i * windowSpan) / xTickCount),
      ),
    ),
  ];

  const displayedLeagues = selectedLeague
    ? leagueData.filter((l) => l.name === selectedLeague)
    : leagueData;

  // Current hovered hour info
  const hoveredInfo =
    hoveredHour !== null
      ? {
          hour: hoveredHour,
          timeStr: formatHour(hoveredHour),
          leagues: leagueData
            .map((l) => ({
              name: l.name,
              gpg: l.hours[hoveredHour] || 0,
              totalGoalsSoFar: l.cumGoals ? l.cumGoals[hoveredHour] || 0 : 0,
              matchCount: l.matchCount,
              added: l.rawHours ? l.rawHours[hoveredHour] || 0 : 0,
              color: l.color,
            }))
            .filter((l) => l.gpg > 0 || selectedLeague === l.name),
        }
      : null;

  return (
    <CollapsibleCard
      title="Hourly Goals Telemetry"
      badge={
        <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-1 font-mono">
          {avgGpgToday.toFixed(2)} Goals/Game
        </span>
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    >
      {/* Main Card Content */}
      <div className="p-3.5 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
        {/* Subheader / Hover indicator */}
        <div className="flex items-center justify-between mb-1 text-[10px]">
          <span className="font-semibold text-primary/60 uppercase tracking-wider">
            Cumulative Goals / Game
            {hasGoals && ` (${formatHour(startHour)} - ${formatHour(endHour)})`}
          </span>
          {hoveredInfo && (
            <span className="font-mono text-secondary font-bold text-[10px]">
              {hoveredInfo.timeStr}
            </span>
          )}
        </div>

        {!hasGoals ? (
          <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center text-center gap-1">
            <p className="text-[11px] text-primary/50 font-medium">
              No goals yet today
            </p>
            <p className="text-[10px] text-primary/35">
              Chart appears once a tracked league scores
            </p>
          </div>
        ) : (
          <>
            {/* League Legend Buttons */}
            {leagueData.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {leagueData.map((l) => {
                  const isSelected = selectedLeague === l.name;
                  return (
                    <button
                      key={l.name}
                      onClick={() =>
                        setSelectedLeague(isSelected ? null : l.name)
                      }
                      className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] transition-all cursor-pointer border ${
                        isSelected
                          ? "border-secondary bg-secondary/15 font-bold text-primary"
                          : "border-transparent bg-background-dark/40 text-primary/70 hover:text-primary"
                      }`}
                      title={`${l.name}: ${l.totalGoals} goals in ${l.matchCount} ${
                        l.matchCount === 1 ? "game" : "games"
                      } (${l.finalGpg.toFixed(2)} g/game)`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: l.color }}
                      />
                      <span className="truncate max-w-[80px]">{l.name}</span>
                      <span className="text-[8px] opacity-60">
                        ({l.finalGpg.toFixed(2)}/g)
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* SVG Chart */}
            <div className="relative flex-1 w-full min-h-[110px] flex items-center justify-center">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible select-none"
              >
                {/* Horizontal Grid Lines & Y Axis Labels */}
                {yTicks.map((tick) => {
                  const y = getY(tick);
                  return (
                    <g key={`y-${tick}`}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity={0.08}
                        strokeDasharray={tick === 0 ? "none" : "3 3"}
                      />
                      <text
                        x={paddingLeft - 5}
                        y={y + 2.5}
                        textAnchor="end"
                        className="text-[7px] fill-primary/40 font-mono select-none"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {xTicks.map((hour) => {
                  const x = getX(hour);
                  return (
                    <text
                      key={`x-${hour}`}
                      x={x}
                      y={svgHeight - 4}
                      textAnchor="middle"
                      className="text-[7px] fill-primary/40 font-mono select-none"
                    >
                      {String(hour).padStart(2, "0")}h
                    </text>
                  );
                })}

                {/* Hover Vertical Guideline */}
                {hoveredHour !== null && (
                  <line
                    x1={getX(hoveredHour)}
                    y1={paddingTop}
                    x2={getX(hoveredHour)}
                    y2={paddingTop + plotHeight}
                    stroke="currentColor"
                    strokeDasharray="2 2"
                    className="text-secondary/50 stroke-[1]"
                  />
                )}

                {/* Line Plots per League */}
                {displayedLeagues.map((league) => {
                  const points = [];
                  for (let h = startHour; h <= endHour; h++) {
                    const val = league.hours[h] || 0;
                    points.push({
                      x: getX(h),
                      y: getY(val),
                      val,
                      hour: h,
                    });
                  }

                  const pathD = points
                    .map(
                      (p, idx) =>
                        `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,
                    )
                    .join(" ");

                  return (
                    <g key={league.name}>
                      {/* Line stroke */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={league.color}
                        strokeWidth={selectedLeague === league.name ? 1.8 : 1.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={
                          selectedLeague && selectedLeague !== league.name
                            ? 0.2
                            : 0.85
                        }
                      />

                      {/* Data Points */}
                      {points.map((p) => {
                        const isHovered = hoveredHour === p.hour;
                        if (p.val === 0 && !isHovered) return null;
                        return (
                          <circle
                            key={`pt-${league.name}-${p.hour}`}
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 3.5 : 1.8}
                            fill={league.color}
                            stroke="rgb(var(--color-background-dark))"
                            strokeWidth={0.8}
                            opacity={
                              selectedLeague && selectedLeague !== league.name
                                ? 0.2
                                : 1
                            }
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Transparent Interactive Hover Rectangles for each hour in the window */}
                {Array.from(
                  { length: endHour - startHour + 1 },
                  (_, i) => startHour + i,
                ).map((h) => {
                  const stepX = plotWidth / windowSpan;
                  const x = getX(h) - stepX / 2;
                  return (
                    <rect
                      key={`hover-rect-${h}`}
                      x={x}
                      y={paddingTop}
                      width={stepX}
                      height={plotHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredHour(h)}
                      onMouseLeave={() => setHoveredHour(null)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip / Detail Footer */}
            <div className="mt-1.5 min-h-[24px] border-t border-background-light/30 pt-1 text-[9px] text-primary/70 flex items-center justify-between">
              {hoveredInfo ? (
                <div className="w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                  <span className="font-semibold text-secondary flex-shrink-0">
                    {hoveredInfo.timeStr}:
                  </span>
                  {hoveredInfo.leagues.length > 0 ? (
                    <div className="flex items-center space-x-2 truncate">
                      {hoveredInfo.leagues.map((l) => (
                        <span
                          key={l.name}
                          className="flex items-center space-x-1"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ backgroundColor: l.color }}
                          />
                          <span className="truncate max-w-[70px]">
                            {l.name}
                          </span>
                          <span className="font-bold text-primary font-mono">
                            {l.gpg.toFixed(2)}/g
                            <span className="text-[8px] font-normal text-primary/50 ml-0.5">
                              ({l.totalGoalsSoFar}g)
                            </span>
                            {l.added > 0 && (
                              <span className="text-[8px] text-secondary font-semibold ml-0.5">
                                (+{l.added})
                              </span>
                            )}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-primary/40 italic">
                      No goals scored in this hour
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-full flex items-center justify-between text-primary/40 text-[9px]">
                  <span>Hover over chart to inspect hourly goal breakdown</span>
                  {selectedLeague && (
                    <button
                      onClick={() => setSelectedLeague(null)}
                      className="text-secondary hover:underline cursor-pointer text-[8px]"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </CollapsibleCard>
  );
}

GoalsPerHourWidget.propTypes = {
  allMatches: PropTypes.array,
  matchDetailsMap: PropTypes.object,
  isFavoriteLeague: PropTypes.func,
};
