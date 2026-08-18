const FOTMOB_IMAGE_LOCATION =
  "https://images.fotmob.com/image_resources/logo/teamlogo/";

export function formatLiveMinute(liveTimeShort) {
  return liveTimeShort.replace(/[^a-zA-Z0-9]/g, "");
}

export function formatKickoffTime(utcTime) {
  if (!utcTime) return "TBD";
  return new Date(utcTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function transformFotmobMatch(match, league) {
  if (!match) {
    return {};
  }

  const status = match.status;
  const homeId = match.home.id;
  const homeName = match.home.name;
  const homeScore = match.home.score;
  const awayId = match.away.id;
  const awayName = match.away.name;
  const awayScore = match.away.score;

  return {
    id: match.id,
    leagueName: league.name,
    leagueId: league.primaryId || league.id,
    finished: !!status.finished,
    cancelled: !!status.cancelled,
    utcTime: formatKickoffTime(status.utcTime),
    liveTimeShort: status.liveTime?.short
      ? formatLiveMinute(status.liveTime.short)
      : null,
    home: {
      id: homeId || null,
      name: homeName || "Unknown",
      score: homeScore ?? 0,
    },
    away: {
      id: awayId || null,
      name: awayName || "Unknown",
      score: awayScore ?? 0,
    },
    homeLogo: homeId ? `${FOTMOB_IMAGE_LOCATION}${homeId}.png` : null,
    awayLogo: awayId ? `${FOTMOB_IMAGE_LOCATION}${awayId}.png` : null,
  };
}
