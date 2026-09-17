const CACHE_KEY_PREFIX = "fotmob-companion:details:";
const MAX_CACHE_AGE_DAYS = 14;

let pruned = false;

function cacheKey(dateStr) {
  return `${CACHE_KEY_PREFIX}${dateStr}`;
}

function readDayCache(dateStr) {
  try {
    const raw = localStorage.getItem(cacheKey(dateStr));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDayCache(dateStr, dayCache) {
  try {
    localStorage.setItem(cacheKey(dateStr), JSON.stringify(dayCache));
  } catch {
    // Ignore quota/private-browsing errors - cache is best-effort.
  }
}

export function pruneOldCacheDays() {
  if (pruned) return;
  pruned = true;

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MAX_CACHE_AGE_DAYS);

    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(CACHE_KEY_PREFIX)) continue;

      const dateStr = key.slice(CACHE_KEY_PREFIX.length);
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime()) || date < cutoff) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore - pruning is best-effort.
  }
}

export function getCachedDetails(dateStr, matchId) {
  const dayCache = readDayCache(dateStr);
  return dayCache[matchId] ?? null;
}

export function setCachedDetails(dateStr, matchId, { goals, totalGoals, isComplete }) {
  const dayCache = readDayCache(dateStr);
  dayCache[matchId] = { goals, totalGoals, isComplete, updatedAt: Date.now() };
  writeDayCache(dateStr, dayCache);
}
