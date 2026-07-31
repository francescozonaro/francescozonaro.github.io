import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowPathIcon, SignalIcon } from "@heroicons/react/24/solid";
import ThemeToggle from "../components/ThemeToggle";

function FotmobCompanion() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [allTodayMatches, setAllTodayMatches] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'friendlies', 'competitive'
  const [showOnlyLive, setShowOnlyLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchLiveScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rawUrl = `https://www.fotmob.com/api/data/matches?date=${dateStr}`;
      const url = `https://corsproxy.io/?` + encodeURIComponent(rawUrl);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      const data = await res.json();
      const parsedData = processFotmobData(data);
      setMatches(parsedData.liveList);
      setAllTodayMatches(parsedData.allList);

      const nowStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastUpdated(nowStr);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch live scores");
    } finally {
      setLoading(false);
    }
  }, []);

  function processFotmobData(data) {
    if (!data || !data.leagues) return { liveList: [], allList: [] };

    const liveList = [];
    const allList = [];

    data.leagues.forEach((league) => {
      if (!league.matches) return;

      const isFriendly = league.name
        ? league.name.toLowerCase().includes("friendly") ||
          league.name.toLowerCase().includes("friendlies")
        : false;

      league.matches.forEach((match) => {
        const status = match.status || {};
        const isActive =
          (status.ongoing || (status.started && !status.finished)) &&
          !status.cancelled;

        let minute = "Live";
        if (status.liveTime && status.liveTime.short) {
          const cleaned = status.liveTime.short
            .replace(/[\u200E\u200F]/g, "")
            .trim();
          if (/^\d+(\+\d+)?$/.test(cleaned)) {
            minute = cleaned + "′";
          } else {
            minute = cleaned.replace(/’/g, "′");
          }
        } else if (status.reason && status.reason.short) {
          minute = status.reason.short;
        } else if (status.scoreStr) {
          minute = status.scoreStr;
        } else if (status.finished) {
          minute = "FT";
        } else if (status.startTimeStr) {
          minute = status.startTimeStr;
        }

        const matchObj = {
          id: match.id,
          leagueName: league.name,
          leagueId: league.id || league.primaryId,
          ccode: league.ccode || "INT",
          isFriendly: isFriendly,
          isActive: isActive,
          finished: !!status.finished,
          home: {
            id: match.home ? match.home.id : null,
            name: match.home ? match.home.name : "Unknown",
            score:
              match.home && match.home.score !== undefined
                ? match.home.score
                : 0,
          },
          away: {
            id: match.away ? match.away.id : null,
            name: match.away ? match.away.name : "Unknown",
            score:
              match.away && match.away.score !== undefined
                ? match.away.score
                : 0,
          },
          minute: minute,
        };

        if (isActive) {
          liveList.push(matchObj);
        }
        allList.push(matchObj);
      });
    });

    return { liveList, allList };
  }

  useEffect(() => {
    fetchLiveScores();
    const timer = setInterval(fetchLiveScores, 120000);
    return () => clearInterval(timer);
  }, [fetchLiveScores]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Filter dataset
  const activeDataset = showOnlyLive ? matches : allTodayMatches;
  let filteredMatches = activeDataset;
  if (filter === "friendlies") {
    filteredMatches = activeDataset.filter((m) => m.isFriendly);
  } else if (filter === "competitive") {
    filteredMatches = activeDataset.filter((m) => !m.isFriendly);
  }

  // Group by league
  const groupedLeagues = {};
  filteredMatches.forEach((m) => {
    if (!groupedLeagues[m.leagueName]) {
      groupedLeagues[m.leagueName] = {
        name: m.leagueName,
        isFriendly: m.isFriendly,
        matches: [],
      };
    }
    groupedLeagues[m.leagueName].matches.push(m);
  });

  return (
    <div className="w-11/12 md:w-3/4 lg:w-2/3 mx-auto text-center font-sans py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button
          className="cardComponent smallEnlarge text-xs text-secondary px-3 py-1.5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          ← Portfolio
        </button>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="mt-2 mb-8">
        <div className="flex items-center justify-center space-x-2 text-3xl font-bold tracking-tight">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-light opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
          </span>
          <span>FotMob Score Siphon</span>
        </div>
        <p className="mt-3 text-sm text-justify leading-relaxed max-w-2xl mx-auto">
          A real-time live score tracker that directly siphons public API data
          from FotMob. Filter between competitive fixtures and friendly matches,
          view live match timelines, and stay updated automatically.
        </p>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-[0.5px] border-background-light rounded-xl bg-background-dark/30 shadow-md mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === "all"
                ? "bg-secondary text-white shadow-sm"
                : "cardComponent text-primary hover:text-secondary"
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setFilter("friendlies")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === "friendlies"
                ? "bg-secondary text-white shadow-sm"
                : "cardComponent text-primary hover:text-secondary"
            }`}
          >
            Friendlies
          </button>
          <button
            onClick={() => setFilter("competitive")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === "competitive"
                ? "bg-secondary text-white shadow-sm"
                : "cardComponent text-primary hover:text-secondary"
            }`}
          >
            Competitive
          </button>
        </div>

        <div className="flex items-center space-x-3 mx-auto md:mx-0">
          <button
            onClick={() => setShowOnlyLive(!showOnlyLive)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
              showOnlyLive
                ? "border border-secondary/50 bg-secondary/10 text-secondary"
                : "cardComponent text-primary"
            }`}
          >
            <SignalIcon className="h-3.5 w-3.5" />
            <span>{showOnlyLive ? "Live Only" : "All Today"}</span>
          </button>

          <button
            onClick={fetchLiveScores}
            disabled={loading}
            className="cardComponent smallEnlarge px-3 py-1.5 text-xs font-semibold text-secondary flex items-center space-x-1.5"
            title="Refresh Live Scores"
          >
            <ArrowPathIcon
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-primary/70 mb-6 px-2">
        <span>
          {error ? (
            <span className="text-red-500 font-semibold">{error}</span>
          ) : loading && !lastUpdated ? (
            "Loading live matches..."
          ) : (
            `Last updated at ${lastUpdated || "--"} • ${matches.length} live game(s)`
          )}
        </span>
        <span className="hidden sm:inline">Auto-updates every 2m</span>
      </div>

      {/* Matches List */}
      <div className="space-y-6 text-left">
        {Object.keys(groupedLeagues).length === 0 ? (
          <div className="border-[0.5px] border-background-light rounded-xl p-8 text-center bg-background-dark/20 shadow-sm">
            <h3 className="font-bold text-lg mb-2">No Matches Found</h3>
            <p className="text-sm text-primary/70">
              {showOnlyLive
                ? "There are currently no active live matches for the selected filter."
                : "No matches found for today under this filter."}
            </p>
            {showOnlyLive && allTodayMatches.length > 0 && (
              <button
                onClick={() => setShowOnlyLive(false)}
                className="mt-4 cardComponent smallEnlarge px-4 py-2 text-xs font-semibold text-secondary"
              >
                View All Today's Matches ({allTodayMatches.length})
              </button>
            )}
          </div>
        ) : (
          Object.values(groupedLeagues).map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="border-[0.5px] border-background-light rounded-xl overflow-hidden bg-background-dark/20 shadow-md"
            >
              {/* League Header */}
              <div className="px-4 py-3 border-b border-background-light/50 bg-background-dark/60 flex justify-between items-center">
                <span className="font-bold text-sm tracking-wide">
                  {group.name}
                </span>
                {group.isFriendly && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Friendly
                  </span>
                )}
              </div>

              {/* Matches Grid */}
              <div className="divide-y divide-background-light/30">
                {group.matches.map((m) => {
                  const homeLogo = m.home.id
                    ? `https://images.fotmob.com/image_resources/logo/teamlogo/${m.home.id}.png`
                    : null;
                  const awayLogo = m.away.id
                    ? `https://images.fotmob.com/image_resources/logo/teamlogo/${m.away.id}.png`
                    : null;

                  return (
                    <div
                      key={m.id}
                      className="p-4 flex items-center justify-between hover:bg-background-light/30 transition-colors gap-2"
                    >
                      {/* Home Team */}
                      <div className="flex-1 flex items-center justify-end space-x-3 text-right">
                        <span className="font-semibold text-sm line-clamp-1">
                          {m.home.name}
                        </span>
                        {homeLogo && (
                          <img
                            src={homeLogo}
                            alt=""
                            className="w-6 h-6 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                      </div>

                      {/* Score & Minute Badge */}
                      <div className="flex flex-col items-center justify-center px-4 min-w-[90px]">
                        <div className="font-mono text-base font-bold tracking-wider">
                          {m.home.score} - {m.away.score}
                        </div>
                        <div
                          className={`text-[11px] font-semibold mt-0.5 px-2 py-0.5 rounded ${
                            m.isActive
                              ? "bg-secondary/15 text-secondary animate-pulse font-bold"
                              : "text-primary/60"
                          }`}
                        >
                          {m.minute}
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex items-center justify-start space-x-3 text-left">
                        {awayLogo && (
                          <img
                            src={awayLogo}
                            alt=""
                            className="w-6 h-6 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <span className="font-semibold text-sm line-clamp-1">
                          {m.away.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-center space-x-8 mt-12 mb-8">
        <button
          className="cardComponent smallEnlarge text-sm text-secondary p-2 w-[150px]"
          onClick={() => navigate("/")}
        >
          Portfolio
        </button>
        <button
          className="cardComponent smallEnlarge text-sm text-secondary p-2 w-[150px]"
          onClick={scrollToTop}
        >
          Back to top
        </button>
      </div>
    </div>
  );
}

export default FotmobCompanion;
