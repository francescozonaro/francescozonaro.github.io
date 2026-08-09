import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  SignalIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  TrophyIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import ThemeToggle from "../components/ThemeToggle";
import GoalsPerHourWidget from "./GoalsPerHourWidget";

// Config & Favorites Definitions
const HARDCODED_FAVORITES_TEAMS = [
  // Premier League (England) - Exact FotMob Team IDs & Names
  { id: 9825, name: "Arsenal" },
  { id: 10252, name: "Aston Villa" },
  { id: 8678, name: "Bournemouth" },
  { id: 9937, name: "Brentford" },
  { id: 10204, name: "Brighton" },
  { id: 8455, name: "Chelsea" },
  { id: 9826, name: "Crystal Palace" },
  { id: 8668, name: "Everton" },
  { id: 9879, name: "Fulham" },
  { id: 9902, name: "Ipswich" },
  { id: 8197, name: "Leicester" },
  { id: 8650, name: "Liverpool" },
  { id: 8456, name: "Man City" },
  { id: 10260, name: "Man United" },
  { id: 10261, name: "Newcastle" },
  { id: 10203, name: "Nottm Forest" },
  { id: 8466, name: "Southampton" },
  { id: 8586, name: "Tottenham" },
  { id: 8654, name: "West Ham" },
  { id: 8602, name: "Wolves" },
  { id: 8191, name: "Burnley" },
  { id: 8344, name: "Luton" },
  { id: 8657, name: "Sheffield United" },
  { id: 8463, name: "Leeds" },
  { id: 8472, name: "Sunderland" },

  // Serie A (Italy) - Exact FotMob Team IDs & Names
  { id: 8524, name: "Atalanta" },
  { id: 9857, name: "Bologna" },
  { id: 8529, name: "Cagliari" },
  { id: 10171, name: "Como" },
  { id: 8534, name: "Empoli" },
  { id: 8535, name: "Fiorentina" },
  { id: 10233, name: "Genoa" },
  { id: 9876, name: "Hellas Verona" },
  { id: 8636, name: "Inter" },
  { id: 9885, name: "Juventus" },
  { id: 8543, name: "Lazio" },
  { id: 9888, name: "Lecce" },
  { id: 8564, name: "Milan" },
  { id: 6504, name: "Monza" },
  { id: 9875, name: "Napoli" },
  { id: 10167, name: "Parma" },
  { id: 8686, name: "Roma" },
  { id: 9804, name: "Torino" },
  { id: 8600, name: "Udinese" },
  { id: 7881, name: "Venezia" },

  // Additional Hardcoded Favorites
  { id: 8634, name: "Barcelona" },
  { id: 10003, name: "Swansea" },
  { id: 130394, name: "Seattle Sounders" },
  { id: 189481, name: "Union Brescia" },
];

const HARDCODED_FAVORITES_LEAGUES = [
  55, // Serie A (Italy)
  47, // Premier League (England)
  57, // Serie B (Italy)
  "EFL Cup",
  "League Cup",
  "Carabao Cup",
  "Club Friendlies",
  "Friendlies",
];

const DEFAULT_TEAM_LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E";

const SERVERLESS_WORKER_URL =
  "https://fotmob-details.turtleunderablanket.workers.dev";
const SERVERLESS_FIXTURES_WORKER_URL =
  "https://fotmob-fixtures.turtleunderablanket.workers.dev";

// Pure Modular Helper Functions
function isFavoriteTeam(teamName, teamId) {
  if (!teamName) return false;
  let name = "";
  let id = null;

  if (typeof teamName === "object" && teamName !== null) {
    name = teamName.name || "";
    id = teamName.id !== undefined ? teamName.id : null;
  } else {
    name = teamName || "";
    id = teamId !== undefined ? teamId : null;
  }

  const targetName = name.trim().toLowerCase();
  const targetId = typeof id === "number" ? id : parseInt(id, 10);

  return HARDCODED_FAVORITES_TEAMS.some((fav) => {
    if (typeof fav === "number") {
      return !isNaN(targetId) && fav === targetId;
    }
    if (typeof fav === "string") {
      return targetName !== "" && fav.trim().toLowerCase() === targetName;
    }
    if (typeof fav === "object" && fav !== null) {
      if (fav.id !== undefined && !isNaN(targetId)) {
        return fav.id === targetId;
      }
      if (fav.name && targetName !== "") {
        return fav.name.trim().toLowerCase() === targetName;
      }
    }
    return false;
  });
}

