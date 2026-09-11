"""
Pulls upcoming fixtures + Bet365 odds (1X2, Both Teams to Score, Match Goals O/U)
from SofaScore's internal API and writes raw JSON to public/data/odds-scraper/odds.json.

Run with:  uv run --with curl_cffi python3 src/odds-scraper/scripts/fetch_odds.py

SofaScore's edge blocks plain HTTP clients (403) unless the TLS handshake looks
like a real browser's, hence curl_cffi's impersonate="chrome120". This is not
scraping HTML - it's calling their own internal JSON API directly.
"""

import json
import random
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

from curl_cffi import requests

BASE = "https://api.sofascore.com/api/v1"
HEADERS = {"Referer": "https://www.sofascore.com/"}
BET365_PROVIDER_ID = 1
DAYS_AHEAD = 2  # only keep fixtures kicking off within this many days

# Deliberately conservative: a 404 just means "no data for this query" (normal,
# no backoff needed), but a 403 means the edge is pushing back - treat that as
# a real signal and back off hard rather than keep hammering at the same pace.
REQUEST_DELAY_RANGE = (3.0, 4.5)  # seconds between calls, with jitter
MAX_RETRIES = 3
BACKOFF_BASE_SECONDS = 20  # 20s, then 40s, then 80s on repeated 403s

# (display name, SofaScore uniqueTournament id) - resolved via their search API.
COMPETITIONS = [
    ("Premier League", 17),
    ("LaLiga", 8),
    ("Serie A", 23),
    ("Serie B", 53),
    ("Serie C Girone A", 11445),
    ("Serie C Playoffs", 11452),
    ("Serie C Play-out", 13579),
    ("Coppa Italia Serie C", 824),
    ("Supercoppa Serie C", 884),
    ("Bundesliga", 35),
    ("Ligue 1", 34),
    ("MLS", 242),
    ("UEFA Champions League", 7),
    ("UEFA Europa League", 679),
    ("UEFA Conference League", 17015),
    ("FA Cup", 19),
    ("Copa del Rey", 329),
    ("DFB Pokal", 217),
    ("Coppa Italia", 328),
    ("Coupe de France", 335),
    ("Championship", 18),
    ("EFL Cup", 21),  # a.k.a. Carabao Cup
]

OUTPUT_PATH = Path(__file__).resolve().parents[3] / "public" / "data" / "odds-scraper" / "odds.json"


def to_decimal(fractional: str) -> float | None:
    try:
        n, d = fractional.split("/")
        return round(1 + int(n) / int(d), 2)
    except Exception:
        return None


def get(url: str) -> dict | None:
    for attempt in range(MAX_RETRIES + 1):
        try:
            r = requests.get(url, impersonate="chrome120", headers=HEADERS, timeout=15)
        except requests.exceptions.RequestException as e:
            # network-level failure (timeout, connection reset, DNS, ...) - back off and retry
            if attempt < MAX_RETRIES:
                wait = BACKOFF_BASE_SECONDS * (2**attempt)
                print(f"  [{type(e).__name__}] backing off {wait}s before retry ({attempt + 1}/{MAX_RETRIES})...")
                time.sleep(wait)
                continue
            print(f"  [{type(e).__name__}] giving up on {url} after {MAX_RETRIES} retries")
            return None

        if r.status_code == 200:
            time.sleep(random.uniform(*REQUEST_DELAY_RANGE))
            try:
                return r.json()
            except Exception:
                return None

        if r.status_code == 404:
            # normal "no data here", not a block - short pace, no backoff
            time.sleep(random.uniform(*REQUEST_DELAY_RANGE))
            return None

        # anything else (403, 429, 5xx, ...) - treat as pushback and back off hard
        if attempt < MAX_RETRIES:
            wait = BACKOFF_BASE_SECONDS * (2**attempt)
            print(f"  [{r.status_code}] backing off {wait}s before retry ({attempt + 1}/{MAX_RETRIES})...")
            time.sleep(wait)
        else:
            print(f"  [{r.status_code}] giving up on {url} after {MAX_RETRIES} retries")
            time.sleep(random.uniform(*REQUEST_DELAY_RANGE))
            return None
    return None


def latest_season_id(tournament_id: int) -> int | None:
    data = get(f"{BASE}/unique-tournament/{tournament_id}/seasons")
    if not data or not data.get("seasons"):
        return None
    return data["seasons"][0]["id"]


def upcoming_events(tournament_id: int, season_id: int, cutoff: datetime) -> list[dict]:
    data = get(f"{BASE}/unique-tournament/{tournament_id}/season/{season_id}/events/next/0")
    if not data:
        return []
    events = data.get("events", [])
    kept = []
    for e in events:
        ts = e.get("startTimestamp")
        if ts is None:
            continue
        kickoff = datetime.fromtimestamp(ts, tz=timezone.utc)
        if kickoff <= cutoff:
            kept.append(e)
    return kept


def extract_markets(odds_data: dict) -> list[dict]:
    """Keep only 1X2, Both teams to score, Match goals O/U 2.5 - full-time, pre-match."""
    wanted_groups = {"1X2", "Both teams to score", "Match goals"}
    by_key: dict[tuple, dict] = {}

    for m in odds_data.get("markets", []):
        if m.get("isLive"):
            continue
        if m.get("marketPeriod") != "Full-time":
            continue
        group = m.get("marketGroup")
        if group not in wanted_groups:
            continue
        if group == "Match goals" and m.get("choiceGroup") != "2.5":
            continue
        key = (group, m.get("choiceGroup"))
        by_key[key] = m  # last one wins, matches SofaScore's own de-dupe behaviour

    markets = []
    for (group, line), m in sorted(by_key.items(), key=lambda kv: (kv[0][0], kv[0][1] or "")):
        selections = []
        for c in m.get("choices", []):
            dec = to_decimal(c.get("fractionalValue", ""))
            if dec is not None:
                selections.append({"name": c.get("name"), "odds": dec})
        if selections:
            markets.append({"market": group, "line": line, "selections": selections})
    return markets


def fetch_odds_for_event(event_id: int) -> list[dict]:
    data = get(f"{BASE}/event/{event_id}/odds/{BET365_PROVIDER_ID}/all")
    if not data:
        return []
    return extract_markets(data)


def main() -> None:
    cutoff = datetime.now(timezone.utc) + timedelta(days=DAYS_AHEAD)
    all_matches = []

    for name, tid in COMPETITIONS:
        print(f"[{name}] resolving season...")
        season_id = latest_season_id(tid)
        if season_id is None:
            print(f"[{name}] no season found, skipping")
            continue

        events = upcoming_events(tid, season_id, cutoff)
        print(f"[{name}] {len(events)} fixtures within {DAYS_AHEAD} days")

        for e in events:
            try:
                eid = e["id"]
                markets = fetch_odds_for_event(eid)
                if not markets:
                    continue
                all_matches.append(
                    {
                        "id": eid,
                        "competition": name,
                        "homeTeam": e["homeTeam"]["name"],
                        "awayTeam": e["awayTeam"]["name"],
                        "kickoff": datetime.fromtimestamp(e["startTimestamp"], tz=timezone.utc).isoformat(),
                        "markets": markets,
                    }
                )
            except (KeyError, TypeError) as err:
                print(f"[{name}] skipping malformed event: {err}")
                continue

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "SofaScore (Bet365)",
        "matches": all_matches,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(output, indent=2))
    print(f"\nWrote {len(all_matches)} matches to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
