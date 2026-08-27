import { useState } from "react";
import {
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import PageHeader from "../components/PageHeader";
import { LeagueFixturesWidget } from "./components/LeagueFixturesWidget";
import { LongRangeGoalsWidget } from "./components/LongRangeGoalsWidget";
import { useMatchesForDate } from "./hooks/useMatchesForDate";
import { useMatchDetails } from "./hooks/useMatchDetails";
import { getLocalDateString, shiftDateString, formatDateLabel } from "./utils/date";
import { isFavoriteMatch } from "./utils/favorites";
import { isMatchActive } from "./utils/matchUtils";

export default function FotmobCompanion() {
  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyLive, setShowOnlyLive] = useState(true);
  const [collapsedLeagues, setCollapsedLeagues] = useState({});
  const [hiddenScorersLeagues, setHiddenScorersLeagues] = useState({});

  const isToday = selectedDate === todayStr;
  const effectiveShowOnlyLive = isToday && showOnlyLive;

  const { matches } = useMatchesForDate(selectedDate);
  const matchDetailsMap = useMatchDetails(matches);

  function toggleCollapseLeague(leagueName) {
    setCollapsedLeagues((prev) => ({
      ...prev,
      [leagueName]: !prev[leagueName],
    }));
  }

  function toggleHideScorers(leagueName) {
    setHiddenScorersLeagues((prev) => ({
      ...prev,
      [leagueName]: !prev[leagueName],
    }));
  }

  const favoriteMatches = matches.filter(isFavoriteMatch);
  let filteredMatches = favoriteMatches;

  if (effectiveShowOnlyLive) {
    filteredMatches = filteredMatches.filter(isMatchActive);
  }

  if (searchQuery.trim() !== "") {
    const q = searchQuery.trim().toLowerCase();
    filteredMatches = filteredMatches.filter(
      (m) =>
        m.home.name.toLowerCase().includes(q) ||
        m.away.name.toLowerCase().includes(q) ||
        m.leagueName.toLowerCase().includes(q),
    );
  }

  const groupedLeagues = {};
  filteredMatches.forEach((m) => {
    if (!groupedLeagues[m.leagueName]) {
      groupedLeagues[m.leagueName] = { name: m.leagueName, matches: [] };
    }
    groupedLeagues[m.leagueName].matches.push(m);
  });

  return (
    <div className="w-11/12 xl:w-5/6 mx-auto font-sans py-6 h-screen flex flex-col overflow-hidden">
      <PageHeader className="mb-16">
        <span>FotMob Siphon</span>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
          <input
            type="text"
            placeholder="Search teams or leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="inputField w-full pl-9 pr-3 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-stretch sm:items-center gap-2">
          <button
            onClick={() => isToday && setShowOnlyLive(!showOnlyLive)}
            disabled={!isToday}
            className={`iconButton whitespace-nowrap sm:flex-none justify-center ${
              !isToday
                ? "opacity-40 cursor-not-allowed border border-background-dark/40 bg-background-dark/40 text-primary/40"
                : effectiveShowOnlyLive
                  ? "accentButton"
                  : "cardComponent"
            }`}
            title={!isToday ? "Live filtering is only active for today" : ""}
          >
            {effectiveShowOnlyLive ? "Live Only" : "All Matches"}
          </button>

          <div className="flex items-center justify-center flex-shrink-0 flex-1 px-3 py-0.5 gap-4 rounded-md border border-background-dark bg-background-dark/80 text-primary">
            <button
              onClick={() => setSelectedDate(shiftDateString(selectedDate, -1))}
              className="p-1 text-primary/70 hover:text-primary cursor-pointer"
            >
              <HiChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-primary whitespace-nowrap">
              {formatDateLabel(selectedDate)}
            </span>
            <button
              onClick={() => setSelectedDate(shiftDateString(selectedDate, 1))}
              className="p-1 text-primary/70 hover:text-primary cursor-pointer"
            >
              <HiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 mt-4">
        <div className="min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-1">
          <LeagueFixturesWidget
            groupedLeagues={groupedLeagues}
            collapsedLeagues={collapsedLeagues}
            hiddenScorersLeagues={hiddenScorersLeagues}
            toggleCollapseLeague={toggleCollapseLeague}
            toggleHideScorers={toggleHideScorers}
            matchDetailsMap={matchDetailsMap}
            showOnlyLive={effectiveShowOnlyLive}
          />
        </div>

        <div className="min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-1">
          <LongRangeGoalsWidget
            matches={favoriteMatches}
            matchDetailsMap={matchDetailsMap}
          />
        </div>
      </div>
    </div>
  );
}
