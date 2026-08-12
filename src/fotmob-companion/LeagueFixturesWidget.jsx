import { useState } from "react";
import PropTypes from "prop-types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import CollapsibleCard from "./CollapsibleCard";
import { TeamLogo, getDisplayGoals, getGoalSearchUrl } from "./utilities";

export default function LeagueFixturesWidget({
  groupedLeagues = {},
  collapsedLeagues = {},
  hiddenScorersLeagues = {},
  toggleCollapseLeague,
  toggleHideScorers,
  matchDetailsMap = {},
  showOnlyLive = false,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const groups = Object.values(groupedLeagues);

  if (groups.length === 0) {
    return (
      <CollapsibleCard
        title="No leagues found"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="p-3.5 min-h-[220px] flex flex-col justify-between">
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <p className="text-[11px] text-primary/50 font-medium">
              {showOnlyLive
                ? "There are currently no active live matches for the selected search."
                : "No leagues found under this filter."}
            </p>
          </div>
        </div>
      </CollapsibleCard>
    );
  }

  return (
    <>
      {groups.map((group, groupIdx) => {
        const isCollapsed = !!collapsedLeagues[group.name];
        const areScorersHidden = !!hiddenScorersLeagues[group.name];

        return (
          <CollapsibleCard
            key={groupIdx}
            title={group.name}
            badge={
              <span className="text-xs text-primary/50 font-mono">
                ({group.matches.length})
              </span>
            }
            actions={
              <button
                onClick={() => toggleHideScorers(group.name)}
                className={`p-1 rounded transition-colors border ${
                  areScorersHidden
                    ? "border-secondary/40 bg-secondary/15 text-secondary"
                    : "border-background-dark/60 bg-background-dark/50 text-primary/60 hover:text-primary hover:bg-background-darker"
                }`}
                title={areScorersHidden ? "Show scorers" : "Hide scorers"}
              >
                {areScorersHidden ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            }
            isCollapsed={isCollapsed}
            onToggleCollapse={() => toggleCollapseLeague(group.name)}
          >
            <div className="divide-y divide-background-light/30">
              {group.matches.map((m) => {
                const matchGoals = matchDetailsMap[m.id] || [];
                const rawHomeGoals = matchGoals.filter((g) => g.isHome);
                const rawAwayGoals = matchGoals.filter((g) => !g.isHome);

                const homeGoals = getDisplayGoals(
                  rawHomeGoals,
                  m.home.score,
                  true,
                );
                const awayGoals = getDisplayGoals(
                  rawAwayGoals,
                  m.away.score,
                  false,
                );
                const hasGoals =
                  (m.home.score > 0 || m.away.score > 0) &&
                  (homeGoals.length > 0 || awayGoals.length > 0);

                return (
                  <div
                    key={m.id}
                    className="p-3.5 hover:bg-background-darker transition-colors flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-14 flex-shrink-0 flex items-center justify-start">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded font-mono ${
                            m.isActive
                              ? "bg-secondary/15 text-secondary animate-pulse font-bold"
                              : "text-primary/60 bg-background-dark/40"
                          }`}
                        >
                          {m.minute}
                        </span>
                      </div>

                      <div className="flex-1 flex items-center justify-end space-x-2 text-right">
                        <span className="font-semibold text-sm line-clamp-1">
                          {m.home.name}
                        </span>
                        <TeamLogo src={m.homeLogo} />
                      </div>

                      {/* Score Badge (Centered) */}
                      <div className="px-3 min-w-[75px] text-center flex-shrink-0">
                        <div
                          className={`font-mono text-base font-extrabold tracking-wider px-2 py-0.5 rounded transition-colors ${
                            m.isActive
                              ? "bg-secondary/10 text-secondary border border-secondary/20"
                              : "bg-background-dark text-primary/70 border border-transparent"
                          }`}
                        >
                          {m.isActive || m.finished || m.minute === "FT"
                            ? `${m.home.score} - ${m.away.score}`
                            : "-"}
                        </div>
                      </div>

                      <div className="flex-1 flex items-center justify-start space-x-2 text-left">
                        <TeamLogo src={m.awayLogo} />
                        <span className="font-semibold text-sm line-clamp-1">
                          {m.away.name}
                        </span>
                      </div>
                    </div>

                    {/* Scorers List Below Score (only if hasGoals and scorers not hidden for this league) */}
                    {hasGoals && !areScorersHidden && (
                      <div className="flex items-start justify-between text-[11px] pt-1.5 border-t border-background-dark/20 gap-2">
                        <div className="w-14 flex-shrink-0" />

                        {/* Home Team Scorers (Right Aligned) */}
                        <div className="flex-1 text-right space-y-1">
                          {homeGoals.map((g, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-end space-x-1.5 flex-wrap"
                            >
                              {g.isLongRangeGoal && (
                                <span className="text-[9px] font-bold text-secondary bg-secondary/15 px-1 py-0.5 rounded uppercase tracking-wider">
                                  LRG
                                </span>
                              )}
                              <a
                                href={getGoalSearchUrl(g.scorer, m.home.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary/70 hover:text-secondary hover:underline cursor-pointer transition-colors font-medium"
                                title={`Search ${g.scorer || "goal"} on X`}
                              >
                                {g.scorer || "Goal"}
                              </a>
                              {g.time && (
                                <span className="text-primary/45 font-mono text-[10px]">
                                  {g.time}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Score Box Spacer */}
                        <div className="px-3 min-w-[75px] flex-shrink-0" />

                        {/* Away Team Scorers (Left Aligned) */}
                        <div className="flex-1 text-left space-y-1">
                          {awayGoals.map((g, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-start space-x-1.5 flex-wrap"
                            >
                              {g.time && (
                                <span className="text-primary/45 font-mono text-[10px]">
                                  {g.time}
                                </span>
                              )}
                              <a
                                href={getGoalSearchUrl(g.scorer, m.away.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary/70 hover:text-secondary hover:underline cursor-pointer transition-colors font-medium"
                                title={`Search ${g.scorer || "goal"} on X`}
                              >
                                {g.scorer || "Goal"}
                              </a>
                              {g.isLongRangeGoal && (
                                <span className="text-[9px] font-bold text-secondary bg-secondary/15 px-1 py-0.5 rounded uppercase tracking-wider">
                                  LRG
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleCard>
        );
      })}
    </>
  );
}

LeagueFixturesWidget.propTypes = {
  groupedLeagues: PropTypes.object,
  collapsedLeagues: PropTypes.object,
  hiddenScorersLeagues: PropTypes.object,
  toggleCollapseLeague: PropTypes.func.isRequired,
  toggleHideScorers: PropTypes.func.isRequired,
  matchDetailsMap: PropTypes.object,
  showOnlyLive: PropTypes.bool,
};
