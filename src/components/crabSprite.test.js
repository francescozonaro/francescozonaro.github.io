import { describe, expect, it } from "vitest";
import { CRAB_FRAMES } from "./crabSprite";

const key = (cells) => cells.map(([x, y, k]) => `${x},${y},${k}`).sort().join("|");
const all = CRAB_FRAMES.flat();
const REST = CRAB_FRAMES[2][0]; // original legs, original claws = the sprite as drawn
const CLAW_ROWS = (y) => y <= -6; // open/closed only touch the first three rows
const LEG_ROWS = (y) => y >= 0; // legs start at the 9th row

describe("CRAB_FRAMES", () => {
  it("has 3 leg frames x 3 claw states of unique integer cells", () => {
    expect(CRAB_FRAMES).toHaveLength(3);
    expect(CRAB_FRAMES.every((f) => f.length === 3)).toBe(true);
    for (const cells of all) {
      expect(new Set(cells.map(([x, y]) => `${x},${y}`)).size).toBe(cells.length);
      expect(cells.every(([x, y]) => Number.isInteger(x) && Number.isInteger(y))).toBe(true);
    }
  });

  it("keeps the original sprite as the resting frame: 144 dots, 4 of them eyes", () => {
    expect(REST).toHaveLength(144);
    expect(REST.filter(([, , k]) => k === 3)).toHaveLength(4);
    expect(new Set(REST.map(([, , k]) => k))).toEqual(new Set([0, 1, 2, 3]));
  });

  it("is left-right symmetric in every frame", () => {
    for (const cells of all) {
      expect(key(cells.map(([x, y, k]) => [-1 - x, y, k]))).toBe(key(cells));
    }
  });

  it("claw states change only the claw rows", () => {
    for (const [orig, open, closed] of CRAB_FRAMES) {
      expect(key(open)).not.toBe(key(orig));
      expect(key(closed)).not.toBe(key(orig));
      const rest = (cells) => key(cells.filter(([, y]) => !CLAW_ROWS(y)));
      expect(rest(open)).toBe(rest(orig));
      expect(rest(closed)).toBe(rest(orig));
    }
  });

  it("walking frames change only the legs, and differ from each other and from rest", () => {
    for (let claw = 0; claw < 3; claw++) {
      const [a, b, rest] = CRAB_FRAMES.map((f) => f[claw]);
      expect(key(a)).not.toBe(key(b));
      expect(key(a)).not.toBe(key(rest));
      const upper = (cells) => key(cells.filter(([, y]) => !LEG_ROWS(y)));
      expect(upper(a)).toBe(upper(b));
      expect(upper(a)).toBe(upper(rest));
    }
  });
});
