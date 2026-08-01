import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  SignalIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  TrophyIcon,
  SparklesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import ThemeToggle from "../components/ThemeToggle";

// Config & Favorites Definitions
const HARDCODED_FAVORITES_TEAMS = ["Philippines"];
const HARDCODED_FAVORITES_LEAGUES = ["ASEAN Championship Grp. B"];
const HARDCODED_FAVORITES_PLAYERS = ["John"];

const DEFAULT_TEAM_LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E";

const SERVERLESS_WORKER_URL =
  "https://fotmob-details.turtleunderablanket.workers.dev";

// Pure Modular Helper Functions
function isFavoriteTeam(teamName) {
  if (!teamName) return false;
  const target = teamName.trim().toLowerCase();
  return HARDCODED_FAVORITES_TEAMS.some(
    (fav) => fav.trim().toLowerCase() === target,
  );
}

function isFavoritePlayer(playerName) {
  if (!playerName) return false;
  const target = playerName.trim().toLowerCase();
  return HARDCODED_FAVORITES_PLAYERS.some(
    (fav) => fav.trim().toLowerCase() === target,
  );
}

function isMatchInFavoriteLeagues(leagueName) {
  if (
    !HARDCODED_FAVORITES_LEAGUES ||
    HARDCODED_FAVORITES_LEAGUES.length === 0
  ) {
    return true;
  }
  if (!leagueName) return false;
  const target = leagueName.trim().toLowerCase();
  return HARDCODED_FAVORITES_LEAGUES.some(
    (favLeague) => favLeague.trim().toLowerCase() === target,
  );
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
  return assist.toLowerCase().includes("assist") ? assist : `Assist: ${assist}`;
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

  const situation = matchingShot.situation || matchingShot.shotType || null;

  let isDistanceScreamer = false;
  let shotDistanceMeters = null;

  if (typeof matchingShot.distance === "number") {
    shotDistanceMeters = Math.round(matchingShot.distance * 10) / 10;
  }

  if (
    typeof matchingShot.x === "number" &&
    typeof matchingShot.y === "number"
  ) {
    const sx = matchingShot.x;
    const sy = matchingShot.y;

    const px = sx > 1 ? (sx <= 100 ? (sx / 100) * 105 : sx) : sx * 105;
    const py = sy > 1 ? (sy <= 100 ? (sy / 100) * 68 : sy) : sy * 68;

    const dx = Math.max(0, 105 - px);
    const dy = Math.abs(py - 34);

    const directDist = Math.sqrt(dx * dx + dy * dy);
    if (shotDistanceMeters === null) {
      shotDistanceMeters = Math.round(directDist * 10) / 10;
    }

    const effectiveDist = directDist + dy * 0.75;
    if (effectiveDist >= 22.0) {
      isDistanceScreamer = true;
    }
  } else if (shotDistanceMeters !== null && shotDistanceMeters >= 22.0) {
    isDistanceScreamer = true;
  }

  const isLowXg = xG !== null && xG > 0 && xG <= 0.09;
  const isFreeKick = !!(
    situation && situation.toLowerCase().includes("freekick")
  );
  const isGreatFinish =
    xGOT !== null &&
    xG !== null &&
    (xGOT - xG >= 0.35 || (xGOT >= 0.8 && xG <= 0.25));

  return {
    xG: xG !== null ? Math.round(xG * 100) / 100 : null,
    xGOT: xGOT !== null ? Math.round(xGOT * 100) / 100 : null,
    shotDistance: shotDistanceMeters,
    isGreatGoal: isLowXg || isFreeKick || isGreatFinish || isDistanceScreamer,
  };
}