function isMatchInFavoriteLeagues(leagueName, leagueId) {
  if (
    !HARDCODED_FAVORITES_LEAGUES ||
    HARDCODED_FAVORITES_LEAGUES.length === 0
  ) {
    return true;
  }
  const targetName = (leagueName || "").trim().toLowerCase();
  const targetId =
    typeof leagueId === "number" ? leagueId : parseInt(leagueId, 10);

  return HARDCODED_FAVORITES_LEAGUES.some((fav) => {
    if (typeof fav === "number") {
      return !isNaN(targetId) && fav === targetId;
    }
    if (typeof fav === "string") {
      const favLower = fav.trim().toLowerCase();
      return (
        targetName === favLower ||
        targetName.includes(favLower) ||
        favLower.includes(targetName)
      );
    }
    if (typeof fav === "object" && fav !== null) {
      if (fav.id && !isNaN(targetId)) return fav.id === targetId;
      if (fav.name) {
        const favNameLower = fav.name.trim().toLowerCase();
        return (
          targetName === favNameLower ||
          targetName.includes(favNameLower) ||
          favNameLower.includes(targetName)
        );
      }
    }
    return false;
  });
}

function sanitizeText(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("tbd") || lower.includes("<tbd>")) return null;
  return raw;
}

function formatScorerName(rawName, type) {
  let scorer = sanitizeText(rawName);
  if (!scorer) return null;
  if (type === "OwnGoal") scorer += " (OG)";
  if (type === "GoalPen") scorer += " (P)";
  return scorer;
}

function formatAssistName(rawAssist) {
  const assist = sanitizeText(rawAssist);
  if (!assist) return null;
  const cleaned = assist.replace(/^assist\s*:\s*/i, "").trim();
  return cleaned || null;
}

function evaluateShotTelemetry(matchingShot, eg) {
  if (!matchingShot) {
    return { xG: null, xGOT: null, shotDistance: null, isGreatGoal: false };
  }

  const xG =
    typeof matchingShot.expectedGoals === "number"
      ? matchingShot.expectedGoals
      : typeof matchingShot.xG === "number"
        ? matchingShot.xG
        : null;

  const xGOT =
    typeof matchingShot.expectedGoalsOnTarget === "number"
      ? matchingShot.expectedGoalsOnTarget
      : typeof matchingShot.xGOT === "number"
        ? matchingShot.xGOT
        : null;

  const situation = matchingShot.situation || matchingShot.shotType || "";

  // Check if penalty
  const isPenalty =
    eg?.type === "GoalPen" ||
    (eg?.scorerName && eg.scorerName.includes("(P)")) ||
    situation.toLowerCase().includes("penalty");

  let shotDistanceMeters = null;

  if (typeof matchingShot.distance === "number") {
    shotDistanceMeters = Math.round(matchingShot.distance * 10) / 10;
  }

  if (
    shotDistanceMeters === null &&
    typeof matchingShot.x === "number" &&
    typeof matchingShot.y === "number"
  ) {
    const sx = matchingShot.x;
    const sy = matchingShot.y;

    const px = sx > 1 ? (sx <= 100 ? (sx / 100) * 105 : sx) : sx * 105;
    const py = sy > 1 ? (sy <= 100 ? (sy / 100) * 68 : sy) : sy * 68;

    const dx = Math.max(0, 105 - px);
    const dy = Math.abs(py - 34);

    shotDistanceMeters = Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
  }

  // Long distance shot (22.0+ meters / 24+ yards)
  const isOutsideTheBox =
    (shotDistanceMeters !== null && shotDistanceMeters >= 22.0) ||
    situation.toLowerCase().includes("outsidethebox") ||
    situation.toLowerCase().includes("outside_box");

  const isLowXg = xG !== null && xG > 0 && xG <= 0.09;
  const isFreeKick = situation.toLowerCase().includes("freekick");
  const isGreatFinish =
    xGOT !== null && xG !== null && xGOT >= 0.8 && xG <= 0.09;

  // Penalties are NEVER great goals
  const isGreatGoal =
    !isPenalty && (isOutsideTheBox || isFreeKick || isLowXg || isGreatFinish);

  return {
    xG: xG !== null ? Math.round(xG * 100) / 100 : null,
    xGOT: xGOT !== null ? Math.round(xGOT * 100) / 100 : null,
    shotDistance: shotDistanceMeters,
    isGreatGoal,
  };
}

