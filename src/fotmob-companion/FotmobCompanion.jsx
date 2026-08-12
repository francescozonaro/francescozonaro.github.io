import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  ArrowPathIcon,
  SignalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import ThemeToggle from "../components/ThemeToggle";
import LongRangeGoalsWidget from "./LongRangeGoalsWidget";
import LeagueFixturesWidget from "./LeagueFixturesWidget";
import {
  SERVERLESS_WORKER_URL,
  SERVERLESS_FIXTURES_WORKER_URL,
  isFavoriteTeam,
  isMatchInFavoriteLeagues,
  formatScorerName,
  formatAssistName,
  evaluateShotTelemetry,
  transformFotmobMatch,
} from "./utilities";

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
      `fotmob_details_cache_v4_${dateStr.replace(/-/g, "")}`,
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return {};
  }
};

const saveDetailsCache = (dateStr, cacheObj) => {
  try {
    sessionStorage.setItem(
      `fotmob_details_cache_v4_${dateStr.replace(/-/g, "")}`,
      JSON.stringify(cacheObj),
    );
  } catch {
    // ignore
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

function buildExtractedGoal(rawEvent, homeTeamId, awayTeamId) {
  const scorer = formatScorerName(
    rawEvent.player?.name ||
      rawEvent.fullName ||
      rawEvent.nameStr ||
      rawEvent.name ||
      rawEvent.playerName,
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
  const shotPlayerName = (s) =>
    (
      s.playerName ||
      s.fullName ||
      s.lastName ||
      s.player?.name ||
      ""
    ).toLowerCase();

  const cleanScorer = (eg.scorer || "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .toLowerCase();
  const scorerParts = cleanScorer.split(/\s+/);
  const lastScorerPart = scorerParts[scorerParts.length - 1] || "";

  const minuteMatches = (s) => Math.abs(shotMinute(s) - eg.minuteRaw) <= 10;
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
  delete eg.rawEvent;
  delete eg.teamId;
  Object.assign(eg, evaluateShotTelemetry(matchingShot, eg));
}

function FotmobCompanion() {
  const navigate = useNavigate();

  useEffect(() => {
    const prevTitle = document.title;
    let link = document.querySelector("link[rel*='icon']");
    const prevHref = link ? link.getAttribute("href") : "/favicon.ico";
    const prevType = link ? link.getAttribute("type") : "image/x-icon";

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    document.title = "FotMob Companion";
    link.type = "image/svg+xml";
    link.href = "/fotmob-favicon.svg";

    return () => {
      document.title = prevTitle;
      if (link) {
        if (prevType) {
          link.type = prevType;
        } else {
          link.removeAttribute("type");
        }
        link.href = prevHref || "/favicon.ico";
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
  selectedDateRef.current = selectedDate;

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

  const updateMatchDetails = useCallback((matchId, details) => {
    if (!details) return;
    const currentDateStr = selectedDateRef.current;
    const detailsCache = fetchedMatchDetailsCacheRef.current;
    detailsCache[matchId] = details;
    saveDetailsCache(currentDateStr, detailsCache);
    setMatchDetailsMap((prev) => ({
      ...prev,
      [matchId]: details,
    }));
  }, []);

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
      extractedGoals.forEach((eg) => enrichGoalWithTelemetry(eg, goalShots));

      return extractedGoals.sort((a, b) => a.minuteRaw - b.minuteRaw);
    } catch {
      return null;
    }
  }, []);

  const processGoalEvents = useCallback(
    (allMatchesList) => {
      const prevScores = previousScoresRef.current;
      const detailsCache = fetchedMatchDetailsCacheRef.current;
      const currentDateStr = selectedDateRef.current;

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
          updateMatchDetails(m.id, detailsCache[m.id]);

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
            fetchMatchDetails(m.id).then((details) => {
              if (details && details.length > 0) {
                updateMatchDetails(m.id, details);
                const detailsAreComplete =
                  details.length >= totalGoals &&
                  details.every((g) => g.scorer && g.scorer.trim() !== "");

                if (detailsAreComplete || isFinished) {
                  prevScores[m.id] = totalGoals;
                }
              }
            });
          } else {
            prevScores[m.id] = totalGoals;
          }
          return;
        }

        // If NOT cached yet, fetch once and store in session cache
        fetchMatchDetails(m.id).then((details) => {
          if (details && details.length > 0) {
            updateMatchDetails(m.id, details);
            const detailsAreComplete =
              details.length >= totalGoals &&
              details.every((g) => g.scorer && g.scorer.trim() !== "");

            if (detailsAreComplete || isFinished) {
              prevScores[m.id] = totalGoals;
            }
          }
        });
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
            processGoalEvents(parsed.allList);

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
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [selectedDate, isToday, fetchScoresForDate, todayStr]);

  // Dataset Filtering
  const effectiveShowOnlyLive = isToday ? showOnlyLive : false;
  const activeDataset = effectiveShowOnlyLive ? matches : allMatchesForDate;
  let filteredMatches = activeDataset.filter(
    (m) =>
      isMatchInFavoriteLeagues(m.leagueName, m.leagueId) ||
      isFavoriteTeam(m.home) ||
      isFavoriteTeam(m.away),
  );

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
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <button
          className="cardComponent smallEnlarge text-xs text-secondary px-3 py-1.5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          ← Portfolio
        </button>
        <ThemeToggle />
      </div>

      {/* Header Banner */}
      <div className="mt-1 mb-5 text-center flex-shrink-0">
        <div className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-light opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
          </span>
          <span>FotMob Siphon</span>
        </div>
        <p className="mt-3 text-xs text-center leading-relaxed max-w-2xl mx-auto text-primary/70">
          A real-time match command center siphoning live FotMob API scores,
          tracking league fixtures with live scorer telemetry and interactive X
          goal search.
        </p>
      </div>

      {/* Main Controls & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-[0.5px] border-background-light rounded-xl bg-background-dark/30 shadow-md mb-6 flex-shrink-0">
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
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-background-light bg-background-dark/80 text-primary placeholder-primary/40 focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Date Selector (Monochrome) */}
          <div className="flex items-center space-x-1 border border-background-light/60 bg-background-dark/60 rounded-md p-1">
            <button
              onClick={() => handleDateChange(shiftDateString(selectedDate, -1))}
              className="p-1 rounded text-primary/70 hover:text-primary hover:bg-background-light/40 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <div className="relative flex items-center px-1.5 py-0.5">
              <CalendarIcon className="h-3.5 w-3.5 text-primary/60 mr-1.5 flex-shrink-0" />
              <span className="text-xs font-semibold text-primary select-none cursor-pointer whitespace-nowrap">
                {formatDateLabel(selectedDate)}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  e.target.value && handleDateChange(e.target.value)
                }
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Click to select date"
              />
            </div>

            <button
              onClick={() => handleDateChange(shiftDateString(selectedDate, 1))}
              className="p-1 rounded text-primary/70 hover:text-primary hover:bg-background-light/40 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>

            {!isToday && (
              <button
                onClick={() => handleDateChange(todayStr)}
                className="ml-1 px-2 py-0.5 text-[10px] font-bold text-primary/80 bg-background-light/40 border border-background-light/60 rounded hover:bg-background-light/60 hover:text-primary transition-colors cursor-pointer"
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
                ? "opacity-40 cursor-not-allowed border border-background-light/40 bg-background-dark/40 text-primary/40"
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
                ? "opacity-40 cursor-not-allowed border border-background-light/40 bg-background-dark/40 text-primary/40 rounded-md"
                : "cardComponent smallEnlarge text-secondary cursor-pointer"
            }`}
            title={
              !isToday ? "Live refresh is only active for today" : "Refresh Scores"
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
              isFavoriteLeague={isMatchInFavoriteLeagues}
            />
          </ScrollableFeed>
        </div>
      </div>
    </div>
  );
}

export default FotmobCompanion;
