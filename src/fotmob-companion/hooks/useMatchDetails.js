import { useState, useRef, useEffect } from "react";
import { fetchMatchDetails } from "../api/fotmobApi";
import { extractGoalEvents } from "../utils/goalEvents";

export function useMatchDetails(matches) {
  const [detailsMap, setDetailsMap] = useState({});
  const lastScoreRef = useRef({});
  const matchesBeingFetchedRef = useRef(new Set());

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

          // FotMob sometimes hasn't backfilled a scorer's name onto the
          // shotmap yet - only stop retrying once every goal has one, or
          // the match is over (nothing more will change).
          const isComplete = goals.every((g) => g.scorer);
          if (isComplete || match.finished) {
            lastScoreRef.current[match.id] = totalGoals;
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          matchesBeingFetchedRef.current.delete(match.id);
        });
    });
  }, [matches]);

  return detailsMap;
}
