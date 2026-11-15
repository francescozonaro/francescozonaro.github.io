import { describe, expect, it } from "vitest";
import {
  extractGoalEvents,
  getGoalSearchLinks,
  getRedditSearchUrl,
  getXSearchUrl,
  isDetailsComplete,
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

  it("sorts goals by time", () => {
    const goals = extractGoalEvents(
      match([
        goalShot({ min: 70 }),
        goalShot({ min: 20 }),
        goalShot({ min: 45, minAdded: 2 }),
      ]),
    );
    expect(goals.map((g) => g.timeStr)).toEqual(["20", "45+2", "70"]);
  });

  it("puts first-half stoppage time before the second half starts", () => {
    const goals = extractGoalEvents(
      match([goalShot({ min: 46 }), goalShot({ min: 45, minAdded: 3 })]),
    );
    expect(goals.map((g) => g.timeStr)).toEqual(["45+3", "46"]);
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

describe("isDetailsComplete", () => {
  const full = { scorer: "Rossi", x: 90, y: 30 };

  it("is complete with a scored, located event per goal", () => {
    expect(isDetailsComplete([full], 1, "xG")).toBe(true);
  });

  it("is incomplete while FotMob has fewer events than goals", () => {
    expect(isDetailsComplete([full], 2, "xG")).toBe(false);
  });

  it("is incomplete while a scorer name is missing", () => {
    expect(isDetailsComplete([{ ...full, scorer: null }], 1, "xG")).toBe(false);
  });

  it("needs coordinates only when coverage is xG", () => {
    const noCoords = { scorer: "Rossi", x: null, y: null };
    expect(isDetailsComplete([noCoords], 1, "xG")).toBe(false);
    expect(isDetailsComplete([noCoords], 1, "basic")).toBe(true);
    expect(isDetailsComplete([noCoords], 1, undefined)).toBe(true);
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

  it("builds reddit and x links for a scorer, and none without one", () => {
    expect(getGoalSearchLinks("Rossi (P)").map((l) => l.type)).toEqual([
      "reddit",
      "x",
    ]);
    expect(getGoalSearchLinks(null)).toEqual([]);
  });
});
