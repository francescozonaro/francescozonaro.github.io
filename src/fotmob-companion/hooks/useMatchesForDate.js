import { useState, useEffect } from "react";
import { fetchFixtures } from "../api/fotmobApi";
import { getLocalDateString } from "../utils/date";
import { transformFotmobMatch } from "../utils/matchUtils";

const POLLING_INTERVAL = 60000;
const NO_MATCHES = [];

export function useMatchesForDate(dateStr) {
  const [loaded, setLoaded] = useState({ dateStr: null, matches: [] });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshNonce, setRefreshNonce] = useState(0);

  function refetch() {
    setRefreshNonce((prev) => prev + 1);
  }

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
          setLastUpdated(new Date());
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error(err);
        });
    }

    load();
    if (dateStr === getLocalDateString()) {
      const polling = setInterval(() => {
        load();
      }, POLLING_INTERVAL);
      return () => {
        clearInterval(polling);
        controller.abort();
      };
    } else {
      return () => {
        controller.abort();
      };
    }
  }, [dateStr, refreshNonce]);

  return {
    // Hide matches loaded for another date if this date's fetch failed.
    matches: loaded.dateStr === dateStr ? loaded.matches : NO_MATCHES,
    lastUpdated,
    refetch,
  };
}
