---
name: Ableton Bassline
description: This skill should be used when the user asks to "write a bassline", "make a bass line from these chords", "give me a reggae/funk/house/lofi bass", "add bass to this progression", or wants an idiomatic bassline generated over a chord progression in Ableton Live. Writes a bass MIDI track that follows the harmony in a chosen style.
version: 0.1.0
---

# Ableton Bassline

Generate an idiomatic bassline that follows a chord progression, written as a MIDI track in the Live
Set. The bassline is the soul of most genres — its *rhythm and space* matter as much as its notes.

## When to use

Triggers: "write a bassline", "bass from these chords", "[genre] bass". For full arrangements use
`ableton-genre-cover`; for the chords themselves use `ableton-reharmonize`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Get the progression** — from a clip (read `clip.notes`, take the lowest/root per bar) or from
   text. Note the key (`song.rootNote`).
3. **Pick the style feel** (the defining choice). Apply its rhythm template, transposing the root per
   chord. Use low register (root around MIDI 28–40) and a fallback instrument list ending in `Drift`
   (`["Operator","Drift"]` — note `"Bass"` does not insert).
4. **Add motion tastefully** — passing tones into the next root, octave pops, ghost notes. Keep the
   genre's characteristic *rests*.
5. **Write the track** and shape tone with `ableton-tone-recipes`/`ableton-fx-chain` (Auto Filter to
   round, Compressor + Saturator to make it audible on small speakers).

## Style rhythm templates (relative beats within a bar)

| Style | Pattern (R = root, 5 = fifth, 8 = octave, · = rest) |
|---|---|
| Reggae one-drop | `R · · 5 R · 8 ·` (leave beats 2 & 4 open — the breath) |
| Rocksteady/ska | `R · R(&) 5(&) R · 8(&) ·` (bouncy, syncopated) |
| House | steady 8ths on root with off-beat octaves |
| Funk | syncopated 16ths, root + ♭7 + octave, ghost notes |
| Lofi | `R(1, long) · · · R(2.5) · · ·` (deep, sparse) |

## Code pattern

```ts
const ROOTS = [/* MIDI root per bar, e.g. */ 33, 33, 32, 37];
function writeBass(notes, bars, bpb = 4) {
  for (let bar = 0; bar < bars; bar++) {
    const r = ROOTS[bar % ROOTS.length], b = bar * bpb;
    notes.push({ pitch: r,    startTime: b + 0,   duration: 0.45, velocity: vary(108, 3) });
    notes.push({ pitch: r,    startTime: b + 1.5, duration: 0.25, velocity: vary(90) });
    notes.push({ pitch: r,    startTime: b + 3,   duration: 0.40, velocity: vary(102) });
    notes.push({ pitch: r+12, startTime: b + 3.5, duration: 0.25, velocity: vary(84) }); // octave lift
  }
}
```

## Limits

- `"Bass"` device fails to insert; use `Operator`/`Drift` + `Auto Filter` to round the tone.
- Keep it deep but out of the kick's way — leave space (sparse beats out-groove busy ones).

See `ableton-reharmonize`, `ableton-tone-recipes`, `ableton-drum-groove`.