function parseMatchStatus(status = {}) {
  if (status.finished) return "FT";
  if (status.cancelled) return "Cancelled";
  if (status.reason?.shortKey === "halftime_short") return "HT";
  if (status.liveTime?.short) {
    const cleaned = status.liveTime.short.replace(/[\u200E\u200F]/g, "").trim();
    return /^\d+(\+\d+)?$/.test(cleaned)
      ? `${cleaned}′`
      : cleaned.replace(/’/g, "′");
  }
  if (status.startTimeStr) return status.startTimeStr;
  if (status.reason?.short && status.reason.short !== "NS")
    return status.reason.short;
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
    minute: parseMatchStatus(status),
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

function GoalBadge({ goal }) {
  const getScorerSearchUrl = (scorerName) => {
    if (!scorerName) return "https://x.com/search?q=great%20goal";
    const cleanScorer = scorerName.replace(/\s*\((OG|P)\)/gi, "").trim();
    return `https://x.com/search?q=${encodeURIComponent(cleanScorer + " goal")}`;
  };

  return (
    <div className="absolute -top-2.5 right-4 flex items-center space-x-2">
      {goal.isGreatGoal && (
        <a
          href={getScorerSearchUrl(goal.scorerName)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-md transition-transform hover:scale-105 cursor-pointer no-underline"
          title={`Click to search for ${goal.scorerName || "this goal"} on X (Twitter)`}
        >
          <span>🚀 GREAT GOAL! ↗</span>
        </a>
      )}

      {goal.isFavorite && (
        <a
          href="https://www.goalstube.online/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-md transition-transform hover:scale-105 cursor-pointer no-underline"
          title="Click to search / watch goal on GoalsTube"
        >
          <span>
            {goal.isFavoriteTeam && goal.isFavoritePlayer
              ? "FAVORITE TEAM & PLAYER GOAL!"
              : goal.isFavoriteTeam
                ? "FAVORITE TEAM GOAL!"
                : "FAVORITE PLAYER GOAL!"}
          </span>
        </a>
      )}
    </div>
  );
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
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-2 mb-3 flex-shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80 flex items-center space-x-2">
          <Icon className="h-4 w-4 text-secondary" />
          <span>{title}</span>
        </h2>
      </div>
      <div className="flex-1 p-5 border-[0.5px] border-dashed border-background-light/70 rounded-xl bg-background-dark/20 flex flex-col items-center justify-center text-center">
        <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2.5">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-xs text-primary/80 uppercase tracking-wider mb-1">
          {placeholderTitle}
        </h3>
        <p className="text-[11px] text-primary/50 max-w-[170px]">
          {description}
        </p>
      </div>
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
  const [goalFeed, setGoalFeed] = useState([]);
  const previousScoresRef = useRef({});
  const fetchedMatchDetailsCacheRef = useRef(loadDetailsCache());

  // Helper to map and update Goal Feed state from match details array
  const updateGoalFeedFromDetails = (m, details) => {
    if (!details || details.length === 0) return;

    const fullGoalCards = details.map((g) => {
      const scoringTeam = g.isHome ? m.home.name : m.away.name;
      const opponentTeam = g.isHome ? m.away.name : m.home.name;
      const scoringLogo = g.isHome ? m.homeLogo : m.awayLogo;

      const favTeam =
        isFavoriteTeam(scoringTeam) || isFavoriteTeam(opponentTeam);
      const favPlayer =
        isFavoritePlayer(g.scorer) || isFavoritePlayer(g.assist);

      const scoreText = g.scoreDisplay || `${m.home.score} - ${m.away.score}`;
      const goalId = `${m.id}_${g.isHome ? "H" : "A"}_${scoreText}`;

      return {
        id: goalId,
        matchId: m.id,
        leagueName: m.leagueName,
        scoringTeam,
        opponentTeam,
        scoringLogo,
        scoreDisplay: scoreText,
        minute: g.time || m.minute || "Live",
        minuteRaw: g.minuteRaw,
        timestampRaw: Date.now(),
        isFavorite: favTeam || favPlayer,
        isFavoriteTeam: favTeam,
        isFavoritePlayer: favPlayer,
        isGreatGoal: !!g.isGreatGoal,
        xG: g.xG !== undefined ? g.xG : null,
        xGOT: g.xGOT !== undefined ? g.xGOT : null,
        isLiveGoal: m.isActive,
        scorerName: g.scorer,
        assistName: g.assist,
      };
    });

    setGoalFeed((prevFeed) => {
      const map = new Map();
      prevFeed.forEach((item) => map.set(item.id, item));
      fullGoalCards.forEach((newItem) => {
        const existing = map.get(newItem.id);
        if (existing) {
          const updatedScorer = newItem.scorerName || existing.scorerName;
          const updatedAssist = newItem.assistName || existing.assistName;
          const updatedFavPlayer =
            isFavoritePlayer(updatedScorer) || isFavoritePlayer(updatedAssist);
          const updatedFavTeam =
            newItem.isFavoriteTeam || existing.isFavoriteTeam;

          map.set(newItem.id, {
            ...existing,
            ...newItem,
            timestampRaw: existing.timestampRaw,
            scorerName: updatedScorer,
            assistName: updatedAssist,
            isFavoriteTeam: updatedFavTeam,
            isFavoritePlayer: updatedFavPlayer,
            isFavorite: updatedFavTeam || updatedFavPlayer,
            isGreatGoal: newItem.isGreatGoal || existing.isGreatGoal,
            xG: newItem.xG !== null ? newItem.xG : existing.xG,
            xGOT: newItem.xGOT !== null ? newItem.xGOT : existing.xGOT,
          });
        } else {
          map.set(newItem.id, newItem);
        }
      });
      return Array.from(map.values()).sort(
        (a, b) => b.minuteRaw - a.minuteRaw || b.timestampRaw - a.timestampRaw,
      );
    });
  };

  // Fetch detailed telemetry (events & shotmap xG) for a live match
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
      const rawUrl = `https://www.fotmob.com/api/data/matches?date=${dateStr}&_t=${Date.now()}`;

      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rawUrl)}`,
      ];

      let data = null;

      for (const proxyUrl of proxies) {
        try {
          const res = await fetch(proxyUrl, { cache: "no-store" });
          if (res.ok) {
            data = await res.json();
            if (data && data.leagues) break;
          }
        } catch {
          // ignore & try next proxy
        }
      }

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

      // Only fetch details for matches in favorite leagues or favorite teams
      const isRelevantMatch =
        isMatchInFavoriteLeagues(m.leagueName) ||
        isFavoriteTeam(m.home.name) ||
        isFavoriteTeam(m.away.name);

      if (!isRelevantMatch) {
        prevScores[m.id] = totalGoals;
        return;
      }

      const prevTotal = prevScores[m.id];
      const isInitialCheck = prevTotal === undefined;
      const scoreChanged = !isInitialCheck && totalGoals !== prevTotal;
      const isFinished = m.finished || m.minute === "FT";

      // Optimization: If details are already cached in memory or sessionStorage
      if (detailsCache[m.id]) {
        updateGoalFeedFromDetails(m, detailsCache[m.id]);

        // Re-fetch only if a live match scored a NEW goal
        if (scoreChanged && !isFinished) {
          fetchMatchDetails(m.id).then((details) => {
            if (details && details.length > 0) {
              detailsCache[m.id] = details;
              saveDetailsCache(detailsCache);
              updateGoalFeedFromDetails(m, details);
            }
          });
        }
        prevScores[m.id] = totalGoals;
        return;
      }

      // If NOT cached yet, fetch once and store in session cache
      fetchMatchDetails(m.id).then((details) => {
        if (details && details.length > 0) {
          detailsCache[m.id] = details;
          saveDetailsCache(detailsCache);
          updateGoalFeedFromDetails(m, details);
        }
      });

      prevScores[m.id] = totalGoals;
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
    const timer = setInterval(fetchLiveScores, 3600000); // 1 hour auto-refresh
    return () => clearInterval(timer);
  }, [fetchLiveScores]);

  // Dataset Filtering
  const activeDataset = showOnlyLive ? matches : allTodayMatches;
  let filteredMatches = activeDataset.filter(
    (m) =>
      isMatchInFavoriteLeagues(m.leagueName) ||
      isFavoriteTeam(m.home.name) ||
      isFavoriteTeam(m.away.name),
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

  // Filter Live Goal Stream
  const liveMatchIds = new Set(matches.map((m) => m.id));
  let filteredGoalFeed = goalFeed.filter(
    (g) =>
      (isMatchInFavoriteLeagues(g.leagueName) ||
        g.isFavoriteTeam ||
        g.isFavoritePlayer) &&
      (!showOnlyLive || liveMatchIds.has(g.matchId)),
  );

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filteredGoalFeed = filteredGoalFeed.filter(
      (g) =>
        (g.scoringTeam && g.scoringTeam.toLowerCase().includes(q)) ||
        (g.opponentTeam && g.opponentTeam.toLowerCase().includes(q)) ||
        (g.leagueName && g.leagueName.toLowerCase().includes(q)) ||
        (g.scorerName && g.scorerName.toLowerCase().includes(q)) ||
        (g.assistName && g.assistName.toLowerCase().includes(q)),
    );
  }

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
          <span>FotMob Live Command Center</span>
        </div>
        <p className="mt-3 text-xs text-center leading-relaxed max-w-2xl mx-auto text-primary/70">
          A real-time match command center siphoning live FotMob API scores,
          tracking league fixtures, and streaming live goal events with custom
          team highlights.
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

      {/* Split Dashboard: Fixtures (5 Cols) vs Goal Stream (4 Cols) vs Widgets (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch flex-1 min-h-[350px] overflow-hidden pb-2">
        {/* LEFT COLUMN: Matches List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
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
              Object.values(groupedLeagues).map((group, groupIdx) => (
                <div
                  key={groupIdx}
                  className="border-[0.5px] border-background-light rounded-xl overflow-hidden bg-background-dark/20 shadow-md"
                >
                  <div className="px-4 py-3 border-b border-background-light/50 bg-background-dark/60 flex justify-between items-center">
                    <span className="font-bold text-sm tracking-wide">
                      {group.name}
                    </span>
                    {group.isFriendly && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Friendly
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-background-light/30">
                    {group.matches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 flex items-center justify-between hover:bg-background-light/30 transition-colors gap-2"
                      >
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

                        <div className="px-3 min-w-[75px] text-center flex-shrink-0">
                          <div className="font-mono text-base font-extrabold tracking-wider px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                            {m.home.score} - {m.away.score}
                          </div>
                        </div>

                        <div className="flex-1 flex items-center justify-start space-x-2 text-left">
                          <TeamLogo src={m.awayLogo} />
                          <span className="font-semibold text-sm line-clamp-1">
                            {m.away.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </ScrollableFeed>
        </div>

        {/* MIDDLE COLUMN: Real-Time Goal Stream (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 mb-3 flex-shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary/80 flex items-center space-x-2">
              <BoltIcon className="h-4 w-4 text-secondary animate-bounce" />
              <span>Live Goal Stream ({filteredGoalFeed.length})</span>
            </h2>
          </div>

          <ScrollableFeed>
            {filteredGoalFeed.length === 0 ? (
              <div className="p-6 border border-dashed border-background-light/60 rounded-xl text-center text-primary/50 text-xs">
                {searchQuery.trim() !== ""
                  ? `No goals matching "${searchQuery}".`
                  : "No live goals in active matches currently. Goals scored in live games will stream here automatically."}
              </div>
            ) : (
              filteredGoalFeed.map((goal) => (
                <div
                  key={goal.id}
                  className={`relative p-4 rounded-xl border transition-all duration-300 ${
                    goal.isFavorite
                      ? "border-amber-400/60 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                      : "border-background-light bg-background-dark/40 shadow-sm"
                  }`}
                >
                  <GoalBadge goal={goal} />

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-secondary text-[11px] tracking-wide uppercase line-clamp-1">
                      {goal.leagueName}
                    </span>
                    <span className="text-primary/50 font-mono text-[10px]">
                      {goal.minute}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TeamLogo
                        src={goal.scoringLogo}
                        className="w-5 h-5 object-contain flex-shrink-0"
                      />
                      <span className="font-bold text-sm">
                        {goal.scoringTeam}
                      </span>
                    </div>
                    <span className="font-mono text-base font-extrabold px-2.5 py-0.5 rounded bg-secondary/15 text-secondary">
                      {goal.scoreDisplay}
                    </span>
                  </div>

                  {(goal.scorerName || goal.xG !== null) && (
                    <div className="text-xs pt-2 border-t border-background-light/40 mt-2 space-y-1">
                      {goal.scorerName && (
                        <div className="flex items-center justify-between space-x-1.5 font-semibold text-primary/90">
                          <span>⚽ {goal.scorerName}</span>
                          {goal.xG !== null && (
                            <span className="text-[10px] font-mono text-primary/50">
                              xG: {goal.xG}
                            </span>
                          )}
                        </div>
                      )}
                      {goal.assistName && (
                        <div className="flex items-center space-x-1.5 text-primary/60 text-[11px]">
                          <span>👟 {goal.assistName}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </ScrollableFeed>
        </div>

        {/* RIGHT COLUMN: Custom Widgets (3 Cols - 2 Blocks) */}
        <div className="lg:col-span-3 flex flex-col space-y-4 min-h-0">
          <PlaceholderWidget
            icon={SparklesIcon}
            title="Insight Block 1"
            placeholderTitle="Placeholder Content 1"
            description="Ready for upcoming telemetry, match analysis, or player stats."
          />
          <PlaceholderWidget
            icon={ChartBarIcon}
            title="Insight Block 2"
            placeholderTitle="Placeholder Content 2"
            description="Ready for watchlist, standings, or custom quick-links."
          />
        </div>
      </div>
    </div>
  );
}

export default FotmobCompanion;