function parseMatchStatus(status = {}, match = {}) {
  if (status.finished) return "FT";
  if (status.cancelled) return "Cancelled";
  if (status.reason?.shortKey === "halftime_short") return "HT";
  if (status.liveTime?.short) {
    const cleaned = status.liveTime.short.replace(/[\u200E\u200F]/g, "").trim();
    return /^\d+(\+\d+)?$/.test(cleaned)
      ? `${cleaned}′`
      : cleaned.replace(/’/g, "′");
  }
  if (status.reason?.short && status.reason.short !== "NS") {
    return status.reason.short;
  }
  if (match.startTimeStr) return match.startTimeStr;

  // Extract local HH:mm kickoff time from utcTime or timeTS
  const timeSource = status.utcTime || match.timeTS;
  if (timeSource) {
    try {
      const date = new Date(timeSource);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    } catch {
      // ignore
    }
  }

  return "TBD";
}

function transformFotmobMatch(match, league) {
  const status = match.status || {};

  // Strictly live: match is ongoing or has an active match clock/halftime, not finished/cancelled
  const isActive =
    !status.finished &&
    !status.cancelled &&
    (!!status.ongoing ||
      !!status.liveTime?.short ||
      status.reason?.shortKey === "halftime_short");

  const isFriendly = league.name
    ? league.name.toLowerCase().includes("friendly") ||
      league.name.toLowerCase().includes("friendlies")
    : false;

  return {
    id: match.id,
    leagueName: league.name,
    leagueId: league.id || league.primaryId,
    ccode: league.ccode || "INT",
    isFriendly,
    isActive,
    finished: !!status.finished,
    home: {
      id: match.home?.id || null,
      name: match.home?.name || "Unknown",
      score: match.home?.score !== undefined ? match.home.score : 0,
    },
    away: {
      id: match.away?.id || null,
      name: match.away?.name || "Unknown",
      score: match.away?.score !== undefined ? match.away.score : 0,
    },
    homeLogo: match.home?.id
      ? `https://images.fotmob.com/image_resources/logo/teamlogo/${match.home.id}.png`
      : null,
    awayLogo: match.away?.id
      ? `https://images.fotmob.com/image_resources/logo/teamlogo/${match.away.id}.png`
      : null,
    minute: parseMatchStatus(status, match),
    timeTS:
      match.timeTS ||
      (status.utcTime ? new Date(status.utcTime).getTime() : null),
  };
}

// Modular Sub-Components
function TeamLogo({ src, className = "w-6 h-6 object-contain flex-shrink-0" }) {
  return (
    <img
      src={src || DEFAULT_TEAM_LOGO}
      alt=""
      className={className}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_TEAM_LOGO;
      }}
    />
  );
}

function getGoalSearchUrl(scorerName, teamName) {
  const team = teamName || "";
  if (!scorerName || scorerName.trim() === "" || scorerName === "Goal") {
    return `https://x.com/search?q=${encodeURIComponent((team + " goal").trim())}`;
  }
  const cleanScorer = scorerName.replace(/\s*\((OG|P)\)/gi, "").trim();
  return `https://x.com/search?q=${encodeURIComponent((cleanScorer + " " + team + " goal").trim())}`;
}

function getDisplayGoals(goalsArr, teamScore, isHome) {
  if (teamScore <= 0) return [];
  const result = [...goalsArr];
  while (result.length < teamScore) {
    result.push({
      scorer: "Goal",
      time: "",
      isHome,
      isGreatGoal: false,
      isPlaceholder: true,
    });
  }
  return result;
}

function ScrollableFeed({ children }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 pt-3 pb-2 no-scrollbar scroll-smooth">
      {children}
    </div>
  );
}

