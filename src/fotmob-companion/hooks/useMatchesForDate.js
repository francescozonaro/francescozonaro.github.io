import { useState, useEffect } from "react";
import { fetchFixtures } from "../api/fotmobApi";
import { getLocalDateString } from "../utils/date";
import { transformFotmobMatch } from "../utils/matchUtils";

const POLLING_INTERVAL = 60000;

export function useMatchesForDate(dateStr) {
  const [matches, setMatches] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshNonce, setRefreshNonce] = useState(0);

  function refetch() {
    setRefreshNonce((prev) => prev + 1);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      fetchFixtures(dateStr)
        .then((data) => {
          if (cancelled) return;
          const parsedMatches = [];
          data.leagues.forEach((league) => {
            league.matches.forEach((match) => {
              parsedMatches.push(transformFotmobMatch(match, league));
            });
          });
          setMatches(parsedMatches);
          setLastUpdated(new Date());
        })
        .catch((err) => {
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
        cancelled = true;
      };
    } else {
      return () => {
        cancelled = true;
      };
    }
  }, [dateStr, refreshNonce]);

  return {
    matches,
    lastUpdated,
    refetch,
  };
}
