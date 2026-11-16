import { useEffect, useRef, useState } from "react";
import { CRAB_FRAMES } from "./crabSprite";

const P = 2; // dot size in px (16x16 dots = a 32px crab)
const OPACITY = 1;
const SPEED = 260; // scuttle speed, px/s
const STRIDE = 16; // px travelled per leg-frame swap
const CLAW_MS = 250; // the claws change state on this beat
const CLAW_CYCLE = [0, 1, 0, 2]; // original, open, original, closed
// desktop only: a wide viewport and a precise pointer that can hover (not touch, not tablets)
const DESKTOP = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const REST = 40; // the crab stops this far from the cursor
const SHADE = 0.3; // how far the light/dark tones move from the accent towards white/black

// Cell colours by kind: mid, light, dark, eye. The body is the theme's accent colour (the
// mid tone is the accent itself), so it follows light/dark. The eyes use the text colour,
// so they are dark on the light theme and light on the dark one.
function crabColors() {
  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-secondary")
    .trim()
    .split(/\s+/)
    .map(Number);
  const mix = (to) => accent.map((v) => Math.round(v + (to - v) * SHADE));
  const rgb = (c) => `rgb(${c.join(",")})`;
  return [
    rgb(accent),
    rgb(mix(255)),
    rgb(mix(0)),
    getComputedStyle(document.body).color,
  ];
}

function useDesktop() {
  const [on, setOn] = useState(() => window.matchMedia(DESKTOP).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const update = () => setOn(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return on;
}

// A tiny pixel crab that scuttles to the cursor, claws snapping. It never turns: it keeps
// facing up and walks in a straight line in any direction, like a real crab.
// Full-viewport, click-through canvas; nothing shows until the mouse first moves, so touch
// devices never see it. Desktop only, and off for reduced-motion users.
export function Crab() {
  const ref = useRef(null);
  const desktop = useDesktop();

  useEffect(() => {
    if (
      !desktop ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let pos = null; // position (viewport px)
    let target = null; // latest mouse position
    let travelled = 0; // drives the leg frames
    let moving = false;
    let last = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = OPACITY;
      const colors = crabColors();
      const ox = Math.round(pos.x / P);
      const oy = Math.round(pos.y / P);
      // walking frames while it moves; the original legs once it has stopped
      const legs = moving ? Math.floor(travelled / STRIDE) % 2 : 2;
      const claws =
        CLAW_CYCLE[Math.floor(performance.now() / CLAW_MS) % CLAW_CYCLE.length];
      const frame = CRAB_FRAMES[legs][claws];
      for (const [cx, cy, kind] of frame) {
        ctx.fillStyle = colors[kind];
        ctx.fillRect((ox + cx) * P, (oy + cy) * P, P, P);
      }
    };

    const tick = (now) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const d = Math.hypot(dx, dy);
      moving = d > REST + 1;
      if (moving) {
        // straight line to the cursor, in any direction
        const step = Math.min(SPEED * dt, d - REST);
        pos.x += (dx / d) * step;
        pos.y += (dy / d) * step;
        travelled += step;
      }
      draw();
      // sleep once it has arrived; the next mouse move wakes it
      if (moving) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      target = { x: e.clientX, y: e.clientY };
      if (!pos) pos = { x: target.x, y: h + 30 }; // scuttles in from the bottom edge
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pos) draw();
    };

    // while it stands still the animation loop sleeps, but the claws keep snapping
    const idle = setInterval(() => {
      if (pos && !raf) draw();
    }, CLAW_MS);

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      clearInterval(idle);
    };
  }, [desktop]);

  if (!desktop) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-screen w-screen"
    />
  );
}
