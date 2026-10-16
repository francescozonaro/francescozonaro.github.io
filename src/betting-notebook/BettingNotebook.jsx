import { useEffect, useMemo, useState } from "react";
import {
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
  HiPlus,
  HiCheck,
} from "react-icons/hi2";
import PageHeader from "../components/PageHeader";
import { CollapsibleCard } from "../components/CollapsibleCard";
import { LinkRow } from "../components/LinkRow";
import { usePageIcon } from "../hooks/usePageIcon";
import { getAppIcon } from "../config/appIcons";
import { useMatchesForDate } from "../fotmob-companion/hooks/useMatchesForDate";
import {
  getLocalDateString,
  shiftDateString,
  formatDateLabel,
} from "../fotmob-companion/utils/date";

const STORAGE_KEY = "betting-notebook-picks";

// FotMob league ids (see fotmob-companion/utils/favorites.js) for the
// top-5 European leagues plus Serie B, Serie C, the Championship, the
// UEFA Nations League and the Champions/Europa/Conference League.
// The order here is the order the league cards are displayed in.
const LEAGUE_ORDER = [
  42, // Champions League
  55, // Serie A (Italy)
  86, // Serie B (Italy)
  147, // Serie C (Italy) - shared id across all groups
  47, // Premier League (England)
  73, // Europa League
  10216, // Conference League
  87, // LaLiga (Spain)
  54, // Bundesliga (Germany)
  53, // Ligue 1 (France)
  48, // Championship (England)
  9806, // UEFA Nations League A
  9807, // UEFA Nations League B
  9808, // UEFA Nations League C
  9809, // UEFA Nations League D
];
const BET_OPTIONS = ["1X2", "DC", "GG/NG", "O/U", "DNB"];
const ALLOWED_LEAGUE_IDS = new Set(LEAGUE_ORDER);

