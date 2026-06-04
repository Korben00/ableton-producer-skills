---
name: Ableton Genre Cover
description: This skill should be used when the user asks to "make a [genre] version of [song]", "do a reggae/lofi/dub/ska cover of [theme]", "remix [song] in [style]", "turn [tune] into [genre]", or wants a full multi-track arrangement of a known melody/theme rendered in a target genre inside Ableton Live. Builds drums, bass, chords/skank, pad, and lead tracks with appropriate instruments and FX.
version: 0.1.0
---

# Ableton Genre Cover

Turn a known theme/song into a full, playable arrangement in a target genre, written directly into a
Live Set as separate MIDI tracks (drums, bass, harmony, lead, texture) with fitting instruments and
FX chains.

## When to use

Triggers: "make a reggae version of the X-Files theme", "lofi cover of Smells Like Teen Spirit",
"turn this into dub", "[song] but [genre]". For *reharmonizing an existing clip* use
`ableton-reharmonize`; for *just a bassline/melody/drums* use the dedicated skills.

## Process

1. **Use `ableton-live-runner`** for the build/run/kill workflow and the scaffold helpers. All code
   below goes in the scaffold's `compose()`.
2. **Get the source theme accurate.** The recognizable melody is what sells a cover — verify it (web
   search a transcription / sheet music / letter-note tab) rather than guessing. Capture: key,
   tempo, time signature, the main melodic motif (as `{t, pitch, dur}` events), and the chord/root
   progression. A wrong melody ruins the cover; spend the lookup.
3. **Decide the genre treatment** (ask the user 1–2 focused questions if ambiguous — e.g. sub-style,
   tempo). Map the original harmony onto the genre's rhythmic feel; keep the *identity markers*
   (signature riff, characteristic intervals, the turnaround) and change the *rhythmic clothing*.
4. **Write the tracks** with `makeTrack`, gated into sections with `inRanges`:
   - **Drums** (`Drum Rack`, empty → user drags a kit): the genre's groove (one-drop, boom-bap,
     four-on-the-floor…).
   - **Bass**: roots of the progression in the genre's rhythm (leave space on 2 & 4 for reggae; deep
     sub + syncopation for lofi).
   - **Harmony**: skank chops on the off-beats (reggae/ska), or sustained reharmonized chords (lofi).
   - **Lead**: the source melody, transposed to a fitting register.
   - Optional **pad / counter-line / arpeggio** for the identity hook.
5. **Pick instruments + FX per role** (see `ableton-fx-chain` and `ableton-tone-recipes`). End every
   instrument list with `"Drift"`.
6. **Build, run, diagnose** per `ableton-live-runner`. Remind the user to **drop a drum kit** and hit
   Play.

## Genre starter map

| Genre | Tempo | Drums | Harmony feel | Bass |
|---|---|---|---|---|
| Roots reggae / one-drop | 70–80 | kick+snare on beat 3 | organ skank on off-beats | round, syncopated, spacious |
| Ska / rocksteady | 95–110 | backbeat 2 & 4, open-hat off-beats | short guitar chop on every "&" | bouncy, walking |
| Dub | 65–75 | sparse, drops | rare, drenched in reverb/delay | HUGE, up front |
| Lofi hip-hop | 70–85 | boom-bap, swung hats, dragged snare | reharmonized 7/9 chords on Rhodes | deep sub, sparse |

## Code pattern (section gating + theme statement)

```ts
const THEME = [ { t: 0, p: 81, d: 3 }, /* the verified motif, clip-local beats */ ];
function writeLead(notes, startBars, beatsPerBar) {
  for (const startBar of startBars)
    for (const e of THEME)
      notes.push({ pitch: e.p, startTime: startBar * beatsPerBar + e.t, duration: e.d, velocity: vary(100) });
}
// Harmony as off-beat skank:
for (const off of [0.5, 1.5, 2.5, 3.5])
  chord.forEach(p => notes.push({ pitch: p, startTime: b + off, duration: 0.12, velocity: vary(90) }));
```

## Limits

- Drum Rack loads empty — the user must drag a kit. Note this every time.
- Keep each cover in its own Set (global tempo). Make re-runs idempotent via `clearPriorTracks` and
  per-cover `TRACK_NAMES`.

See `ableton-reharmonize`, `ableton-bassline`, `ableton-drum-groove`, `ableton-fx-chain`.
