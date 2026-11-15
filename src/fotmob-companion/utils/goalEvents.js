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
  const scorer = sanitizeScorer(shot.playerName);
  if (!scorer) return null;
  if (shot.isOwnGoal) return `${scorer} (OG)`;
  if (isPenaltyShot(shot)) return `${scorer} (P)`;
  return scorer;
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
  const isOwnGoal = shot.isOwnGoal;
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

// 45+3 -> 45.03, so it sorts before 46 (adding the minutes would give 48).
function sortableMinute(min, added) {
  return min + (added ?? 0) / 100;
}

function buildGoalEvent(shot, homeTeamId, awayTeamId) {
  const scorer = formatScorer(shot);
  const time = sortableMinute(shot.min, shot.minAdded);
  const timeStr = shot.minAdded
    ? `${shot.min}+${shot.minAdded}`
    : `${shot.min}`;

  const isOwnGoal = shot.isOwnGoal;
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
  const cleanName = cleanScorerName(scorerName);
  return `https://www.reddit.com/r/soccer/search/?q=${encodeURIComponent(cleanName)}&restrict_sr=1&sort=new`;
}

export function getXSearchUrl(scorerName) {
  const cleanName = cleanScorerName(scorerName);
  return `https://x.com/search?q=${encodeURIComponent(cleanName)}&f=live`;
}

export function getGoalSearchLinks(scorerName) {
  if (!scorerName) return [];
  return [
    { type: "reddit", url: getRedditSearchUrl(scorerName) },
    { type: "x", url: getXSearchUrl(scorerName) },
  ];
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

  const time = sortableMinute(event.time ?? 0, event.overloadTime);
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

  const goalShots = findGoalShots(data);
  const goals =
    goalShots.length > 0
      ? goalShots.map((shot) => buildGoalEvent(shot, homeId, awayId))
      : findHeaderGoalEvents(data).map((event) =>
          buildGoalEventFromHeader(event, homeId, awayId),
        );

  return goals.sort((a, b) => a.time - b.time);
}

// FotMob sometimes hasn't posted every goal event yet, or hasn't backfilled a
// scorer's name or shot coordinates. Data is complete once there is an event
// per goal in the scoreline, each has a scorer and - when FotMob's
// coverageLevel says shot telemetry should exist ("xG") - coordinates too.
export function isDetailsComplete(goals, totalGoals, coverageLevel) {
  return (
    goals.length === totalGoals &&
    goals.every((g) => g.scorer) &&
    (coverageLevel !== "xG" ||
      goals.every((g) => typeof g.x === "number" && typeof g.y === "number"))
  );
}