function loadPicks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export default function BettingNotebook() {
  usePageIcon(getAppIcon("betting-notebook"));

  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [picks, setPicks] = useState(loadPicks);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [slipCollapsed, setSlipCollapsed] = useState(false);

  const { matches: allMatches } = useMatchesForDate(selectedDate);
  const matches = useMemo(
    () => allMatches.filter((m) => ALLOWED_LEAGUE_IDS.has(m.leagueId)),
    [allMatches],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    } catch {
      // storage unavailable (private mode, quota): slip still works in memory
    }
  }, [picks]);

  function addPick(match) {
    setPicks((prev) => {
      if (prev[match.id]) return prev;
      return {
        ...prev,
        [match.id]: {
          matchId: match.id,
          homeName: match.home.name,
          awayName: match.away.name,
          leagueName: match.leagueName,
          utcTime: match.utcTime,
          options: [],
          note: "",
          addedAt: Date.now(),
        },
      };
    });
  }

  function removePick(matchId) {
    setPicks((prev) => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
  }

  function updateNote(matchId, note) {
    setPicks((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], note },
    }));
  }

  function toggleOption(matchId, option) {
    setPicks((prev) => {
      const current = prev[matchId].options ?? [];
      const options = current.includes(option)
        ? current.filter((o) => o !== option)
        : BET_OPTIONS.filter((o) => o === option || current.includes(o));
      return { ...prev, [matchId]: { ...prev[matchId], options } };
    });
  }

  function clearPicks() {
    setPicks({});
  }

  const pickList = useMemo(
    () =>
      Object.values(picks).sort((a, b) => (a.addedAt ?? 0) - (b.addedAt ?? 0)),
    [picks],
  );

  async function copySlip() {
    const text = pickList
      .map((p) => {
        const detail = [...(p.options ?? []), p.note].filter(Boolean).join(" ");
        return (
          `${p.homeName} vs ${p.awayName}` + (detail ? ` — ${detail}` : "")
        );
      })
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard unavailable, slip text is still visible for manual copy
    }
  }

  let filteredMatches = matches;
  if (searchQuery.trim() !== "") {
    const q = searchQuery.trim().toLowerCase();
    filteredMatches = filteredMatches.filter(
      (m) =>
        m.home.name.toLowerCase().includes(q) ||
        m.away.name.toLowerCase().includes(q) ||
        m.leagueName.toLowerCase().includes(q),
    );
  }

  const groups = {};
  filteredMatches.forEach((m) => {
    if (!groups[m.leagueName]) {
      groups[m.leagueName] = {
        name: m.leagueName,
        leagueId: m.leagueId,
        matches: [],
      };
    }
    groups[m.leagueName].matches.push(m);
  });
  const groupedLeagues = Object.values(groups).sort(
    (a, b) =>
      LEAGUE_ORDER.indexOf(a.leagueId) - LEAGUE_ORDER.indexOf(b.leagueId) ||
      a.name.localeCompare(b.name),
  );

  function toggleCollapseGroup(name) {
    setCollapsedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <div className="w-11/12 xl:w-5/6 mx-auto font-sans py-6 h-screen flex flex-col overflow-hidden">
      <PageHeader className="mb-16">
        <span>Betting Notebook</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-[24rem_1fr] gap-4 mt-4 flex-1 min-h-0">
        <div className="min-h-0 overflow-y-auto no-scrollbar pr-1">
          {groupedLeagues.length === 0 && (
            <CollapsibleCard
              title="No matches found"
              isCollapsed={false}
              onToggleCollapse={() => {}}
            >
              <div className="p-8 text-center">
                <p className="text-[11px] text-primary/50 font-medium">
                  No matches for this date.
                </p>
              </div>
            </CollapsibleCard>
          )}

          <div className="flex flex-col gap-4">
            {groupedLeagues.map((group) => {
              const isCollapsed = !!collapsedGroups[group.name];

              return (
                <CollapsibleCard
                  key={group.name}
                  title={group.name}
                  badge={
                    <span className="text-xs text-primary/50 font-mono">
                      ({group.matches.length})
                    </span>
                  }
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleCollapseGroup(group.name)}
                >
                  <div className="divide-y divide-background-light/30">
                    {group.matches.map((match) => {
                      const added = !!picks[match.id];
                      return (
                        <LinkRow
                          key={match.id}
                          className="hover:bg-background-darker transition-colors !gap-2"
                          actions={
                            <button
                              onClick={() => addPick(match)}
                              disabled={added}
                              className={`iconButton font-semibold ${
                                added
                                  ? "accentButton cursor-default"
                                  : "cardComponent cursor-pointer"
                              }`}
                              title={
                                added
                                  ? "Already in bet slip"
                                  : "Add to bet slip"
                              }
                            >
                              {added ? (
                                <HiCheck className="h-3.5 w-3.5" />
                              ) : (
                                <HiPlus className="h-3.5 w-3.5" />
                              )}
                            </button>
                          }
                        >
                          <a
                            href={`https://www.fotmob.com/match/${match.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold truncate block text-current hover:underline"
                          >
                            {match.home.name} vs {match.away.name}
                          </a>
                          <p className="text-[10px] font-mono text-primary/50">
                            {match.utcTime}
                          </p>
                        </LinkRow>
                      );
                    })}
                  </div>
                </CollapsibleCard>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex flex-col">
          <CollapsibleCard
            title="Bet Slip"
            badge={
              <span className="text-xs text-primary/50 font-mono">
                ({pickList.length})
              </span>
            }
            actions={
              pickList.length > 0 && (
                <>
                  <button
                    onClick={copySlip}
                    className="text-[10px] font-semibold px-2 py-1 rounded text-primary/70 hover:text-primary hover:bg-background-darker border border-background-dark/60 bg-background-dark/50 cursor-pointer"
                  >
                    Copy
                  </button>
                  <button
                    onClick={clearPicks}
                    className="text-[10px] font-semibold px-2 py-1 rounded text-primary/70 hover:text-primary hover:bg-background-darker border border-background-dark/60 bg-background-dark/50 cursor-pointer"
                  >
                    Clear
                  </button>
                </>
              )
            }
            isCollapsed={slipCollapsed}
            onToggleCollapse={() => setSlipCollapsed((c) => !c)}
          >
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {pickList.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[11px] text-primary/50 font-medium">
                    No matches added yet. Use the + button on a match to add it
                    here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-background-light/30">
                  {pickList.map((p) => (
                    <div key={p.matchId} className="p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-baseline gap-2">
                          <p className="text-sm font-semibold truncate">
                            {p.homeName} vs {p.awayName}
                          </p>
                          <span className="text-[10px] font-mono text-primary/50 whitespace-nowrap flex-shrink-0">
                            {p.leagueName} &middot; {p.utcTime}
                          </span>
                        </div>
                        <button
                          onClick={() => removePick(p.matchId)}
                          className="p-1 text-primary/50 hover:text-primary cursor-pointer flex-shrink-0"
                        >
                          <HiXMark className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {BET_OPTIONS.map((option) => {
                          const selected = (p.options ?? []).includes(option);
                          return (
                            <button
                              key={option}
                              onClick={() => toggleOption(p.matchId, option)}
                              aria-pressed={selected}
                              className={`iconButton w-18 ${
                                selected ? "accentButton" : "defaultButton"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                        <input
                          type="text"
                          value={p.note}
                          onChange={(e) =>
                            updateNote(p.matchId, e.target.value)
                          }
                          placeholder="Note"
                          className="inputField flex-1 min-w-[4rem] h-7 px-2 text-[10px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </div>
  );
}
