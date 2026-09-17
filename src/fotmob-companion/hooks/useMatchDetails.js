import { useState, useRef, useEffect } from "react";
import { fetchMatchDetails } from "../api/fotmobApi";
import { extractGoalEvents } from "../utils/goalEvents";
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

          // FotMob sometimes hasn't posted every goal event onto the
          // shotmap yet (or hasn't backfilled a scorer's name, or hasn't
          // attached shot coordinates) - only stop retrying once we have an
          // event for every goal in the scoreline, each has a scorer, and
          // - for matches FotMob's own coverageLevel says should have shot
          // telemetry - each also has coordinates, or the match is over
          // (nothing more will change).
          const coverageLevel = data?.general?.coverageLevel ?? null;
          const hasAllGoals = goals.length === totalGoals;
          const hasAllScorers = goals.every((g) => g.scorer);
          const hasAllCoords =
            coverageLevel !== "xG" ||
            goals.every((g) => typeof g.x === "number" && typeof g.y === "number");
          const isComplete = hasAllGoals && hasAllScorers && hasAllCoords;
          if (isComplete || match.finished) {
            lastScoreRef.current[match.id] = totalGoals;
          }

          setCachedDetails(dateStr, match.id, {
            goals,
            totalGoals,
            isComplete: isComplete || match.finished,
          });
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
