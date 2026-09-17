export const FAVORITE_TEAMS = [
  8634, // "Barcelona"
  10003, // "Swansea"
  189481, // "Brescia"
  8686, // "Roma"
  130394, // "Seattle Sounders FC"
  8204, // "Italy"
  6659, // "Italy U21"
];

export const FAVORITE_LEAGUES = [
  55, // Serie A (Italy)
  86, // Serie B (Italy)
  141, // Coppa Italia (Italy)
  47, // Premier League (England)
  42, // Champions League
  73, // Europa League
  48, // Championship (England)
  74, // UEFA Super Cup
  10611, // Champions League Qualifiers
  87, // LaLiga (Spain)
  54, // Bundesliga (Germany)
  53, // Ligue 1 (France)
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

export function isFavoriteTeamMatch(match) {
  if (!match) return false;
  return isFavoriteTeam(match.home.id) || isFavoriteTeam(match.away.id);
}
