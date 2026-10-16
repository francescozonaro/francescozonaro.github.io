import { describe, expect, it } from "vitest";
import {
  extractGoalEvents,
  getGoalSearchLinks,
  getRedditSearchUrl,
  getXSearchUrl,
} from "./goalEvents";

const HOME = 1;
const AWAY = 2;

function match(shots, header) {
  return {
    general: {
      homeTeam: { id: HOME },
      awayTeam: { id: AWAY },
      coverageLevel: "xG",
    },
    content: { shotmap: { shots } },
    header,
  };
}

function goalShot(overrides) {
  return {
    eventType: "Goal",
    teamId: HOME,
    playerName: "Player",
    min: 10,
    x: 95,
    y: 34,
    expectedGoals: 0.3,
    expectedGoalsOnTarget: 0.4,
    ...overrides,
  };
}

describe("extractGoalEvents (shotmap)", () => {
  it("ignores non-goal shots", () => {
    const goals = extractGoalEvents(
      match([goalShot({ eventType: "Miss" }), goalShot({})]),
    );
    expect(goals).toHaveLength(1);
  });

  it("sorts by time and keeps a running score", () => {
    const goals = extractGoalEvents(
      match([
        goalShot({ teamId: AWAY, min: 70 }),
        goalShot({ teamId: HOME, min: 20 }),
        goalShot({ teamId: HOME, min: 45, minAdded: 2 }),
      ]),
    );
    expect(goals.map((g) => [g.homeScore, g.awayScore])).toEqual([
      [1, 0],
      [2, 0],
      [2, 1],
    ]);
    expect(goals[1].timeStr).toBe("45+2");
    expect(goals[1].time).toBe(47);
  });

  it("credits an own goal to the other team and tags the scorer", () => {
    const [goal] = extractGoalEvents(
      match([goalShot({ teamId: HOME, isOwnGoal: true, playerName: "Rossi" })]),
    );
    expect(goal.isHomeGoal).toBe(false);
    expect(goal.teamId).toBe(AWAY);
    expect(goal.scorer).toBe("Rossi (OG)");
    expect(goal.isLongRange).toBe(false);
  });

  it("tags penalties and never flags them as great finishes", () => {
    const [goal] = extractGoalEvents(
      match([
        goalShot({
          situation: "Penalty",
          playerName: "Totti",
          expectedGoals: 0.02,
          expectedGoalsOnTarget: 0.9,
        }),
      ]),
    );
    expect(goal.scorer).toBe("Totti (P)");
    expect(goal.isPenalty).toBe(true);
    expect(goal.isGreatFinish).toBe(false);
  });

  it("flags a goal from 20m or more as long range", () => {
    const [near, far] = extractGoalEvents(
      match([goalShot({ min: 1, x: 95 }), goalShot({ min: 2, x: 80 })]),
    );
    expect(near.isLongRange).toBe(false);
    expect(far.isLongRange).toBe(true);
    expect(Math.round(far.distance)).toBe(25);
  });

  it("flags a great finish only for a big xGOT-xG gap on a low xG shot", () => {
    const goals = extractGoalEvents(
      match([
        goalShot({ min: 1, expectedGoals: 0.03, expectedGoalsOnTarget: 0.5 }),
        goalShot({ min: 2, expectedGoals: 0.2, expectedGoalsOnTarget: 0.9 }),
        goalShot({ min: 3, expectedGoals: 0.03, expectedGoalsOnTarget: 0.2 }),
      ]),
    );
    expect(goals.map((g) => g.isGreatFinish)).toEqual([true, false, false]);
  });

  it("drops a placeholder scorer name", () => {
    const [goal] = extractGoalEvents(match([goalShot({ playerName: "TBD" })]));
    expect(goal.scorer).toBeNull();
  });

  it("keeps the goal but no telemetry when shot coordinates are missing", () => {
    const [goal] = extractGoalEvents(
      match([goalShot({ x: undefined, y: undefined })]),
    );
    expect(goal.distance).toBeNull();
    expect(goal.isLongRange).toBe(false);
  });
});

describe("extractGoalEvents (header fallback)", () => {
  it("uses header goals when the shotmap is empty", () => {
    const goals = extractGoalEvents(
      match([], {
        events: {
          homeTeamGoals: {
            Rossi: [{ time: 30, isHome: true, player: { name: "Rossi" } }],
          },
          awayTeamGoals: {
            Smith: [
              {
                time: 90,
                overloadTime: 3,
                isHome: false,
                goalDescriptionKey: "penalty",
                player: { name: "Smith" },
              },
            ],
          },
        },
      }),
    );
    expect(goals.map((g) => g.scorer)).toEqual(["Rossi", "Smith (P)"]);
    expect(goals[1].timeStr).toBe("90+3");
    expect(goals[1].teamId).toBe(AWAY);
    expect(goals[1].distance).toBeNull();
  });

  it("returns no goals for an empty or missing response", () => {
    expect(extractGoalEvents(match([]))).toEqual([]);
    expect(extractGoalEvents(undefined)).toEqual([]);
  });
});

describe("search urls", () => {
  it("strips the (OG)/(P) tag and encodes the name", () => {
    expect(getRedditSearchUrl("José Mourinho (P)")).toContain(
      "q=Jos%C3%A9%20Mourinho&",
    );
    expect(getXSearchUrl("Rossi (OG)")).toBe(
      "https://x.com/search?q=Rossi&f=live",
    );
  });

  it("returns a harmless link when there is no scorer", () => {
    expect(getRedditSearchUrl(null)).toBe("#");
    expect(getXSearchUrl(null)).toBe("#");
  });

  it("builds reddit and x links for a scorer, and none without one", () => {
    expect(getGoalSearchLinks("Rossi (P)").map((l) => l.type)).toEqual([
      "reddit",
      "x",
    ]);
    expect(getGoalSearchLinks(null)).toEqual([]);
  });
});
