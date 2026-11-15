import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { SearchInput } from "../components/SearchInput";
import { DateNavigator } from "../components/DateNavigator";
import { usePageIcon } from "../hooks/usePageIcon";
import { getAppIcon } from "../config/appIcons";
import { FavoriteMatchesWidget } from "./components/FavoriteMatchesWidget";
import { LongRangeGoalsWidget } from "./components/LongRangeGoalsWidget";
import { ShotQualityWidget } from "./components/ShotQualityWidget";
import { useMatchesForDate } from "./hooks/useMatchesForDate";
import { useMatchDetails } from "./hooks/useMatchDetails";
import { getLocalDateString } from "./utils/date";
import { isFavoriteMatch } from "./utils/favorites";

export default function FotmobCompanion() {
  usePageIcon(getAppIcon("fotmob-companion"));

  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState("");

  const { matches, failed } = useMatchesForDate(selectedDate);

  const favoriteMatches = useMemo(() => matches.filter(isFavoriteMatch), [matches]);
  const matchDetailsMap = useMatchDetails(favoriteMatches, selectedDate);
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
    <div className="w-[75%] mx-auto font-sans py-6 flex flex-col">
      <PageHeader className="mb-16">
        <span>FotMob Siphon</span>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search teams or leagues..."
        />
        <DateNavigator date={selectedDate} onChange={setSelectedDate} />
      </div>

      {failed && (
        <p className="mt-4 text-[11px] text-center text-primary/60 font-medium">
          Could not load matches. Check your connection or try again later.
        </p>
      )}

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
