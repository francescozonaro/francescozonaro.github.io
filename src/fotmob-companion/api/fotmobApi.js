export const SERVERLESS_FIXTURES_WORKER_URL =
  "https://fotmob-fixtures.turtleunderablanket.workers.dev";
export const SERVERLESS_DETAILS_WORKER_URL =
  "https://fotmob-details.turtleunderablanket.workers.dev";

async function fetchJson(url, errorLabel, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(
        `${errorLabel} request failed: ${res.status} ${res.statusText}`,
      );
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`${errorLabel} request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchFixtures(dateStr) {
  const dateParam = dateStr.replace(/-/g, "");
  const endpoint = `${SERVERLESS_FIXTURES_WORKER_URL.replace(/\/$/, "")}?date=${dateParam}`;
  return fetchJson(endpoint, `Fixtures for ${dateStr}`);
}

export async function fetchMatchDetails(matchId) {
  const endpoint = `${SERVERLESS_DETAILS_WORKER_URL.replace(/\/$/, "")}?matchId=${matchId}`;
  return fetchJson(endpoint, `Match ${matchId} details`);
}
