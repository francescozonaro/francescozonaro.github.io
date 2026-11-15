import { useState, useEffect } from "react";
import { fetchFixtures } from "../api/fotmobApi";
import { getLocalDateString } from "../utils/date";
import { transformFotmobMatch } from "../utils/matchUtils";

const POLLING_INTERVAL = 60000;
const NO_MATCHES = [];

export function useMatchesForDate(dateStr) {
  const [loaded, setLoaded] = useState({ dateStr: null, matches: [] });
  const [failedDate, setFailedDate] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      fetchFixtures(dateStr, controller.signal)
        .then((data) => {
          if (controller.signal.aborted) return;
          const parsedMatches = [];
          data.leagues.forEach((league) => {
            league.matches.forEach((match) => {
              parsedMatches.push(transformFotmobMatch(match, league));
            });
          });
          setLoaded({ dateStr, matches: parsedMatches });
          setFailedDate(null);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error(err);
          setFailedDate(dateStr);
        });
    }

    load();
    // "Today" is re-checked on every tick, so a tab left open past midnight
    // stops polling the old day; hidden tabs skip the request.
    const polling = setInterval(() => {
      if (document.hidden || dateStr !== getLocalDateString()) return;
      load();
    }, POLLING_INTERVAL);
    return () => {
      clearInterval(polling);
      controller.abort();
    };
  }, [dateStr]);

  return {
    // Hide matches loaded for another date if this date's fetch failed.
    matches: loaded.dateStr === dateStr ? loaded.matches : NO_MATCHES,
    failed: failedDate === dateStr,
  };
}
