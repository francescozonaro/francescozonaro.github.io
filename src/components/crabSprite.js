// Pixel crab, 16x16 dots, facing "up". BASE is the sprite exactly as drawn (the resting pose);
// the claw and leg variants below are small edits of it, so the animation always returns to
// the original.
//   L = light   M = mid   D = dark   E = eye (drawn in the theme's text colour)   . = empty
const BASE = [
  "..LMD......DML..",
  ".LMD........DML.",
  "LLM.M......M.MLL",
  "LLDMD......DMDLL",
  "MMDD..E..E..DDMM",
  "DD....E..E....DD",
  ".DM.DMMLLMMD.MD.",
  "..DDMLMLLMLMDD..",
  "M..DMLMLLMLMD..M",
  ".DMDMLLLLLLMDMD.",
  "...DDMLLLLMDD...",
  ".DMMDDMMMMDDMMD.",
  "M...MDDDDDDM...M",
  "..DM.MMMMMM.MD..",
  ".M............M.",
  ".D............D.",
];
const SIZE = 16;
const KINDS = { M: 0, L: 1, D: 2, E: 3 }; // mid, light, dark, eye

// Edits are given for the left half as [row, col, tone]; tone "." removes the cell. The
// right half is the mirror image, so the crab stays symmetric.
const CLAW = {
  // prong tips apart: shorten the upper prong
  open: [[0, 4, "."], [1, 3, "."]],
  // prong tips together: fill the gap between them
  closed: [[1, 4, "D"], [2, 3, "M"]],
};

// Each leg: its original pose (a) and a stepped pose (b). In the two walking frames
// neighbouring legs are in opposite poses; at rest every leg is in its original pose.
const LEGS = [
  { a: [[8, 0, "M"], [9, 1, "D"], [9, 2, "M"]], b: [[9, 0, "M"], [9, 1, "D"], [9, 2, "M"]] },
  {
    a: [[11, 1, "D"], [11, 2, "M"], [11, 3, "M"], [12, 0, "M"]],
    b: [[11, 0, "M"], [11, 1, "D"], [11, 2, "M"], [11, 3, "M"]],
  },
  {
    a: [[13, 2, "D"], [13, 3, "M"], [14, 1, "M"], [15, 1, "D"]],
    b: [[13, 2, "D"], [13, 3, "M"], [14, 2, "M"], [15, 2, "D"]],
  },
];

// leg frames: 0 and 1 are the two walking frames, 2 is the resting pose
const legEdits = (frame) =>
  frame === 2
    ? []
    : LEGS.flatMap((leg, i) => {
        if ((i + frame) % 2 === 0) return []; // this leg stays in its original pose
        const gone = leg.a.filter(([r, c]) => !leg.b.some(([r2, c2]) => r === r2 && c === c2));
        return [...gone.map(([r, c]) => [r, c, "."]), ...leg.b];
      });

function build(edits) {
  const grid = BASE.map((row) => [...row]);
  for (const [r, c, ch] of edits) {
    grid[r][c] = ch;
    grid[r][SIZE - 1 - c] = ch;
  }
  const cells = [];
  grid.forEach((row, r) =>
    row.forEach((ch, c) => {
      if (ch !== ".") cells.push([c - SIZE / 2, r - SIZE / 2, KINDS[ch]]); // origin = middle
    }),
  );
  return cells;
}

// claw states: 0 = original, 1 = open, 2 = closed
const CLAW_STATES = [[], CLAW.open, CLAW.closed];

// [x, y, kind] cells relative to the middle: CRAB_FRAMES[legFrame][clawState]
export const CRAB_FRAMES = [0, 1, 2].map((leg) =>
  CLAW_STATES.map((claw) => build([...claw, ...legEdits(leg)])),
);
