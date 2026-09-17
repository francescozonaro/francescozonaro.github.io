import { useState } from "react";
import {
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import PageHeader from "../components/PageHeader";
import { usePageIcon } from "../hooks/usePageIcon";
import { getAppIcon } from "../config/appIcons";
import { FavoriteMatchesWidget } from "./components/FavoriteMatchesWidget";
import { LongRangeGoalsWidget } from "./components/LongRangeGoalsWidget";
import { ShotQualityWidget } from "./components/ShotQualityWidget";
import { useMatchesForDate } from "./hooks/useMatchesForDate";
import { useMatchDetails } from "./hooks/useMatchDetails";
import { getLocalDateString, shiftDateString, formatDateLabel } from "./utils/date";
import { isFavoriteMatch } from "./utils/favorites";

export default function FotmobCompanion() {
  usePageIcon(getAppIcon("fotmob-companion"));

  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState("");

  const { matches } = useMatchesForDate(selectedDate);
  const matchDetailsMap = useMatchDetails(matches, selectedDate);

  const favoriteMatches = matches.filter(isFavoriteMatch);
  let filteredMatches = favoriteMatches;

  if (searchQuery.trim() !== "") {
    const q = searchQuery.trim().toLowerCase();
    filteredMatches = filteredMatches.filter(
      (m) =>
        m.home.name.toLowerCase().includes(q) ||
        m.away.name.toLowerCase().includes(q) ||
        m.leagueName.toLowerCase().includes(q),
    );
  }

  return (
    <div className="w-11/12 xl:w-5/6 mx-auto font-sans py-6 flex flex-col">
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
          <div className="flex items-center justify-center flex-shrink-0 flex-1 min-w-52 px-3 py-0.5 gap-4 rounded-md border border-background-dark bg-background-dark/80 text-primary">
            <button
              onClick={() => setSelectedDate(shiftDateString(selectedDate, -1))}
              className="p-1 text-primary/70 hover:text-primary cursor-pointer"
            >
              <HiChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-primary whitespace-nowrap text-center min-w-28">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 items-start">
        <div className="space-y-3">
          <FavoriteMatchesWidget matches={matches} />
          <LongRangeGoalsWidget
            matches={filteredMatches}
            matchDetailsMap={matchDetailsMap}
          />
        </div>

        <div className="space-y-3">
          <ShotQualityWidget
            matches={filteredMatches}
            matchDetailsMap={matchDetailsMap}
          />
        </div>
      </div>
    </div>
  );
}
