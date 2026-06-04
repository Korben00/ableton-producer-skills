---
name: Ableton Topline
description: This skill should be used when the user asks to "write a melody", "give me a topline", "add a lead over these chords", "write a vocal melody", "make a hook/motif over this progression", or wants a singable melodic line generated above an existing chord progression in Ableton Live. Writes a lead/topline MIDI track that fits the harmony.
version: 0.1.0
---

# Ableton Topline

Generate a singable melody / topline over an existing chord progression, written as a lead MIDI
track. Good toplines are mostly chord tones on strong beats, with stepwise motion and tasteful
rests between phrases.

## When to use

Triggers: "write a melody/topline/hook over these chords", "add a lead". For an existing theme's
melody use `ableton-genre-cover`; for free natural-language generation use `ableton-describe-to-midi`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Get the harmony + key** — read the chord clip (`clip.notes`) or text; read `song.rootNote` /
   `song.scaleIntervals` to stay in scale.
3. **Build the melody with these principles:**
   - **Anchor on chord tones** on beats 1 & 3; use scale tones / passing tones on weak beats.
   - **Stepwise motion** mostly; reserve leaps for emphasis (and resolve them by step).
   - **Phrase with rests** — 2- or 4-bar phrases that breathe; call-and-response.
   - **Motif + variation** — state a short motif, then repeat it transposed/rhythmically varied.
   - **Contour & climax** — build to one high note, then resolve down to a stable tone.
   - **Register** — vocal/lead range ~MIDI 60–84.
4. **Write the track** (`["Wavetable","Operator","Drift"]` + `[["Echo"],["Reverb"]]` for an airy
   lead) and humanize velocities with `vary`.

## Code pattern (motif + transposed answer)

```ts
const MOTIF = [ {t:0,p:0,d:1}, {t:1,p:2,d:1}, {t:2,p:4,d:2} ]; // scale-degree offsets
function deg(rootMidi, scale, n) {                 // n-th scale degree (with octave wrap)
  return rootMidi + scale[((n % scale.length) + scale.length) % scale.length] + 12 * Math.floor(n / scale.length);
}
function writeTopline(notes, rootMidi, scale, phrases) {  // phrases = [{bar, shift}]
  for (const ph of phrases)
    for (const e of MOTIF)
      notes.push({ pitch: deg(rootMidi, scale, e.p + ph.shift), startTime: ph.bar*4 + e.t, duration: e.d, velocity: vary(96) });
}
```

## Limits

- Avoid landing on the avoid-note (e.g. the 4th over a major chord) on strong beats.
- Leave space — a sparse, memorable topline beats a busy one.

See `ableton-reharmonize`, `ableton-theory-coach`, `ableton-humanize`.
