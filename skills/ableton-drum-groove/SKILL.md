---
name: Ableton Drum Groove
description: This skill should be used when the user asks to "make a drum beat", "write a drum pattern", "give me a boom-bap/one-drop/house/trap/breakbeat groove", "add drums", or wants a style-specific drum MIDI pattern generated in Ableton Live. Writes a drum MIDI clip onto a Drum Rack track using the General-MIDI map.
version: 0.1.0
---

# Ableton Drum Groove

Generate a style-specific drum pattern as a MIDI clip, mapped to the General-MIDI drum layout so it
plays any standard kit. Groove lives in the *feel* — swing, velocity dynamics, and tasteful ghost
notes — not just hit placement.

## When to use

Triggers: "make a beat", "[style] drum pattern/groove", "add drums". For a whole arrangement use
`ableton-genre-cover`; to humanize an existing drum clip use `ableton-humanize`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Create a `Drum Rack` track** with `makeTrack(..., ["Drum Rack"], [...], notes, len)`. The rack
   loads **empty** → tell the user to drag a kit (a style-appropriate one). The MIDI is kit-agnostic.
3. **Write the pattern** for the chosen style (table below), looping per bar.
4. **Add feel:**
   - **Swing** — push off-beat (and/or 16th) hats late by ~0.05–0.08 beats.
   - **Dynamics** — accent backbeats, soften ghost notes; vary velocities with `vary`.
   - **Laid-back vs on-top** — drag the snare a hair late (+0.02–0.03) for lofi/hip-hop, keep tight
     for house/techno.
   - **Fills** — every 4th/8th bar add a small snare/tom fill or a dropped beat.

## GM drum map & style templates

`KICK 36 · RIM 37 · SNARE 38 · CLAP 39 · CLOSED-HAT 42 · OPEN-HAT 46 · RIDE 51 · TOM 45/47/50`

| Style | Kick | Snare | Hats |
|---|---|---|---|
| Boom-bap (lofi) | 1, &-of-2/3 (syncopated) | 2 & 4 (dragged) | swung 8ths, soft |
| One-drop reggae | beat 3 (with snare) | beat 3 | open-hat on off-beats |
| Ska/rocksteady | 1 & 3 | 2 & 4 | closed on beats, open on "&" |
| House | four-on-the-floor | 2 & 4 (clap) | off-beat open-hat |
| Trap | syncopated, sparse | 3 (or 2 & 4) | rolling 16ths/triplets, rolls |
| Breakbeat | 1 & off-beats | 2 & 4 + ghosts | busy 16ths |

## Code pattern (boom-bap with swing)

```ts
function writeBoomBap(notes, bars) {
  for (let bar = 0; bar < bars; bar++) {
    const b = bar * 4;
    notes.push({ pitch: 36, startTime: b + 0,   duration: 0.3, velocity: vary(110) });
    notes.push({ pitch: 36, startTime: b + 2.5, duration: 0.3, velocity: vary(88) });   // syncopated kick
    notes.push({ pitch: 38, startTime: b + 1 + 0.03, duration: 0.3, velocity: vary(96) }); // dragged snare
    notes.push({ pitch: 38, startTime: b + 3 + 0.03, duration: 0.3, velocity: vary(96) });
    for (let j = 0; j < 8; j++)
      notes.push({ pitch: 42, startTime: b + j*0.5 + (j%2 ? 0.06 : 0), duration: 0.15, velocity: vary(j%2 ? 46 : 60) });
  }
}
```

## Limits

- Drum Rack is empty until a kit is dropped — say so every time.
- For sample-based drums (chop a break into a rack), see `ableton-sample-chopper`.

See `ableton-humanize`, `ableton-sample-chopper`, `ableton-genre-cover`.
