import PropTypes from "prop-types";

// Config & Favorites Definitions
export const HARDCODED_FAVORITES_TEAMS = [
  // Premier League (England) - Exact FotMob Team IDs & Names
  // { id: 9825, name: "Arsenal" },
  // { id: 10252, name: "Aston Villa" },
  // { id: 8678, name: "Bournemouth" },
  // { id: 9937, name: "Brentford" },
  // { id: 10204, name: "Brighton" },
  // { id: 8455, name: "Chelsea" },
  // { id: 9826, name: "Crystal Palace" },
  // { id: 8668, name: "Everton" },
  // { id: 9879, name: "Fulham" },
  // { id: 9902, name: "Ipswich" },
  // { id: 8197, name: "Leicester" },
  // { id: 8650, name: "Liverpool" },
  // { id: 8456, name: "Man City" },
  // { id: 10260, name: "Man United" },
  // { id: 10261, name: "Newcastle" },
  // { id: 10203, name: "Nottm Forest" },
  // { id: 8466, name: "Southampton" },
  // { id: 8586, name: "Tottenham" },
  // { id: 8654, name: "West Ham" },
  // { id: 8602, name: "Wolves" },
  // { id: 8191, name: "Burnley" },
  // { id: 8344, name: "Luton" },
  // { id: 8657, name: "Sheffield United" },
  // { id: 8463, name: "Leeds" },
  // { id: 8472, name: "Sunderland" },

  // // Serie A (Italy) - Exact FotMob Team IDs & Names
  // { id: 8524, name: "Atalanta" },
  // { id: 9857, name: "Bologna" },
  // { id: 8529, name: "Cagliari" },
  // { id: 10171, name: "Como" },
  // { id: 8534, name: "Empoli" },
  // { id: 8535, name: "Fiorentina" },
  // { id: 10233, name: "Genoa" },
  // { id: 9876, name: "Hellas Verona" },
  // { id: 8636, name: "Inter" },
  // { id: 9885, name: "Juventus" },
  // { id: 8543, name: "Lazio" },
  // { id: 9888, name: "Lecce" },
  // { id: 8564, name: "Milan" },
  // { id: 6504, name: "Monza" },
  // { id: 9875, name: "Napoli" },
  // { id: 10167, name: "Parma" },
  // { id: 8686, name: "Roma" },
  // { id: 9804, name: "Torino" },
  // { id: 8600, name: "Udinese" },
  // { id: 7881, name: "Venezia" },

  // // Additional Hardcoded Favorites
  // { id: 8634, name: "Barcelona" },
  // { id: 10003, name: "Swansea" },
  { id: 189481, name: "Union Brescia" },
];

export const HARDCODED_FAVORITES_LEAGUES = [
  // 55, // Serie A (Italy)
  // 47, // Premier League (England)
  // 86, // Serie B (Italy)
  // 133, // League Cup / Carabao Cup / EFL Cup (England)
  // 57, // Eredivisie
  40, // Belgian Pro League
];

export const DEFAULT_TEAM_LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E";

export const SERVERLESS_WORKER_URL =
  "https://fotmob-details.turtleunderablanket.workers.dev";
export const SERVERLESS_FIXTURES_WORKER_URL =
  "https://fotmob-fixtures.turtleunderablanket.workers.dev";

export function getGoalSearchUrl(scorerName, teamName = "") {
  if (!scorerName) return "#";
  const cleanName = scorerName.replace(/\s*\((?:OG|P|\d+′?)\)/gi, "").trim();
  const query = `${cleanName} ${teamName} goal`.trim();
  return `https://x.com/search?q=${encodeURIComponent(query)}&f=live`;
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

export function filterFavoriteMatches(matches, isFavoriteLeague) {
  if (typeof isFavoriteLeague !== "function") return matches || [];
  return (matches || []).filter((m) =>
    isFavoriteLeague(m.leagueName, m.leagueId),
  );
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

// FotMob shotmap coordinates are normalized to a 0-100 scale (percent of
// pitch length/width), not raw meters, so they must be scaled before any
// meter-based distance math.
export function shotDistanceFromGoal(xPct, yPct) {
  const xMeters = (xPct / 100) * PITCH_LENGTH_M;
  const yMeters = (yPct / 100) * PITCH_WIDTH_M;
  const dx = PITCH_LENGTH_M - Math.min(xMeters, PITCH_LENGTH_M);
  const dy = PITCH_WIDTH_M / 2 - yMeters;
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

// Single source of truth for turning a shot location + scorer label into a
// distance and long-range verdict. Own goals have no meaningful shooting
// distance; penalties are placed at a fixed spot so their distance isn't a
// measure of long-range finishing.
export function classifyGoalDistance({ x, y, scorer, shot = {} }) {
  if (typeof x !== "number" || typeof y !== "number") {
    return { distance: null, isLongRangeGoal: false };
  }

  const isOwnGoal = shot.isOwnGoal === true || isOwnGoalScorer(scorer);
  const isPenalty =
    isPenaltyScorer(scorer) ||
    shot.situation === "Penalty" ||
    shot.eventType === "Penalty" ||
    shot.shotType === "Penalty";

  const distance = shotDistanceFromGoal(x, y);

  if (isOwnGoal) return { distance: null, isLongRangeGoal: false };
  if (isPenalty) return { distance, isLongRangeGoal: false };
  return { distance, isLongRangeGoal: distance >= LONG_RANGE_THRESHOLD_M };
}

export function evaluateShotTelemetry(matchingShot, eg) {
  if (
    !matchingShot ||
    typeof matchingShot.x !== "number" ||
    typeof matchingShot.y !== "number"
  ) {
    console.log(
      `[Goal Telemetry] ${eg?.scorer || "Goal"} (${eg?.time || ""}): No telemetry / coordinates available`,
    );
    return { isLongRangeGoal: false, distance: null, x: null, y: null };
  }

  const { distance, isLongRangeGoal } = classifyGoalDistance({
    x: matchingShot.x,
    y: matchingShot.y,
    scorer: eg?.scorer,
    shot: matchingShot,
  });

  console.log(
    `[Goal Telemetry] ${eg?.scorer || "Goal"} (${eg?.time || ""}): x=${matchingShot.x.toFixed(1)}, y=${matchingShot.y.toFixed(1)} -> distance=${distance}m, isLongRange=${isLongRangeGoal}`,
  );

  return {
    isLongRangeGoal,
    distance,
    x: matchingShot.x,
    y: matchingShot.y,
  };
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
    } catch {
      // ignore
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

export function TeamLogo({
  src,
  className = "w-6 h-6 object-contain flex-shrink-0",
}) {
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

TeamLogo.propTypes = {
  src: PropTypes.string,
  className: PropTypes.string,
};
