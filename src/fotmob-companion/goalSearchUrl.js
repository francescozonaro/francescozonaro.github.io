export function getGoalSearchUrl(scorerName, teamName) {
  const team = teamName || "";
  if (!scorerName || scorerName.trim() === "" || scorerName === "Goal") {
    return `https://x.com/search?q=${encodeURIComponent((team + " goal").trim())}`;
  }
  const cleanScorer = scorerName.replace(/\s*\((OG|P)\)/gi, "").trim();
  return `https://x.com/search?q=${encodeURIComponent((cleanScorer + " " + team + " goal").trim())}`;
}
