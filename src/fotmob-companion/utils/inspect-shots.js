// Fetches every shot from yesterday's finished matches and prints the
// distinct combinations of situation / eventType / shotType seen, so you
// can see how they actually relate instead of guessing.
//
// Throwaway investigation script - delete when done.
// Usage: node src/fotmob-companion/utils/inspect-shots.js

const FIXTURES_URL = "https://fotmob-fixtures.turtleunderablanket.workers.dev";
const DETAILS_URL = "https://fotmob-details.turtleunderablanket.workers.dev";

function yesterdayDateParam() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

async function getFinishedMatchIds(dateParam) {
  const res = await fetch(`${FIXTURES_URL}?date=${dateParam}`);
  const data = await res.json();
  const ids = [];
  for (const league of data.leagues ?? []) {
    for (const match of league.matches ?? []) {
      if (match.status?.finished) ids.push(match.id);
    }
  }
  return ids;
}

async function getShots(matchId) {
  try {
    const res = await fetch(`${DETAILS_URL}?matchId=${matchId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data?.content?.shotmap?.shots ?? [];
  } catch {
    return [];
  }
}

async function main() {
  const dateParam = yesterdayDateParam();
  console.log(`Fetching finished matches for ${dateParam}...`);
  const matchIds = await getFinishedMatchIds(dateParam);
  console.log(`${matchIds.length} finished matches found.\n`);

  const combos = new Map(); // "situation|eventType|shotType" -> {count, example}

  for (const matchId of matchIds) {
    const shots = await getShots(matchId);
    for (const s of shots) {
      const key = `${s.situation}|${s.eventType}|${s.shotType}`;
      if (!combos.has(key)) {
        combos.set(key, { count: 0, example: s });
      }
      combos.get(key).count += 1;
    }
  }

  const rows = [...combos.entries()].sort((a, b) => b[1].count - a[1].count);

  console.log(
    "situation".padEnd(20) +
      "eventType".padEnd(16) +
      "shotType".padEnd(14) +
      "count",
  );
  console.log("-".repeat(60));
  for (const [key, { count }] of rows) {
    const [situation, eventType, shotType] = key.split("|");
    console.log(
      String(situation).padEnd(20) +
        String(eventType).padEnd(16) +
        String(shotType).padEnd(14) +
        count,
    );
  }
}

main();
