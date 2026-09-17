import { useMemo, useState } from "react";
import { CollapsibleCard } from "../../components/CollapsibleCard";
import { TeamLogo } from "./TeamLogo";
import { isFavoriteTeamMatch } from "../utils/favorites";
import { isMatchActive, getMatchMinuteLabel } from "../utils/matchUtils";

export function FavoriteMatchesWidget({ matches = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const favoriteMatches = useMemo(
    () => matches.filter(isFavoriteTeamMatch),
    [matches],
  );

  if (favoriteMatches.length === 0) return null;

  return (
    <CollapsibleCard
      title="Favorites"
      badge={
        <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-1 font-mono">
          {favoriteMatches.length}
        </span>
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="min-h-12 max-h-72 overflow-y-auto no-scrollbar">
        {favoriteMatches.map((m) => {
          const active = isMatchActive(m);
          const minuteLabel = getMatchMinuteLabel(m);

          return (
            <div
              key={m.id}
              className="p-3 flex items-center justify-between gap-2"
            >
              <div className="w-10 flex-shrink-0 flex items-center justify-start">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono ${
                    active
                      ? "bg-secondary/15 text-secondary animate-pulse font-bold"
                      : "text-primary/60 bg-background-dark/40"
                  }`}
                >
                  {minuteLabel}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex items-center justify-end space-x-1.5 text-right">
                <span className="font-semibold text-[11px] truncate">
                  {m.home.name}
                </span>
                <TeamLogo
                  url={m.homeLogo}
                  customCss="w-4 h-4 flex-shrink-0"
                />
              </div>

              <div className="px-2 min-w-[50px] text-center flex-shrink-0">
                <div
                  className={`font-mono text-[11px] font-extrabold tracking-wider px-1.5 py-0.5 rounded transition-colors ${
                    active
                      ? "bg-secondary/10 text-secondary border border-secondary/20"
                      : "bg-background-dark text-primary/70 border border-transparent"
                  }`}
                >
                  {active || m.finished
                    ? `${m.home.score} - ${m.away.score}`
                    : "-"}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex items-center justify-start space-x-1.5 text-left">
                <TeamLogo
                  url={m.awayLogo}
                  customCss="w-4 h-4 flex-shrink-0"
                />
                <span className="font-semibold text-[11px] truncate">
                  {m.away.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleCard>
  );
}
