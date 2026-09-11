import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { CollapsibleCard } from "../components/CollapsibleCard";
import { usePageIcon } from "../hooks/usePageIcon";
import { getAppIcon } from "../config/appIcons";

const TIME_WINDOWS = [
  { label: "24h", hours: 24 },
  { label: "All", hours: null },
];

const SHOW_MODES = [
  { label: "All odds", onlyInRange: false },
  { label: "In-range only", onlyInRange: true },
];

const STEP = 0.05;
const DNB_MARGIN = 1.05;
const ONE_X_TWO_LABELS = { 1: "Home", X: "Draw", 2: "Away" };

const round = (n) => Math.round(n * 100) / 100;

function marketLabel(m) {
  if (m.market === "Match goals") return `O/U ${m.line}`;
  if (m.market === "Both teams to score") return "BTTS";
  return m.market;
}

function selectionLabel(m, selectionName) {
  if (m.market === "1X2" || m.market === "DNB")
    return ONE_X_TWO_LABELS[selectionName] ?? selectionName;
  return selectionName;
}

function toggleClass(active) {
  return `iconButton whitespace-nowrap justify-center ${active ? "accentButton" : "cardComponent"}`;
}

function Stepper({ value, onChange }) {
  return (
    <div className="inputField inline-flex items-stretch overflow-hidden p-0">
      <button
        onClick={() => onChange(round(value - STEP))}
        className="px-2 text-xs font-semibold text-primary/70 hover:text-primary"
      >
        -
      </button>
      <input
        type="number"
        step={STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 border-x border-background-dark bg-transparent px-1 py-1.5 text-center text-xs font-semibold text-primary focus:outline-none"
      />
      <button
        onClick={() => onChange(round(value + STEP))}
        className="px-2 text-xs font-semibold text-primary/70 hover:text-primary"
      >
        +
      </button>
    </div>
  );
}

export default function OddsScraper() {
  usePageIcon(getAppIcon("odds-scraper"));

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [min, setMin] = useState(1.5);
  const [max, setMax] = useState(99);
  const [onlyInRange, setOnlyInRange] = useState(true);
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [windowHours, setWindowHours] = useState(24);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  useEffect(() => {
    fetch("/data/odds-scraper/odds.json")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  function toggleCollapseGroup(name) {
    setCollapsedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  const competitions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.matches.map((m) => m.competition))).sort();
  }, [data]);

  const inRange = (odds) => odds >= min && odds <= max;

  const visibleMatches = useMemo(() => {
    if (!data) return [];
    let matches = data.matches;

    // Client-side "Draw No Bet" market, derived from each match's 1X2 odds.
    matches = matches.map((match) => {
      const oneXTwo = match.markets.find((mk) => mk.market === "1X2");
      const homeOdds = oneXTwo?.selections.find((s) => s.name === "1")?.odds;
      const awayOdds = oneXTwo?.selections.find((s) => s.name === "2")?.odds;
      if (!homeOdds || !awayOdds) return match;

      const dnbMarket = {
        market: "DNB",
        line: null,
        selections: [
          { name: "1", odds: round((1 + homeOdds / awayOdds) / DNB_MARGIN) },
          { name: "2", odds: round((1 + awayOdds / homeOdds) / DNB_MARGIN) },
        ],
      };
      return { ...match, markets: [...match.markets, dnbMarket] };
    });

    if (windowHours !== null) {
      const cutoff = Date.now() + windowHours * 3600_000;
      matches = matches.filter((m) => new Date(m.kickoff).getTime() <= cutoff);
    }
    if (competitionFilter !== "all") {
      matches = matches.filter((m) => m.competition === competitionFilter);
    }
    if (onlyInRange) {
      matches = matches.filter((m) =>
        m.markets.some((mk) => mk.selections.some((s) => inRange(s.odds))),
      );
    }
    return [...matches].sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  }, [data, onlyInRange, competitionFilter, windowHours, min, max]);

  const groupedCompetitions = useMemo(() => {
    const groups = {};
    visibleMatches.forEach((m) => {
      if (!groups[m.competition]) {
        groups[m.competition] = { name: m.competition, matches: [] };
      }
      groups[m.competition].matches.push(m);
    });
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [visibleMatches]);

  return (
    <div className="w-11/12 xl:w-5/6 mx-auto font-sans py-6 h-screen flex flex-col overflow-hidden">
      <PageHeader className="mb-16">
        <span>Odds Scraper</span>
      </PageHeader>

      {error && (
        <div className="cardComponent p-6 text-center flex-shrink-0">
          <p className="font-medium text-secondary">Couldn't load odds data</p>
          <p className="mt-2 text-xs text-primary/50">{error}</p>
        </div>
      )}

      {!error && (
        <>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 flex-shrink-0">
            <div>
              <div className="flex items-center gap-3">
                <Stepper value={min} onChange={setMin} />
                <span className="text-xs text-primary/40">to</span>
                <Stepper value={max} onChange={setMax} />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {TIME_WINDOWS.map((w) => (
                <button
                  key={w.label}
                  onClick={() => setWindowHours(w.hours)}
                  className={toggleClass(windowHours === w.hours)}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {SHOW_MODES.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setOnlyInRange(m.onlyInRange)}
                  className={toggleClass(onlyInRange === m.onlyInRange)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <select
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
              className="inputField px-3 py-1.5 text-xs"
            >
              <option value="all">All competitions</option>
              {competitions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {data && (
              <span className="text-xs text-primary/40 sm:ml-auto self-center">
                {data.source} &middot;{" "}
                {new Date(data.generatedAt).toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-4 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-1">
            {!data && (
              <div className="cardComponent p-8 text-center text-xs text-primary/40">
                Loading...
              </div>
            )}

            {data && groupedCompetitions.length === 0 && (
              <CollapsibleCard
                title="No matches found"
                isCollapsed={false}
                onToggleCollapse={() => {}}
              >
                <div className="p-8 text-center">
                  <p className="text-[11px] text-primary/50 font-medium">
                    No matches under the current filters.
                  </p>
                </div>
              </CollapsibleCard>
            )}

            {groupedCompetitions.map((group) => {
              const isCollapsed = !!collapsedGroups[group.name];

              return (
                <CollapsibleCard
                  key={group.name}
                  title={group.name}
                  badge={
                    <span className="text-xs text-primary/50 font-mono">
                      ({group.matches.length})
                    </span>
                  }
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleCollapseGroup(group.name)}
                >
                  <div className="divide-y divide-background-light/30">
                    {group.matches.map((match) => {
                      const rows = onlyInRange
                        ? match.markets.filter((mk) =>
                            mk.selections.some((s) => inRange(s.odds)),
                          )
                        : match.markets;

                      return (
                        <div
                          key={match.id}
                          className="p-3.5 hover:bg-background-darker transition-colors flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-xs sm:text-sm truncate">
                              {match.homeTeam} vs {match.awayTeam}
                            </span>
                            <span className="text-[9px] sm:text-[11px] font-semibold px-1 sm:px-2 py-0.5 rounded font-mono text-primary/60 bg-background-dark/40 whitespace-nowrap">
                              {new Date(match.kickoff).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {rows.map((mk, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="w-16 shrink-0 text-[11px] text-primary/40">
                                  {marketLabel(mk)}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {mk.selections.map((s, j) => (
                                    <span
                                      key={j}
                                      className={
                                        "inline-flex justify-center min-w-[64px] rounded px-1.5 py-0.5 text-xs " +
                                        (inRange(s.odds)
                                          ? "bg-secondary/15 text-secondary font-semibold"
                                          : "bg-background-dark/40 text-primary/60")
                                      }
                                    >
                                      {selectionLabel(mk, s.name)} {s.odds}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
