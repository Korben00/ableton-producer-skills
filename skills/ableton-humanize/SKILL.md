---
name: Ableton Humanize
description: This skill should be used when the user asks to "humanize this MIDI", "add swing", "apply a groove", "make it less robotic/quantized", "loosen the timing", or "shape the velocities" of an existing MIDI clip in Ableton Live. Reads a clip's notes and rewrites them with micro-timing, swing, and velocity dynamics.
version: 0.1.0
---

# Ableton Humanize

Make stiff, grid-locked MIDI feel played-by-a-human by reading an existing clip and rewriting its
notes with micro-timing offsets, swing, and velocity dynamics. The "lazy" lofi feel and a tight funk
pocket are both just controlled deviations from the grid.

## When to use

Triggers: "humanize", "add swing/groove", "less robotic", "shape velocities". To generate new parts
use the composition/groove skills; this one *transforms an existing clip*.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Read the target clip's notes** (`clip.notes`). Operate in place (rewrite the same clip) or write
   a humanized copy — confirm which with the user.
3. **Apply transformations** (let the user pick intensity; keep it subtle by default):
   - **Timing jitter** — nudge each note `startTime` by a small random offset (±0.005–0.02 beats).
   - **Swing** — push notes on off-beat subdivisions later (8th swing: +0.04–0.08; 16th swing
     smaller). Decide the subdivision from the note grid.
   - **Feel offset** — a constant lean: drag the whole part slightly late (laid-back) or early (on
     top). Drums often want snare-late, kick-on.
   - **Velocity dynamics** — accent strong beats, soften off-beats/ghosts; add ±gentle variation;
     optionally a slow swell across a phrase.
   - **Duration variation** — vary note lengths slightly (legato vs staccato) for realism.
4. **Clamp** — keep `startTime >= 0`, velocities in 1–127, and don't let jitter create flams unless
   wanted. Write the array back with `clip.notes = newNotes`.

## Code pattern

```ts
const rand = (a) => (Math.random() * 2 - 1) * a;
function humanize(notes, { jitter = 0.012, swing = 0.06, velVar = 6, drag = 0 } = {}) {
  return notes.map(n => {
    const isOff = Math.round((n.startTime % 1) * 2) % 2 === 1; // on an 8th off-beat?
    return {
      ...n,
      startTime: Math.max(0, n.startTime + rand(jitter) + drag + (isOff ? swing : 0)),
      velocity: Math.max(1, Math.min(127, Math.round((n.velocity ?? 90) + rand(velVar)))),
    };
  });
}
```

## Limits

- This shifts note *events*, not Ableton's Groove Pool (no groove-template API). For consistent swing
  across many clips, consider baking the same offsets.
- Over-humanizing muddies tight genres — default to subtle, increase on request.

See `ableton-drum-groove`, `ableton-topline`.