function PlaceholderWidget({
  icon: Icon,
  title,
  placeholderTitle,
  description,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="border-[0.5px] border-background-light rounded-xl overflow-hidden bg-background-dark/20 shadow-md transition-all">
      {/* Widget Header Bar (Matches League Header Style) */}
      <div
        className={`px-4 py-2.5 bg-background-dark/60 flex justify-between items-center ${
          !isCollapsed ? "border-b border-background-light/50" : ""
        }`}
      >
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-secondary flex-shrink-0" />
          <span className="font-bold text-sm tracking-wide">{title}</span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-primary/60 hover:text-primary hover:bg-background-light/40 transition-colors border border-background-light/60 bg-background-dark/50 cursor-pointer"
          title={isCollapsed ? "Expand widget" : "Collapse widget"}
        >
          {isCollapsed ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronUpIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Widget Content Body */}
      {!isCollapsed && (
        <div className="p-6 border-[0.5px] border-dashed border-background-light/50 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2.5">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-xs text-primary/80 uppercase tracking-wider mb-1">
            {placeholderTitle}
          </h3>
          <p className="text-[11px] text-primary/50 max-w-[200px]">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}

const getTodayCacheKey = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `fotmob_details_cache_${dateStr}`;
};

const loadDetailsCache = () => {
  try {
    const raw = sessionStorage.getItem(getTodayCacheKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveDetailsCache = (cacheObj) => {
  try {
    sessionStorage.setItem(getTodayCacheKey(), JSON.stringify(cacheObj));
  } catch {
    // ignore
  }
};

function FotmobCompanion() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [allTodayMatches, setAllTodayMatches] = useState([]);
  const [showOnlyLive, setShowOnlyLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [matchDetailsMap, setMatchDetailsMap] = useState(loadDetailsCache());
  const [collapsedLeagues, setCollapsedLeagues] = useState({});
  const [hiddenScorersLeagues, setHiddenScorersLeagues] = useState({});
  const previousScoresRef = useRef({});
  const fetchedMatchDetailsCacheRef = useRef(loadDetailsCache());

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

  const updateMatchDetails = (matchId, details) => {
    if (!details) return;
    const detailsCache = fetchedMatchDetailsCacheRef.current;
    detailsCache[matchId] = details;
    saveDetailsCache(detailsCache);
    setMatchDetailsMap((prev) => ({
      ...prev,
      [matchId]: details,
    }));
  };

  // Fetch detailed telemetry (events & shotmap xG) for a match
  const fetchMatchDetails = async (matchId) => {
    if (!SERVERLESS_WORKER_URL) return null;

    try {
      const endpoint = `${SERVERLESS_WORKER_URL.replace(/\/$/, "")}?matchId=${matchId}&_t=${Date.now()}`;
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) return null;

      const data = await res.json();
      const extractedGoals = [];

      const rawEvents = [];
      const homeGoalsObj = data?.header?.events?.homeTeamGoals || {};
      const awayGoalsObj = data?.header?.events?.awayTeamGoals || {};

      [...Object.values(homeGoalsObj), ...Object.values(awayGoalsObj)].forEach(
        (arr) => {
          if (Array.isArray(arr)) rawEvents.push(...arr);
        },
      );

      if (rawEvents.length === 0) {
        const factsEvents =
          data?.content?.matchFacts?.events?.events ||
          data?.content?.matchFacts?.events ||
          [];
        if (Array.isArray(factsEvents)) {
          rawEvents.push(
            ...factsEvents.filter((e) =>
              ["Goal", "GoalPen", "OwnGoal"].includes(e.type),
            ),
          );
        }
      }

      rawEvents.forEach((g) => {
        const scorer = formatScorerName(
          g.player?.name || g.fullName || g.nameStr || g.name || g.playerName,
          g.type,
        );
        const assist = formatAssistName(
          g.assistInput || g.assistStr || g.assistPlayer?.name,
        );
        const rawMin =
          typeof g.time === "number" ? g.time : parseInt(g.timeStr, 10) || 0;

        extractedGoals.push({
          scorer,
          assist,
          time: g.timeStr ? `${g.timeStr}′` : g.time ? `${g.time}′` : null,
          minuteRaw: rawMin,
          isHome: !!g.isHome,
          scoreDisplay: g.newScore
            ? `${g.newScore[0]} - ${g.newScore[1]}`
            : null,
        });
      });

      // Enrich goals with shotmap xG telemetry
      const shotmapShots = data?.content?.shotmap?.shots || [];
      extractedGoals.forEach((eg) => {
        const matchingShot = shotmapShots.find((s) => {
          const isGoalShot =
            s.eventType === "Goal" || s.isGoal || s.type === "Goal";
          if (!isGoalShot) return false;
          const minMatch =
            Math.abs((s.min || s.minute || 0) - eg.minuteRaw) <= 1;
          const nameMatch =
            eg.scorer &&
            s.player?.name &&
            eg.scorer.toLowerCase().includes(s.player.name.toLowerCase());
          return minMatch || nameMatch;
        });

        const telemetry = evaluateShotTelemetry(matchingShot, eg);
        Object.assign(eg, telemetry);
      });

      return extractedGoals.sort((a, b) => a.minuteRaw - b.minuteRaw);
    } catch {
      return null;
    }
  };

  // Main Live Score Polling
  const fetchLiveScores = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const endpoint = `${SERVERLESS_FIXTURES_WORKER_URL.replace(/\/$/, "")}?date=${dateStr}&_t=${Date.now()}`;

      const res = await fetch(endpoint, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.leagues) {
          const parsed = processFotmobData(data);
          setMatches(parsed.liveList);
          setAllTodayMatches(parsed.allList);
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
  }, []);

  function processGoalEvents(allMatchesList) {
    const prevScores = previousScoresRef.current;
    const detailsCache = fetchedMatchDetailsCacheRef.current;

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
        saveDetailsCache(detailsCache);
        setMatchDetailsMap((prev) => {
          const next = { ...prev };
          delete next[m.id];
          return next;
        });
      }

      // Optimization: If details are already cached in memory or sessionStorage
      if (detailsCache[m.id]) {
        updateMatchDetails(m.id, detailsCache[m.id]);

        // Re-fetch if a live match scored a NEW goal OR if cached details are incomplete/missing scorer names
        const cachedDetails = detailsCache[m.id] || [];
        const cachedCount = cachedDetails.length;
        const hasMissingScorer = cachedDetails.some(
          (g) => !g.scorer || g.scorer.trim() === "",
        );
        const isIncomplete =
          (cachedCount < totalGoals || hasMissingScorer) && !isFinished;

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
  }

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

  useEffect(() => {
    fetchLiveScores();
    const timer = setInterval(fetchLiveScores, 60000); // 1 minute auto-refresh
    return () => clearInterval(timer);
  }, [fetchLiveScores]);

  // Dataset Filtering
  const activeDataset = showOnlyLive ? matches : allTodayMatches;
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
        <div className="relative flex-1 max-w-sm min-w-[220px]">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-primary/40" />
          <input
            type="text"
            placeholder="Search teams or leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-background-light bg-background-dark/80 text-primary placeholder-primary/40 focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center space-x-3 mx-auto md:mx-0">
          <button
            onClick={() => setShowOnlyLive(!showOnlyLive)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
              showOnlyLive
                ? "border border-secondary/50 bg-secondary/10 text-secondary"
                : "cardComponent text-primary"
            }`}
          >
            <SignalIcon className="h-3.5 w-3.5" />
            <span>{showOnlyLive ? "Live Only" : "All Today"}</span>
          </button>

          <button
            onClick={fetchLiveScores}
            disabled={loading}
            className="cardComponent smallEnlarge px-3 py-1.5 text-xs font-semibold text-secondary flex items-center space-x-1.5"
            title="Refresh Live Scores"
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80 flex items-center space-x-2">
              <TrophyIcon className="h-4 w-4 text-secondary" />
              <span>League Fixtures ({filteredMatches.length})</span>
            </h2>
            <span className="text-xs text-primary/50">
              {lastUpdated ? `Updated ${lastUpdated}` : "Loading..."}
            </span>
          </div>

          <ScrollableFeed>
            {Object.keys(groupedLeagues).length === 0 ? (
              <div className="border-[0.5px] border-background-light rounded-xl p-8 text-center bg-background-dark/20 shadow-sm">
                <h3 className="font-bold text-lg mb-2">No Matches Found</h3>
                <p className="text-sm text-primary/70">
                  {showOnlyLive
                    ? "There are currently no active live matches for the selected search."
                    : "No matches found under this filter."}
                </p>
              </div>
            ) : (
              Object.values(groupedLeagues).map((group, groupIdx) => {
                const isCollapsed = !!collapsedLeagues[group.name];
                const areScorersHidden = !!hiddenScorersLeagues[group.name];

                return (
                  <div
                    key={groupIdx}
                    className="border-[0.5px] border-background-light rounded-xl overflow-hidden bg-background-dark/20 shadow-md transition-all"
                  >
                    {/* League Header with Toggle Controls */}
                    <div className="px-4 py-2.5 border-b border-background-light/50 bg-background-dark/60 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm tracking-wide">
                          {group.name}
                        </span>
                        <span className="text-xs text-primary/50 font-mono">
                          ({group.matches.length})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Hide / Show Scorers Button */}
                        <button
                          onClick={() => toggleHideScorers(group.name)}
                          className={`p-1 rounded transition-colors border ${
                            areScorersHidden
                              ? "border-secondary/40 bg-secondary/15 text-secondary"
                              : "border-background-light/60 bg-background-dark/50 text-primary/60 hover:text-primary hover:bg-background-light/40"
                          }`}
                          title={
                            areScorersHidden ? "Show scorers" : "Hide scorers"
                          }
                        >
                          {areScorersHidden ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>

                        {/* Collapse / Expand League Fixtures Button */}
                        <button
                          onClick={() => toggleCollapseLeague(group.name)}
                          className="p-1 rounded text-primary/60 hover:text-primary hover:bg-background-light/40 transition-colors border border-background-light/60 bg-background-dark/50"
                          title={
                            isCollapsed
                              ? "Expand match list"
                              : "Collapse match list"
                          }
                        >
                          {isCollapsed ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronUpIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Match List (only rendered if not collapsed) */}
                    {!isCollapsed && (
                      <div className="divide-y divide-background-light/30">
                        {group.matches.map((m) => {
                          const matchGoals =
                            matchDetailsMap[m.id] ||
                            fetchedMatchDetailsCacheRef.current[m.id] ||
                            [];
                          const rawHomeGoals = matchGoals.filter(
                            (g) => g.isHome,
                          );
                          const rawAwayGoals = matchGoals.filter(
                            (g) => !g.isHome,
                          );

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
                              className="p-3.5 hover:bg-background-light/30 transition-colors flex flex-col gap-2"
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
                                        : "bg-background-score text-primary/70 border border-transparent"
                                    }`}
                                  >
                                    {m.isActive ||
                                    m.finished ||
                                    m.minute === "FT"
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
                                <div className="flex items-start justify-between text-[11px] pt-1.5 border-t border-background-light/20 gap-2">
                                  <div className="w-14 flex-shrink-0" />

                                  {/* Home Team Scorers (Right Aligned) */}
                                  <div className="flex-1 text-right space-y-1">
                                    {homeGoals.map((g, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-end space-x-1.5 flex-wrap"
                                      >
                                        {g.isGreatGoal && (
                                          <span className="text-[9px] font-bold text-secondary bg-secondary/15 px-1 py-0.5 rounded uppercase tracking-wider">
                                            Great Goal
                                          </span>
                                        )}
                                        <a
                                          href={getGoalSearchUrl(
                                            g.scorer,
                                            m.home.name,
                                          )}
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
                                          href={getGoalSearchUrl(
                                            g.scorer,
                                            m.away.name,
                                          )}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary/70 hover:text-secondary hover:underline cursor-pointer transition-colors font-medium"
                                          title={`Search ${g.scorer || "goal"} on X`}
                                        >
                                          {g.scorer || "Goal"}
                                        </a>
                                        {g.isGreatGoal && (
                                          <span className="text-[9px] font-bold text-secondary bg-secondary/15 px-1 py-0.5 rounded uppercase tracking-wider">
                                            Great Goal
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
                    )}
                  </div>
                );
              })
            )}
          </ScrollableFeed>
        </div>

        {/* RIGHT COLUMN: Custom Widgets Column (6 Cols - Stacked vertically) */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 mb-3 flex-shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80 flex items-center space-x-2">
              <ChartBarIcon className="h-4 w-4 text-secondary" />
              <span>Stats & Insights</span>
            </h2>
            <span className="text-xs text-primary/50">Telemetry</span>
          </div>

          <ScrollableFeed>
            <GoalsPerHourWidget
              allMatches={allTodayMatches}
              matchDetailsMap={matchDetailsMap}
              isFavoriteLeague={isMatchInFavoriteLeagues}
            />
            <PlaceholderWidget
              icon={ChartBarIcon}
              title="Insight Block 2"
              placeholderTitle="Placeholder Content 2"
              description="Ready for watchlist, standings, or custom quick-links."
            />
            <PlaceholderWidget
              icon={BoltIcon}
              title="Insight Block 3"
              placeholderTitle="Placeholder Content 3"
              description="Ready for detailed team metrics, form guides, or tactical overview."
            />
            <PlaceholderWidget
              icon={TrophyIcon}
              title="Insight Block 4"
              placeholderTitle="Placeholder Content 4"
              description="Ready for custom feeds, notifications, or head-to-head records."
            />
          </ScrollableFeed>
        </div>
      </div>
    </div>
  );
}

export default FotmobCompanion;
