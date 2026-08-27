const PITCH_LENGTH_M = 105;
const PITCH_WIDTH_M = 68;
const LONG_RANGE_THRESHOLD_M = 20;

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
    };
  }

  const { x, y } = shot;
  const distance = shotDistanceFromGoal(x, y);
  const isPenalty = isPenaltyShot(shot);
  const isOwnGoal = isOwnGoalShot(shot);

  return {
    isLongRange: isOwnGoal ? false : distance >= LONG_RANGE_THRESHOLD_M,
    isPenalty,
    distance,
    x,
    y,
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

export function getGoalSearchUrl(scorerName) {
  if (!scorerName) return "#";
  const cleanName = scorerName.replace(/\s*\((?:OG|P|\d+′?)\)/gi, "").trim();
  return `https://x.com/search?q=${encodeURIComponent(cleanName)}&f=live`;
}

export function extractGoalEvents(data) {
  const goalShots = findGoalShots(data);
  const homeId = data?.general?.homeTeam?.id;
  const awayId = data?.general?.awayTeam?.id;
  const goals = goalShots.map((shot) => buildGoalEvent(shot, homeId, awayId));
  const sorted = goals.sort((a, b) => a.time - b.time);

  let homeScore = 0;
  let awayScore = 0;
  return sorted.map((goal) => {
    if (goal.isHomeGoal) homeScore += 1;
    else awayScore += 1;
    return { ...goal, homeScore, awayScore };
  });
}
