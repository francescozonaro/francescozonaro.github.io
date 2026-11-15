import { useState, useRef, useEffect } from "react";
import { fetchMatchDetails } from "../api/fotmobApi";
import { extractGoalEvents, isDetailsComplete } from "../utils/goalEvents";
import {
  getCachedDetails,
  setCachedDetails,
  pruneOldCacheDays,
} from "../utils/detailsCache";

export function useMatchDetails(matches, dateStr) {
  const [detailsMap, setDetailsMap] = useState({});
  const lastScoreRef = useRef({});
  const matchesBeingFetchedRef = useRef(new Set());
  const hydratedMatchesRef = useRef(new Set());

  useEffect(() => {
    pruneOldCacheDays();
  }, []);

  useEffect(() => {
    matches.forEach((match) => {
      if (hydratedMatchesRef.current.has(match.id)) return;
      hydratedMatchesRef.current.add(match.id);

      const cached = getCachedDetails(dateStr, match.id);
      if (!cached) return;

      setDetailsMap((prev) => ({ ...prev, [match.id]: cached.goals }));
      if (cached.isComplete) {
        lastScoreRef.current[match.id] = cached.totalGoals;
      }
    });
  }, [matches, dateStr]);

  useEffect(() => {
    matches.forEach((match) => {
      const totalGoals = match.home.score + match.away.score;
      if (totalGoals === 0) return;
      if (matchesBeingFetchedRef.current.has(match.id)) return;
      if (lastScoreRef.current[match.id] === totalGoals) return;

      matchesBeingFetchedRef.current.add(match.id);

      fetchMatchDetails(match.id)
        .then((data) => {
          const goals = extractGoalEvents(data);
          setDetailsMap((prev) => ({ ...prev, [match.id]: goals }));

          // Stop retrying once the data is complete, or the match is over
          // (nothing more will change).
          const isComplete = isDetailsComplete(
            goals,
            totalGoals,
            data?.general?.coverageLevel,
          );
          if (isComplete || match.finished) {
            lastScoreRef.current[match.id] = totalGoals;
          }

          // Only persist complete data: a finished match that is still
          // missing scorers/coords is retried on the next page load.
          if (isComplete) {
            setCachedDetails(dateStr, match.id, {
              goals,
              totalGoals,
              isComplete,
            });
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          matchesBeingFetchedRef.current.delete(match.id);
        });
    });
  }, [matches, dateStr]);

  return detailsMap;
}
