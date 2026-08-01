import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  SignalIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
import ThemeToggle from "../components/ThemeToggle";

const HARDCODED_FAVORITES_TEAMS = ["PSMS"];
const HARDCODED_FAVORITES_LEAGUES = ["Liga II"];
const HARDCODED_FAVORITES_PLAYERS = ["Romario Moise"];

function isFavoriteTeam(teamName) {
  if (!teamName) return false;
  return HARDCODED_FAVORITES_TEAMS.some(
    (fav) => fav.toLowerCase() === teamName.toLowerCase(),
  );
}

function isFavoritePlayer(playerName) {
  if (!playerName) return false;
  return HARDCODED_FAVORITES_PLAYERS.some((fav) =>
    playerName.toLowerCase().includes(fav.toLowerCase()),
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
  return HARDCODED_FAVORITES_LEAGUES.some((favLeague) =>
    leagueName.toLowerCase().includes(favLeague.toLowerCase()),
  );
}

function ScrollableFeed({ children }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 pb-2 no-scrollbar scroll-smooth">
      {children}
    </div>
  );
}

function FotmobCompanion() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [allTodayMatches, setAllTodayMatches] = useState([]);
  const [showOnlyLive, setShowOnlyLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Goal Stream State
  const [goalFeed, setGoalFeed] = useState([]);
  const previousScoresRef = useRef({});

  const SERVERLESS_WORKER_URL =
    "https://fotmob-details.turtleunderablanket.workers.dev";

  const fetchMatchDetails = async (matchId) => {
    if (!SERVERLESS_WORKER_URL) return null;

    try {
      const endpoint = `${SERVERLESS_WORKER_URL.replace(/\/$/, "")}?matchId=${matchId}&_t=${Date.now()}`;
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) return null;

      const data = await res.json();
      const extractedGoals = [];

      const cleanScorer = (rawName) => {
        if (!rawName) return null;
        if (
          rawName.toLowerCase().includes("tbd") ||
          rawName.toLowerCase().includes("<tbd>")
        ) {
          return null;
        }
        return rawName;
      };

      const cleanAssist = (rawAssist) => {
        if (!rawAssist) return null;
        if (
          rawAssist.toLowerCase().includes("tbd") ||
          rawAssist.toLowerCase().includes("<tbd>")
        ) {
          return null;
        }
        if (!rawAssist.toLowerCase().includes("assist")) {
          return `Assist: ${rawAssist}`;
        }
        return rawAssist;
      };

      // Extract goals from header.events (homeTeamGoals & awayTeamGoals)
      const homeGoalsObj = data?.header?.events?.homeTeamGoals || {};
      const awayGoalsObj = data?.header?.events?.awayTeamGoals || {};

      [...Object.values(homeGoalsObj), ...Object.values(awayGoalsObj)].forEach(
        (goalArray) => {
          if (Array.isArray(goalArray)) {
            goalArray.forEach((g) => {
              let scorer = cleanScorer(
                g.player?.name || g.fullName || g.nameStr,
              );
              if (scorer && g.type === "OwnGoal") scorer += " (OG)";
              if (scorer && g.type === "GoalPen") scorer += " (P)";

              let assist = cleanAssist(g.assistInput || g.assistStr);

              const rawMin =
                typeof g.time === "number"
                  ? g.time
                  : parseInt(g.timeStr, 10) || 0;

              extractedGoals.push({
                scorer: scorer,
                assist: assist,
                time: g.timeStr
                  ? `${g.timeStr}′`
                  : g.time
                    ? `${g.time}′`
                    : null,
                minuteRaw: rawMin,
                isHome: !!g.isHome,
                scoreDisplay: g.newScore
                  ? `${g.newScore[0]} - ${g.newScore[1]}`
                  : null,
              });
            });
          }
        },
      );

      // Fallback to matchFacts events array if header goals are empty
      if (extractedGoals.length === 0) {
        const events =
          data?.content?.matchFacts?.events?.events ||
          data?.content?.matchFacts?.events ||
          [];

        if (Array.isArray(events)) {
          events
            .filter(
              (e) =>
                e.type === "Goal" ||
                e.type === "GoalPen" ||
                e.type === "OwnGoal",
            )
            .forEach((g) => {
              let scorer = cleanScorer(
                g.player?.name || g.name || g.playerName || g.fullName,
              );
              if (scorer && g.type === "OwnGoal") scorer += " (OG)";
              if (scorer && g.type === "GoalPen") scorer += " (P)";

              let assist = cleanAssist(
                g.assistInput || g.assistStr || g.assistPlayer?.name,
              );

              const rawMin =
                typeof g.time === "number"
                  ? g.time
                  : parseInt(g.timeStr, 10) || 0;

              extractedGoals.push({
                scorer: scorer,
                assist: assist,
                time: g.timeStr
                  ? `${g.timeStr}′`
                  : g.time
                    ? `${g.time}′`
                    : null,
                minuteRaw: rawMin,
                isHome: !!g.isHome,
                scoreDisplay: g.newScore
                  ? `${g.newScore[0]} - ${g.newScore[1]}`
                  : null,
              });
            });
        }
      }

      // Enrich extracted goals with shotmap xG telemetry if available
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

        if (matchingShot) {
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
          const situation =
            matchingShot.situation || matchingShot.shotType || null;

          // Distance & Angle Geometry calculation
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

            // Normalize scale to 105x68 pitch
            const px = sx > 1 ? (sx <= 100 ? (sx / 100) * 105 : sx) : sx * 105;
            const py = sy > 1 ? (sy <= 100 ? (sy / 100) * 68 : sy) : sy * 68;

            const dx = Math.max(0, 105 - px); // meters to goal line
            const dy = Math.abs(py - 34); // meters off-center from goal middle

            const directDist = Math.sqrt(dx * dx + dy * dy);
            if (shotDistanceMeters === null) {
              shotDistanceMeters = Math.round(directDist * 10) / 10;
            }

            // Angle weighting: The stranger/sharper the side angle (larger dy),
            // the smaller the required distance for a "Great Goal"!
            const effectiveDist = directDist + dy * 0.75;

            if (effectiveDist >= 22.0) {
              isDistanceScreamer = true;
            }
          } else if (
            shotDistanceMeters !== null &&
            shotDistanceMeters >= 22.0
          ) {
            isDistanceScreamer = true;
          }

          const isLowXg = xG !== null && xG > 0 && xG <= 0.09;
          const isFreeKick =
            situation && situation.toLowerCase().includes("freekick");
          const isGreatFinish =
            xGOT !== null &&
            xG !== null &&
            (xGOT - xG >= 0.35 || (xGOT >= 0.8 && xG <= 0.25));

          eg.xG = xG !== null ? Math.round(xG * 100) / 100 : null;
          eg.xGOT = xGOT !== null ? Math.round(xGOT * 100) / 100 : null;
          eg.shotDistance = shotDistanceMeters;
          eg.isGreatGoal =
            isLowXg || isFreeKick || isGreatFinish || isDistanceScreamer;
        } else {
          eg.xG = null;
          eg.xGOT = null;
          eg.shotDistance = null;
          eg.isGreatGoal = false;
        }
      });

      return extractedGoals.sort((a, b) => a.minuteRaw - b.minuteRaw);
    } catch {
      return null;
    }
  };

  const fetchLiveScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rawUrl = `https://www.fotmob.com/api/data/matches?date=${dateStr}&_t=${Date.now()}`;

      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rawUrl)}`,
      ];

      let data = null;
      let lastErr = null;

      for (const proxyUrl of proxies) {
        try {
          const res = await fetch(proxyUrl, { cache: "no-store" });
          if (res.ok) {
            data = await res.json();
            if (data && data.leagues) break;
          }
        } catch (e) {
          lastErr = e;
        }
      }

      if (!data || !data.leagues) {
        throw lastErr || new Error("Failed to connect to score server");
      }

      const parsedData = processFotmobData(data);
      setMatches(parsedData.liveList);
      setAllTodayMatches(parsedData.allList);

      // Track score updates & generate live goal events
      processGoalEvents(parsedData.allList);

      const nowStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastUpdated(nowStr);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch live scores");
    } finally {
      setLoading(false);
    }
  }, []);

  function processGoalEvents(allMatchesList) {
    const newGoals = [];
    const prevScores = previousScoresRef.current;
    const isFirstLoad = Object.keys(prevScores).length === 0;

    allMatchesList.forEach((m) => {
      const prev = prevScores[m.id];
      const currentHomeScore = m.home.score;
      const currentAwayScore = m.away.score;
      const totalGoals = currentHomeScore + currentAwayScore;

      if (m.isActive && totalGoals > 0) {
        if (SERVERLESS_WORKER_URL) {
          fetchMatchDetails(m.id).then((details) => {
            if (details && details.length > 0) {
              const fullGoalCards = details.map((g) => {
                const scoringTeam = g.isHome ? m.home.name : m.away.name;
                const opponentTeam = g.isHome ? m.away.name : m.home.name;
                const scoringLogo = g.isHome ? m.homeLogo : m.awayLogo;

                const favTeam =
                  isFavoriteTeam(scoringTeam) || isFavoriteTeam(opponentTeam);
                const favPlayer =
                  isFavoritePlayer(g.scorer) || isFavoritePlayer(g.assist);

                const scoreText =
                  g.scoreDisplay || `${currentHomeScore} - ${currentAwayScore}`;
                const goalId = `${m.id}_${g.isHome ? "H" : "A"}_${scoreText}`;

                return {
                  id: goalId,
                  matchId: m.id,
                  leagueName: m.leagueName,
                  scoringTeam: scoringTeam,
                  opponentTeam: opponentTeam,
                  scoringLogo: scoringLogo,
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
                    const updatedScorer =
                      newItem.scorerName || existing.scorerName;
                    const updatedAssist =
                      newItem.assistName || existing.assistName;
                    const updatedFavPlayer =
                      isFavoritePlayer(updatedScorer) ||
                      isFavoritePlayer(updatedAssist);
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
                      xGOT:
                        newItem.xGOT !== null ? newItem.xGOT : existing.xGOT,
                    });
                  } else {
                    map.set(newItem.id, newItem);
                  }
                });
                return Array.from(map.values()).sort(
                  (a, b) =>
                    b.minuteRaw - a.minuteRaw ||
                    b.timestampRaw - a.timestampRaw,
                );
              });
            }
          });
        } else {
          if (!prev && isFirstLoad) {
            if (currentHomeScore > 0)
              newGoals.push(
                createGoalEvent(
                  m,
                  m.home.name,
                  m.away.name,
                  currentHomeScore,
                  currentAwayScore,
                  true,
                ),
              );
            if (currentAwayScore > 0)
              newGoals.push(
                createGoalEvent(
                  m,
                  m.away.name,
                  m.home.name,
                  currentHomeScore,
                  currentAwayScore,
                  false,
                ),
              );
          } else if (prev) {
            if (currentHomeScore > prev.home)
              newGoals.push(
                createGoalEvent(
                  m,
                  m.home.name,
                  m.away.name,
                  currentHomeScore,
                  currentAwayScore,
                  true,
                ),
              );
            if (currentAwayScore > prev.away)
              newGoals.push(
                createGoalEvent(
                  m,
                  m.away.name,
                  m.home.name,
                  currentHomeScore,
                  currentAwayScore,
                  false,
                ),
              );
          }
        }
      }

      // Record score state
      prevScores[m.id] = { home: currentHomeScore, away: currentAwayScore };
    });

    if (newGoals.length > 0) {
      setGoalFeed((prevFeed) => {
        const map = new Map();
        prevFeed.forEach((item) => map.set(item.id, item));
        newGoals.forEach((newItem) => {
          const existing = map.get(newItem.id);
          if (existing) {
            const updatedScorer = newItem.scorerName || existing.scorerName;
            const updatedAssist = newItem.assistName || existing.assistName;
            const updatedFavPlayer =
              isFavoritePlayer(updatedScorer) ||
              isFavoritePlayer(updatedAssist);
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
            });
          } else {
            map.set(newItem.id, newItem);
          }
        });
        return Array.from(map.values());
      });
    }
  }

  function createGoalEvent(
    match,
    scoringTeam,
    opponentTeam,
    homeScore,
    awayScore,
    isHome,
  ) {
    const favTeam = isFavoriteTeam(scoringTeam) || isFavoriteTeam(opponentTeam);
    const scoringLogo = isHome ? match.homeLogo : match.awayLogo;
    const eventId = `${match.id}_${isHome ? "H" : "A"}_${homeScore} - ${awayScore}`;

    const newGoalObj = {
      id: eventId,
      matchId: match.id,
      leagueName: match.leagueName,
      scoringTeam: scoringTeam,
      opponentTeam: opponentTeam,
      scoringLogo: scoringLogo,
      scoreDisplay: `${homeScore} - ${awayScore}`,
      minute: match.minute || "Live",
      timestampRaw: Date.now(),
      isFavorite: favTeam,
      isFavoriteTeam: favTeam,
      isFavoritePlayer: false,
      isLiveGoal: match.isActive,
      scorerName: null,
      assistName: null,
    };

    fetchMatchDetails(match.id).then((details) => {
      if (details && details.length > 0) {
        const goalDetail =
          details.find((d) => (isHome ? d.isHome : !d.isHome)) || details[0];
        if (goalDetail) {
          setGoalFeed((prev) =>
            prev.map((item) => {
              if (item.id !== eventId) return item;
              const scorer = goalDetail.scorer || item.scorerName;
              const assist = goalDetail.assist || item.assistName;
              const favPlayer =
                isFavoritePlayer(scorer) || isFavoritePlayer(assist);
              return {
                ...item,
                minute: goalDetail.time || item.minute,
                scorerName: scorer,
                assistName: assist,
                isFavoritePlayer: favPlayer,
                isFavorite: item.isFavoriteTeam || favPlayer,
              };
            }),
          );
        }
      }
    });

    return newGoalObj;
  }

  function processFotmobData(data) {
    if (!data || !data.leagues) return { liveList: [], allList: [] };

    const liveList = [];
    const allList = [];

    data.leagues.forEach((league) => {
      if (!league.matches) return;

      const isFriendly = league.name
        ? league.name.toLowerCase().includes("friendly") ||
          league.name.toLowerCase().includes("friendlies")
        : false;

      league.matches.forEach((match) => {
        const status = match.status || {};
        const isActive =
          (status.ongoing || (status.started && !status.finished)) &&
          !status.cancelled;

        let minute = "Live";
        if (status.finished) {
          minute = "FT";
        } else if (status.cancelled) {
          minute = "Cancelled";
        } else if (status.liveTime && status.liveTime.short) {
          const cleaned = status.liveTime.short
            .replace(/[\u200E\u200F]/g, "")
            .trim();
          minute = /^\d+(\+\d+)?$/.test(cleaned)
            ? cleaned + "′"
            : cleaned.replace(/’/g, "′");
        } else if (
          status.reason &&
          status.reason.shortKey === "halftime_short"
        ) {
          minute = "HT";
        } else if (status.reason && status.reason.short) {
          minute = status.reason.short;
        } else if (status.startTimeStr) {
          minute = status.startTimeStr;
        }

        const matchObj = {
          id: match.id,
          leagueName: league.name,
          leagueId: league.id || league.primaryId,
          ccode: league.ccode || "INT",
          isFriendly: isFriendly,
          isActive: isActive,
          finished: !!status.finished,
          home: {
            id: match.home ? match.home.id : null,
            name: match.home ? match.home.name : "Unknown",
            score:
              match.home && match.home.score !== undefined
                ? match.home.score
                : 0,
          },
          away: {
            id: match.away ? match.away.id : null,
            name: match.away ? match.away.name : "Unknown",
            score:
              match.away && match.away.score !== undefined
                ? match.away.score
                : 0,
          },
          homeLogo:
            match.home && match.home.id
              ? `https://images.fotmob.com/image_resources/logo/teamlogo/${match.home.id}.png`
              : null,
          awayLogo:
            match.away && match.away.id
              ? `https://images.fotmob.com/image_resources/logo/teamlogo/${match.away.id}.png`
              : null,
          minute: minute,
          timeTS:
            match.timeTS ||
            (status.utcTime ? new Date(status.utcTime).getTime() : null),
        };

        if (isActive) {
          liveList.push(matchObj);
        }
        allList.push(matchObj);
      });
    });

    return { liveList, allList };
  }

  useEffect(() => {
    fetchLiveScores();
    const timer = setInterval(fetchLiveScores, 120000);
    return () => clearInterval(timer);
  }, [fetchLiveScores]);

  // Filter dataset by hardcoded leagues or favorite teams
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

  // Group matches by league
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

  // Filter Live Goal Stream by hardcoded leagues (or favorite team/player bypass) & searchQuery
  let filteredGoalFeed = goalFeed.filter(
    (g) =>
      isMatchInFavoriteLeagues(g.leagueName) ||
      g.isFavoriteTeam ||
      g.isFavoritePlayer,
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
        {/* Search Bar */}
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

      {/* Split Dashboard: Matches (Left) vs Goal Event Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch flex-1 min-h-[350px] overflow-hidden pb-2">
        {/* LEFT COLUMN: Matches List (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0">
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
                  {/* League Header */}
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

                  {/* Matches Grid */}
                  <div className="divide-y divide-background-light/30">
                    {group.matches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 flex items-center justify-between hover:bg-background-light/30 transition-colors gap-2"
                      >
                        {/* Match Minute / Time (Far Left) */}
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

                        {/* Home Team */}
                        <div className="flex-1 flex items-center justify-end space-x-2 text-right">
                          <span className="font-semibold text-sm line-clamp-1">
                            {m.home.name}
                          </span>
                          {m.homeLogo && (
                            <img
                              src={m.homeLogo}
                              alt=""
                              className="w-6 h-6 object-contain flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                        </div>

                        {/* Score Badge (Centered) */}
                        <div className="px-3 min-w-[75px] text-center flex-shrink-0">
                          <div className="font-mono text-base font-extrabold tracking-wider px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                            {m.home.score} - {m.away.score}
                          </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex items-center justify-start space-x-2 text-left">
                          {m.awayLogo && (
                            <img
                              src={m.awayLogo}
                              alt=""
                              className="w-6 h-6 object-contain flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
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

        {/* RIGHT COLUMN: Real-Time Goal Stream (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
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
                  {/* Goal Celebration Badges (Great Goal and/or Favorite Goal) */}
                  <div className="absolute -top-2.5 right-4 flex items-center space-x-2">
                    {goal.isGreatGoal && (
                      <a
                        href="https://www.goalstube.online/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-md transition-transform hover:scale-105 cursor-pointer no-underline"
                        title="Low xG banger or exceptional finish! Click to watch on GoalsTube"
                      >
                        <span>GREAT GOAL!</span>
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

                  {/* Goal Header */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-secondary text-[11px] tracking-wide uppercase line-clamp-1">
                      {goal.leagueName}
                    </span>
                    <span className="text-primary/50 font-mono text-[10px]">
                      {goal.minute}
                    </span>
                  </div>

                  {/* Teams & Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {goal.scoringLogo && (
                        <img
                          src={goal.scoringLogo}
                          alt=""
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <span className="font-bold text-sm">
                        {goal.scoringTeam}
                      </span>
                    </div>
                    <span className="font-mono text-base font-extrabold px-2.5 py-0.5 rounded bg-secondary/15 text-secondary">
                      {goal.scoreDisplay}
                    </span>
                  </div>

                  {/* Optional Scorer & Assist Telemetry */}
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
      </div>
    </div>
  );
}

export default FotmobCompanion;
