import PropTypes from "prop-types";

// Config & Favorites Definitions
export const HARDCODED_FAVORITES_TEAMS = [
  // Additional Hardcoded Favorites
  { id: 8634, name: "Barcelona" },
  { id: 10003, name: "Swansea" },
  { id: 189481, name: "Union Brescia" },
];

export const HARDCODED_FAVORITES_LEAGUES = [
  55, // Serie A (Italy)
  86, // Serie B (Italy)
  141, // Coppa Italia (Italy)
  47, // Premier League (England)
  48, // Championship (England)
  57, // Eredivisie
  40, // Belgian Pro League
  74, // UEFA Super Cup
  10611, // Champions League Qualifiers
  10043, // Leagues Cup (USA)
];

export const DEFAULT_TEAM_LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E";

export const SERVERLESS_DETAILS_WORKER_URL =
  "https://fotmob-details.turtleunderablanket.workers.dev";
export const SERVERLESS_FIXTURES_WORKER_URL =
  "https://fotmob-fixtures.turtleunderablanket.workers.dev";

export function getGoalSearchUrl(scorerName) {
  if (!scorerName) return "#";
  const cleanName = scorerName.replace(/\s*\((?:OG|P|\d+′?)\)/gi, "").trim();
  return `https://x.com/search?q=${encodeURIComponent(cleanName)}&f=live`;
}

export function isFavoriteTeam(team) {
  if (!team) return false;
  const targetName = (team.name || "").trim().toLowerCase();
  const targetId =
    typeof team.id === "number" ? team.id : parseInt(team.id, 10);

  return HARDCODED_FAVORITES_TEAMS.some((fav) => {
    if (fav.id !== undefined && !isNaN(targetId)) return fav.id === targetId;
    if (fav.name && targetName !== "") {
      return fav.name.trim().toLowerCase() === targetName;
    }
    return false;
  });
}

export function isFavoriteMatch(match) {
  if (!match) return false;
  return (
    isMatchInFavoriteLeagues(match.leagueName, match.leagueId) ||
    isFavoriteTeam(match.home) ||
    isFavoriteTeam(match.away)
  );
}

export function filterFavoriteMatches(matches, filterFn = isFavoriteMatch) {
  return (matches || []).filter((m) => filterFn(m));
}

export function isMatchInFavoriteLeagues(leagueName, leagueId) {
  if (
    !HARDCODED_FAVORITES_LEAGUES ||
    HARDCODED_FAVORITES_LEAGUES.length === 0
  ) {
    return true;
  }
  const targetId =
    typeof leagueId === "number" ? leagueId : parseInt(leagueId, 10);

  return HARDCODED_FAVORITES_LEAGUES.some(
    (id) => !isNaN(targetId) && id === targetId,
  );
}

export function sanitizeText(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("tbd") || lower.includes("<tbd>")) return null;
  return raw;
}

export function formatScorerName(rawName, type) {
  let scorer = sanitizeText(rawName);
  if (!scorer) return null;
  if (type === "OwnGoal") scorer += " (OG)";
  if (type === "GoalPen") scorer += " (P)";
  return scorer;
}

export function formatAssistName(rawAssist) {
  const assist = sanitizeText(rawAssist);
  if (!assist) return null;
  const cleaned = assist.replace(/^assist\s*:\s*/i, "").trim();
  return cleaned || null;
}

const PITCH_LENGTH_M = 105;
const PITCH_WIDTH_M = 68;
export const LONG_RANGE_THRESHOLD_M = 16.5;

export function shotDistanceFromGoal(xM, yM) {
  const dx = PITCH_LENGTH_M - Math.min(xM, PITCH_LENGTH_M);
  const dy = PITCH_WIDTH_M / 2 - yM;
  return Math.round(Math.hypot(dx, dy) * 10) / 10;
}

// formatScorerName() appends "(OG)"/"(P)" to the scorer string, so that
// suffix is the one reliable signal for these across both freshly-fetched
// and cached goals.
export function isOwnGoalScorer(scorer) {
  return !!scorer && scorer.toLowerCase().includes("(og)");
}

export function isPenaltyScorer(scorer) {
  return !!scorer && scorer.toLowerCase().includes("(p)");
}

export function evaluateShot(matchingShot, eg) {
  if (
    !matchingShot ||
    typeof matchingShot.x !== "number" ||
    typeof matchingShot.y !== "number"
  ) {
    return { isLongRangeGoal: false, distance: null, x: null, y: null };
  }

  const { x, y } = matchingShot;
  const scorer = eg?.scorer;

  const isOwnGoal = matchingShot.isOwnGoal === true || isOwnGoalScorer(scorer);
  const isPenalty =
    isPenaltyScorer(scorer) ||
    matchingShot.situation === "Penalty" ||
    matchingShot.eventType === "Penalty" ||
    matchingShot.shotType === "Penalty";

  const distance = shotDistanceFromGoal(x, y);

  let isLongRangeGoal = false;
  let outDistance = distance;

  if (isOwnGoal) {
    outDistance = null;
  } else if (!isPenalty) {
    isLongRangeGoal = distance >= LONG_RANGE_THRESHOLD_M;
  }

  return { isLongRangeGoal, distance: outDistance, x, y };
}

export function parseMatchStatus(status = {}, match = {}) {
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
    } catch (e) {
      console.error("Failed to parse match status timestamp:", e);
    }
  }

  return "TBD";
}

export function transformFotmobMatch(match, league) {
  const status = match.status || {};

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
    leagueId: league.primaryId || league.id,
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

export function getDisplayGoals(goalsArr, teamScore, isHome) {
  if (teamScore <= 0) return [];
  const result = [...goalsArr];
  while (result.length < teamScore) {
    result.push({
      scorer: "Goal",
      time: "",
      isHome,
      isLongRangeGoal: false,
      distance: null,
      isPlaceholder: true,
    });
  }
  return result;
}
