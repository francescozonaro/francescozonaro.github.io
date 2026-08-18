export const FAVORITE_TEAMS = [
  8634, // "Barcelona"
  10003, // "Swansea"
  189481, // "Brescia"
];

export const FAVORITE_LEAGUES = [
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

export function isFavoriteTeam(teamId) {
  return FAVORITE_TEAMS.some((id) => id === teamId);
}

export function isMatchInFavoriteLeagues(leagueId) {
  return FAVORITE_LEAGUES.some((id) => id === leagueId);
}

export function isFavoriteMatch(match) {
  if (!match) return false;
  return (
    isMatchInFavoriteLeagues(match.leagueId) ||
    isFavoriteTeam(match.home.id) ||
    isFavoriteTeam(match.away.id)
  );
}
