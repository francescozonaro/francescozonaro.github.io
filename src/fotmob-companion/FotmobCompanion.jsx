import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import {
  ArrowPathIcon,
  SignalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import PageHeader from "../components/PageHeader";
import LongRangeGoalsWidget from "./LongRangeGoalsWidget";
import LeagueFixturesWidget from "./LeagueFixturesWidget";
import {
  SERVERLESS_WORKER_URL,
  SERVERLESS_FIXTURES_WORKER_URL,
  isFavoriteTeam,
  isMatchInFavoriteLeagues,
  isFavoriteMatch,
  formatScorerName,
  formatAssistName,
  evaluateShot,
  transformFotmobMatch,
} from "./commons";

const DETAILS_CACHE_KEY_PREFIX = "fotmob_details_cache_v4_";
const LIVE_REFRESH_INTERVAL_MS = 60000;
const SHOT_MINUTE_MATCH_TOLERANCE = 10;

// Modular Sub-Components
function ScrollableFeed({ children }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 pt-3 pb-2 no-scrollbar scroll-smooth">
      {children}
    </div>
  );
}

ScrollableFeed.propTypes = {
  children: PropTypes.node,
};

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDateString(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

function formatDateLabel(dateStr) {
  const todayStr = getLocalDateString(new Date());
  const yesterdayStr = shiftDateString(todayStr, -1);
  const tomorrowStr = shiftDateString(todayStr, 1);

  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const options = { month: "short", day: "numeric" };
  const formattedShort = dateObj.toLocaleDateString("en-US", options);

  if (dateStr === todayStr) return `Today, ${formattedShort}`;
  if (dateStr === yesterdayStr) return `Yesterday, ${formattedShort}`;
  if (dateStr === tomorrowStr) return `Tomorrow, ${formattedShort}`;

  const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  return `${dayOfWeek}, ${formattedShort}`;
}

const loadDetailsCache = (dateStr) => {
  try {
    const raw = sessionStorage.getItem(
      `${DETAILS_CACHE_KEY_PREFIX}${dateStr.replace(/-/g, "")}`,
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error("Failed to load details cache from sessionStorage:", e);
    return {};
  }
};

const saveDetailsCache = (dateStr, cacheObj) => {
  try {
    sessionStorage.setItem(
      `${DETAILS_CACHE_KEY_PREFIX}${dateStr.replace(/-/g, "")}`,
      JSON.stringify(cacheObj),
    );
  } catch (e) {
    console.error("Failed to save details cache to sessionStorage:", e);
  }
};

// The header goal timeline isn't always populated (e.g. right after kickoff,
// before FotMob backfills it) — fall back to the match facts event timeline.
function extractRawGoalEvents(data) {
  const homeGoalsObj = data?.header?.events?.homeTeamGoals || {};
  const awayGoalsObj = data?.header?.events?.awayTeamGoals || {};

  const rawEvents = [];
  for (const arr of [
    ...Object.values(homeGoalsObj),
    ...Object.values(awayGoalsObj),
  ]) {
    if (Array.isArray(arr)) rawEvents.push(...arr);
  }
  if (rawEvents.length > 0) return rawEvents;

  const factsEvents =
    data?.content?.matchFacts?.events?.events ||
    data?.content?.matchFacts?.events ||
    [];
  return factsEvents.filter((e) =>
    ["Goal", "GoalPen", "OwnGoal"].includes(e.type),
  );
}

function extractPlayerName(obj) {
  if (!obj) return "";
  return (
    obj.player?.name ||
    obj.playerName ||
    obj.fullName ||
    obj.nameStr ||
    obj.lastName ||
    obj.name ||
    ""
  );
}

function buildExtractedGoal(rawEvent, homeTeamId, awayTeamId) {
  const scorer = formatScorerName(
    extractPlayerName(rawEvent),
    rawEvent.type,
  );
  const assist = formatAssistName(
    rawEvent.assistInput || rawEvent.assistStr || rawEvent.assistPlayer?.name,
  );
  const minuteRaw =
    typeof rawEvent.time === "number"
      ? rawEvent.time
      : parseInt(rawEvent.timeStr, 10) || 0;

  return {
    scorer,
    assist,
    time: rawEvent.timeStr
      ? `${rawEvent.timeStr}′`
      : rawEvent.time
        ? `${rawEvent.time}′`
        : null,
    minuteRaw,
    isHome: !!rawEvent.isHome,
    teamId: rawEvent.isHome ? homeTeamId : awayTeamId,
    scoreDisplay: rawEvent.newScore
      ? `${rawEvent.newScore[0]} - ${rawEvent.newScore[1]}`
      : null,
    rawEvent,
  };
}

function findGoalShots(data) {
  const shots = data?.content?.shotmap?.shots || [];
  return shots.filter(
    (s) => s.eventType === "Goal" || s.isGoal || s.type === "Goal",
  );
}

// Pairs an extracted goal with its shotmap entry so we can read shot
// location/xG. Tries progressively looser combinations of team, name and
// minute matching — team+name+minute is the most reliable, and the looser
// tiers exist as a fallback for shotmaps missing team ids or with slightly
// off timing.
function findMatchingShot(eg, goalShots) {
  if (eg.rawEvent?.shotmapEvent) return eg.rawEvent.shotmapEvent;

  const shotMinute = (s) => (s.min ?? s.minute ?? 0) + (s.minAdded ?? 0);
  const shotPlayerName = (s) => extractPlayerName(s).toLowerCase();

  const cleanScorer = (eg.scorer || "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .toLowerCase();
  const scorerParts = cleanScorer.split(/\s+/);
  const lastScorerPart = scorerParts[scorerParts.length - 1] || "";

  const minuteMatches = (s) =>
    Math.abs(shotMinute(s) - eg.minuteRaw) <= SHOT_MINUTE_MATCH_TOLERANCE;
  const teamMatches = (s) =>
    eg.teamId != null && s.teamId != null && s.teamId === eg.teamId;
  const nameMatches = (s) => {
    const sName = shotPlayerName(s);
    if (!sName || !cleanScorer) return false;
    return (
      cleanScorer.includes(sName) ||
      sName.includes(cleanScorer) ||
      (lastScorerPart.length >= 3 && sName.includes(lastScorerPart))
    );
  };

  const matchTiers = [
    (s) => teamMatches(s) && minuteMatches(s) && nameMatches(s),
    (s) => minuteMatches(s) && nameMatches(s),
    (s) => teamMatches(s) && nameMatches(s),
    (s) => nameMatches(s),
    (s) => minuteMatches(s),
  ];

  for (const tierMatches of matchTiers) {
    const shot = goalShots.find(tierMatches);
    if (shot) return shot;
  }
  return undefined;
}

function enrichGoalWithTelemetry(eg, goalShots) {
  const matchingShot = findMatchingShot(eg, goalShots);
  const rest = { ...eg };
  delete rest.rawEvent;
  delete rest.teamId;
  return { ...rest, ...evaluateShot(matchingShot, eg) };
}

function FotmobCompanion() {
  const dateInputRef = useRef(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "FotMob Companion";

    const link = document.querySelector("link[rel*='icon']");
    if (!link) return;

    const prevHref = link.getAttribute("href");
    const prevType = link.getAttribute("type");

    link.setAttribute("type", "image/svg+xml");
    link.setAttribute("href", "/fotmob-favicon.svg?v=2");

    return () => {
      document.title = prevTitle;
      if (prevType !== null) {
        link.setAttribute("type", prevType);
      } else {
        link.removeAttribute("type");
      }
      if (prevHref !== null) {
        link.setAttribute("href", prevHref);
      }
    };
  }, []);

  const todayStr = getLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const isToday = selectedDate === todayStr;

  const [matches, setMatches] = useState([]);
  const [allMatchesForDate, setAllMatchesForDate] = useState([]);
  const [showOnlyLive, setShowOnlyLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [matchDetailsMap, setMatchDetailsMap] = useState(() =>
    loadDetailsCache(todayStr),
  );
  const [collapsedLeagues, setCollapsedLeagues] = useState({});
  const [hiddenScorersLeagues, setHiddenScorersLeagues] = useState({});

  const previousScoresRef = useRef({});
  const fetchedMatchDetailsCacheRef = useRef(loadDetailsCache(todayStr));
  const selectedDateRef = useRef(selectedDate);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const toggleCollapseLeague = (leagueName) => {
    setCollapsedLeagues((prev) => ({
      ...prev,
      [leagueName]: !prev[leagueName],
    }));
  };

  const toggleHideScorers = (leagueName) => {
    setHiddenScorersLeagues((prev) => ({
      ...prev,
      [leagueName]: !prev[leagueName],
    }));
  };

  const updateMatchDetails = useCallback(
    (matchId, details, targetDateStr) => {
      if (!details) return;
      const currentDateStr = targetDateStr || selectedDateRef.current;
      if (currentDateStr !== selectedDateRef.current) return;
      const detailsCache = fetchedMatchDetailsCacheRef.current;
      detailsCache[matchId] = details;
      saveDetailsCache(currentDateStr, detailsCache);
      setMatchDetailsMap((prev) => ({
        ...prev,
        [matchId]: details,
      }));
    },
    [],
  );

  // Fetch detailed telemetry (events & shotmap xG) for a match
  const fetchMatchDetails = useCallback(async (matchId) => {
    if (!SERVERLESS_WORKER_URL) return null;

    try {
      const endpoint = `${SERVERLESS_WORKER_URL.replace(/\/$/, "")}?matchId=${matchId}&_t=${Date.now()}`;
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) return null;

      const data = await res.json();
      const homeTeamId = data?.general?.homeTeam?.id ?? null;
      const awayTeamId = data?.general?.awayTeam?.id ?? null;

      const extractedGoals = extractRawGoalEvents(data).map((rawEvent) =>
        buildExtractedGoal(rawEvent, homeTeamId, awayTeamId),
      );

      const goalShots = findGoalShots(data);
      const enrichedGoals = extractedGoals.map((eg) =>
        enrichGoalWithTelemetry(eg, goalShots),
      );

      return enrichedGoals.sort((a, b) => a.minuteRaw - b.minuteRaw);
    } catch (e) {
      console.error("Failed to fetch match details:", e);
      return null;
    }
  }, []);

  const processGoalEvents = useCallback(
    (allMatchesList, targetDateStr) => {
      const prevScores = previousScoresRef.current;
      const detailsCache = fetchedMatchDetailsCacheRef.current;
      const currentDateStr = targetDateStr || selectedDateRef.current;

      const fetchAndStoreDetails = (matchId, totalGoals, isFinished) => {
        fetchMatchDetails(matchId).then((details) => {
          if (details && details.length > 0) {
            updateMatchDetails(matchId, details, currentDateStr);
            const detailsAreComplete =
              details.length >= totalGoals &&
              details.every((g) => g.scorer && g.scorer.trim() !== "");

            if (detailsAreComplete || isFinished) {
              prevScores[matchId] = totalGoals;
            }
          }
        });
      };

      allMatchesList.forEach((m) => {
        const totalGoals = m.home.score + m.away.score;
        if (totalGoals === 0 || !SERVERLESS_WORKER_URL) {
          prevScores[m.id] = totalGoals;
          return;
        }

        const prevTotal = prevScores[m.id];
        const isInitialCheck = prevTotal === undefined;
        const scoreDecreased = !isInitialCheck && totalGoals < prevTotal;
        const scoreChanged = !isInitialCheck && totalGoals !== prevTotal;
        const isFinished = m.finished || m.minute === "FT";

        // If score decreased (VAR disallowed goal), invalidate cache to force clean re-fetch
        if (scoreDecreased) {
          delete detailsCache[m.id];
          saveDetailsCache(currentDateStr, detailsCache);
          setMatchDetailsMap((prev) => {
            const next = { ...prev };
            delete next[m.id];
            return next;
          });
        }

        // Optimization: If details are already cached in memory or sessionStorage
        if (detailsCache[m.id]) {
          updateMatchDetails(m.id, detailsCache[m.id], currentDateStr);

          // Re-fetch if a live match scored a NEW goal OR if cached details are incomplete/missing scorer names/telemetry
          const cachedDetails = detailsCache[m.id] || [];
          const cachedCount = cachedDetails.length;
          const hasMissingScorer = cachedDetails.some(
            (g) => !g.scorer || g.scorer.trim() === "",
          );
          const hasMissingTelemetry = cachedDetails.some(
            (g) => g.isLongRangeGoal === undefined,
          );
          const isIncomplete =
            (cachedCount < totalGoals ||
              hasMissingScorer ||
              hasMissingTelemetry) &&
            !isFinished;

          if (scoreChanged || isIncomplete) {
            fetchAndStoreDetails(m.id, totalGoals, isFinished);
          } else {
            prevScores[m.id] = totalGoals;
          }
          return;
        }

        // If NOT cached yet, fetch once and store in session cache
        fetchAndStoreDetails(m.id, totalGoals, isFinished);
      });
    },
    [updateMatchDetails, fetchMatchDetails],
  );

  function processFotmobData(data) {
    if (!data?.leagues) return { liveList: [], allList: [] };

    const liveList = [];
    const allList = [];

    data.leagues.forEach((league) => {
      if (!league.matches) return;
      league.matches.forEach((match) => {
        const matchObj = transformFotmobMatch(match, league);
        if (matchObj.isActive) liveList.push(matchObj);
        allList.push(matchObj);
      });
    });

    return { liveList, allList };
  }

  // Fetch fixtures for any date
  const fetchScoresForDate = useCallback(
    async (targetDateStr) => {
      setLoading(true);
      try {
        const dateParam = targetDateStr.replace(/-/g, "");
        const endpoint = `${SERVERLESS_FIXTURES_WORKER_URL.replace(/\/$/, "")}?date=${dateParam}&_t=${Date.now()}`;

        const res = await fetch(endpoint, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.leagues) {
            const parsed = processFotmobData(data);
            setMatches(parsed.liveList);
            setAllMatchesForDate(parsed.allList);
            processGoalEvents(parsed.allList, targetDateStr);

            const nowStr = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            setLastUpdated(nowStr);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [processGoalEvents],
  );

  const handleDateChange = useCallback(
    (newDateStr) => {
      if (!newDateStr || newDateStr === selectedDateRef.current) return;
      setSelectedDate(newDateStr);
      selectedDateRef.current = newDateStr;

      const newCache = loadDetailsCache(newDateStr);
      fetchedMatchDetailsCacheRef.current = newCache;
      setMatchDetailsMap(newCache);
      previousScoresRef.current = {};
      setMatches([]);
      setAllMatchesForDate([]);

      fetchScoresForDate(newDateStr);
    },
    [fetchScoresForDate],
  );

  useEffect(() => {
    fetchScoresForDate(selectedDate);

    // Auto-refresh only if viewing today's matches
    if (isToday) {
      const timer = setInterval(() => {
        fetchScoresForDate(todayStr);
      }, LIVE_REFRESH_INTERVAL_MS);
      return () => clearInterval(timer);
    }
  }, [selectedDate, isToday, fetchScoresForDate, todayStr]);

  // Dataset Filtering
  const effectiveShowOnlyLive = isToday ? showOnlyLive : false;
  const activeDataset = effectiveShowOnlyLive ? matches : allMatchesForDate;
  let filteredMatches = activeDataset.filter(isFavoriteMatch);

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filteredMatches = filteredMatches.filter(
      (m) =>
        m.home.name.toLowerCase().includes(q) ||
        m.away.name.toLowerCase().includes(q) ||
        m.leagueName.toLowerCase().includes(q),
    );
  }

  // Group Matches by League
  const groupedLeagues = {};
  filteredMatches.forEach((m) => {
    if (!groupedLeagues[m.leagueName]) {
      groupedLeagues[m.leagueName] = {
        name: m.leagueName,
        isFriendly: m.isFriendly,
        matches: [],
      };
    }
    groupedLeagues[m.leagueName].matches.push(m);
  });

  return (
    <div className="w-11/12 lg:w-11/12 xl:w-5/6 mx-auto font-sans py-6 h-screen flex flex-col overflow-hidden text-center">
      {/* Top Header Nav */}
      <PageHeader className="mb-16">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-light opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
        </span>
        <span>FotMob Siphon</span>
      </PageHeader>

      {/* Main Controls & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-[0.5px] border-background-dark rounded-xl bg-background-dark/30 shadow-md mb-16 flex-shrink-0">
        {/* Left Side: Search Bar & Date Selector grouped together */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-64 sm:w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-primary/40" />
            <input
              type="text"
              placeholder="Search teams or leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-background-dark bg-background-dark/80 text-primary placeholder-primary/40 focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Date Selector (Monochrome) */}
          <div className="flex items-center space-x-1 border border-background-dark/60 bg-background-dark/60 rounded-md p-1">
            <button
              onClick={() =>
                handleDateChange(shiftDateString(selectedDate, -1))
              }
              className="p-1 rounded text-primary/70 hover:text-primary hover:bg-background-darker transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker()}
              className="relative flex items-center px-2 py-1 rounded hover:bg-background-darker transition-colors cursor-pointer"
              title="Click to select date"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-primary/60 mr-1.5 flex-shrink-0 pointer-events-none" />
              <span className="text-xs font-semibold text-primary select-none whitespace-nowrap pointer-events-none">
                {formatDateLabel(selectedDate)}
              </span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  e.target.value && handleDateChange(e.target.value)
                }
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </button>

            <button
              onClick={() => handleDateChange(shiftDateString(selectedDate, 1))}
              className="p-1 rounded text-primary/70 hover:text-primary hover:bg-background-darker transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>

            {!isToday && (
              <button
                onClick={() => handleDateChange(todayStr)}
                className="ml-1 px-2 py-0.5 text-[10px] font-bold text-primary/80 bg-background-dark/40 border border-background-dark/60 rounded hover:bg-background-darker hover:text-primary transition-colors cursor-pointer"
                title="Jump to Today"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Live Only & Refresh buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => isToday && setShowOnlyLive(!showOnlyLive)}
            disabled={!isToday}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
              !isToday
                ? "opacity-40 cursor-not-allowed border border-background-dark/40 bg-background-dark/40 text-primary/40"
                : showOnlyLive
                  ? "border border-secondary/50 bg-secondary/10 text-secondary cursor-pointer"
                  : "cardComponent text-primary cursor-pointer"
            }`}
            title={!isToday ? "Live filtering is only active for today" : ""}
          >
            <SignalIcon className="h-3.5 w-3.5" />
            <span>{effectiveShowOnlyLive ? "Live Only" : "All Matches"}</span>
          </button>

          <button
            onClick={() => isToday && fetchScoresForDate(todayStr)}
            disabled={!isToday || loading}
            className={`px-3 py-1.5 text-xs font-semibold flex items-center space-x-1.5 ${
              !isToday
                ? "opacity-40 cursor-not-allowed border border-background-dark/40 bg-background-dark/40 text-primary/40 rounded-md"
                : "cardComponent smallEnlarge text-secondary cursor-pointer"
            }`}
            title={
              !isToday
                ? "Live refresh is only active for today"
                : "Refresh Scores"
            }
          >
            <ArrowPathIcon
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Split Dashboard: Fixtures (6 Cols) vs Insights (6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch flex-1 min-h-[350px] overflow-hidden pb-2">
        {/* LEFT COLUMN: Matches List (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 mb-3 flex-shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80">
              Fixtures
            </h2>
            <span className="text-xs text-primary/50">
              {lastUpdated ? `Updated ${lastUpdated}` : "Loading..."}
            </span>
          </div>

          <ScrollableFeed>
            <LeagueFixturesWidget
              groupedLeagues={groupedLeagues}
              collapsedLeagues={collapsedLeagues}
              hiddenScorersLeagues={hiddenScorersLeagues}
              toggleCollapseLeague={toggleCollapseLeague}
              toggleHideScorers={toggleHideScorers}
              matchDetailsMap={matchDetailsMap}
              showOnlyLive={showOnlyLive}
            />
          </ScrollableFeed>
        </div>

        {/* RIGHT COLUMN: Custom Widgets Column (6 Cols - Stacked vertically) */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 mb-3 flex-shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80">
              Stats & Insights
            </h2>
          </div>

          <ScrollableFeed>
            <LongRangeGoalsWidget
              allMatches={allMatchesForDate}
              matchDetailsMap={matchDetailsMap}
              filterMatch={isFavoriteMatch}
            />
          </ScrollableFeed>
        </div>
      </div>
    </div>
  );
}

export default FotmobCompanion;
