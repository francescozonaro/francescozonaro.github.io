const PITCH_LENGTH_M = 105;
const PITCH_WIDTH_M = 68;
const LONG_RANGE_THRESHOLD_M = 20;
const DELTA_THRESHOLD = 0.4;
const GREAT_FINISH_MAX_XG = 0.06;

function shotDistanceFromGoal(x, y) {
  const dx = x - PITCH_LENGTH_M;
  const dy = y - PITCH_WIDTH_M / 2;
  return Math.hypot(dx, dy);
}

function sanitizeScorer(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("tbd")) return null;
  return raw;
}

function formatScorer(shot) {
  const scorer = sanitizeScorer(getPlayerName(shot));
  if (!scorer) return null;
  if (isOwnGoalShot(shot)) return `${scorer} (OG)`;
  if (isPenaltyShot(shot)) return `${scorer} (P)`;
  return scorer;
}

function getPlayerName(shot) {
  return shot.playerName;
}

function isOwnGoalShot(shot) {
  return shot.isOwnGoal;
}

function isPenaltyShot(shot) {
  return shot.situation === "Penalty";
}

function findGoalShots(data) {
  const shots = data?.content?.shotmap?.shots || [];
  return shots.filter((s) => s.eventType === "Goal");
}

function getShotTelemetry(shot) {
  if (!shot || typeof shot.x !== "number" || typeof shot.y !== "number") {
    return {
      isLongRange: false,
      isPenalty: false,
      distance: null,
      x: null,
      y: null,
      xg: null,
      xgot: null,
      delta: null,
      isGreatFinish: false,
    };
  }

  const { x, y } = shot;
  const distance = shotDistanceFromGoal(x, y);
  const isPenalty = isPenaltyShot(shot);
  const isOwnGoal = isOwnGoalShot(shot);
  const xg = typeof shot.expectedGoals === "number" ? shot.expectedGoals : null;
  const xgot =
    typeof shot.expectedGoalsOnTarget === "number" ? shot.expectedGoalsOnTarget : null;
  const delta = xg !== null && xgot !== null ? xgot - xg : null;

  return {
    isLongRange: isOwnGoal ? false : distance >= LONG_RANGE_THRESHOLD_M,
    isPenalty,
    distance,
    x,
    y,
    xg,
    xgot,
    delta,
    isGreatFinish:
      !isOwnGoal &&
      !isPenalty &&
      delta !== null &&
      delta >= DELTA_THRESHOLD &&
      xg !== null &&
      xg < GREAT_FINISH_MAX_XG,
  };
}

function buildGoalEvent(shot, homeTeamId, awayTeamId) {
  const scorer = formatScorer(shot);
  const time = shot.min + (shot.minAdded ?? 0);
  const timeStr = shot.minAdded
    ? `${shot.min}+${shot.minAdded}`
    : `${shot.min}`;

  const isOwnGoal = isOwnGoalShot(shot);
  const isHomeShot = shot.teamId === homeTeamId;
  const isHomeGoal = isOwnGoal ? !isHomeShot : isHomeShot;
  const teamId = isHomeGoal ? homeTeamId : awayTeamId;

  return {
    scorer,
    teamId,
    time,
    timeStr,
    isOwnGoal,
    isHomeGoal,
    ...getShotTelemetry(shot),
  };
}

function cleanScorerName(scorerName) {
  return scorerName.replace(/\s*\((?:OG|P|\d+′?)\)/gi, "").trim();
}

export function getRedditSearchUrl(scorerName) {
  if (!scorerName) return "#";
  const cleanName = cleanScorerName(scorerName);
  return `https://www.reddit.com/r/soccer/search/?q=${encodeURIComponent(cleanName)}&restrict_sr=1&sort=new`;
}

// Some competitions don't get shotmap coverage from FotMob at all (shots
// list is empty even for a finished match) - fall back to the goal list
// from the match header, which has no distance/xG telemetry to offer but
// does have the scorer.
function findHeaderGoalEvents(data) {
  const homeGoalsObj = data?.header?.events?.homeTeamGoals || {};
  const awayGoalsObj = data?.header?.events?.awayTeamGoals || {};
  const events = [];
  for (const arr of [
    ...Object.values(homeGoalsObj),
    ...Object.values(awayGoalsObj),
  ]) {
    if (Array.isArray(arr)) events.push(...arr);
  }
  return events;
}

function buildGoalEventFromHeader(event, homeTeamId, awayTeamId) {
  const isOwnGoal = !!event.ownGoal;
  const isPenalty = event.goalDescriptionKey === "penalty";
  const isHomeGoal = !!event.isHome;
  const teamId = isHomeGoal ? homeTeamId : awayTeamId;

  let scorer = sanitizeScorer(event.player?.name || event.nameStr);
  if (scorer) {
    if (isOwnGoal) scorer = `${scorer} (OG)`;
    else if (isPenalty) scorer = `${scorer} (P)`;
  }

  const time = (event.time ?? 0) + (event.overloadTime ?? 0);
  const timeStr = event.overloadTime
    ? `${event.time}+${event.overloadTime}`
    : `${event.time}`;

  return {
    scorer,
    teamId,
    time,
    timeStr,
    isOwnGoal,
    isHomeGoal,
    isLongRange: false,
    isPenalty,
    distance: null,
    x: null,
    y: null,
    xg: null,
    xgot: null,
    delta: null,
    isGreatFinish: false,
  };
}

export function extractGoalEvents(data) {
  const homeId = data?.general?.homeTeam?.id;
  const awayId = data?.general?.awayTeam?.id;
  const coverageLevel = data?.general?.coverageLevel ?? null;

  const goalShots = findGoalShots(data);
  const goals =
    goalShots.length > 0
      ? goalShots.map((shot) => buildGoalEvent(shot, homeId, awayId))
      : findHeaderGoalEvents(data).map((event) =>
          buildGoalEventFromHeader(event, homeId, awayId),
        );

  const sorted = goals.sort((a, b) => a.time - b.time);

  let homeScore = 0;
  let awayScore = 0;
  return sorted.map((goal) => {
    if (goal.isHomeGoal) homeScore += 1;
    else awayScore += 1;
    return { ...goal, homeScore, awayScore, coverageLevel };
  });
}
