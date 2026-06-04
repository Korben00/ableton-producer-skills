---
name: Ableton Reharmonize
description: This skill should be used when the user asks to "reharmonize", "jazz up these chords", "add 7ths/9ths", "make this progression richer", "reharmonize this MIDI clip", "give me lusher chords", or wants an existing chord progression in Ableton re-voiced with extensions, modal interchange, or substitutions. Reads an existing MIDI clip and writes a reharmonized chord track.
version: 0.1.0
---

# Ableton Reharmonize

Take an existing chord progression (or a set of roots) and re-voice it with richer harmony —
extensions (7ths/9ths/11ths/13ths), modal interchange, and common substitutions — written as a new
chord track in the Live Set. This is what turns grunge power chords into a dreamy lofi bed
(F5→Fm9, etc.).

## When to use

Triggers: "reharmonize", "add 9ths", "jazz these chords", "make it lusher". To build a cover from a
melody, use `ableton-genre-cover`; to write a brand-new progression, use `ableton-describe-to-midi`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Read the source harmony.** If the user points at a clip, read `clip.notes` and group
   simultaneous notes into chords; infer each chord's root and quality. If they give roots/a
   progression in text, use that. Read `song.rootNote` / `song.scaleIntervals` to stay diatonic.
3. **Choose a reharmonization strategy** (state which one is applied):
   - **Add extensions** — keep function, add 7/9/(11/13). Minor→m9, major→maj9, dominant→9/13.
   - **Rootless voicings** — drop the root (the bass covers it), voice 3-5-7-9 in the mid register
     (~MIDI 56–74) for a smooth keys/Rhodes bed.
   - **Modal interchange** — borrow ♭III/♭VI/♭VII maj chords, iv minor, etc., for colour.
   - **Substitutions** — relative/parallel swaps, tritone sub on dominants, passing diminished.
4. **Voice for smooth voice-leading** — keep common tones, move the rest by the smallest interval;
   stagger note starts a few ms (`startTime + i*0.015`) for a natural rolled keys feel.
5. **Write a new track** with `makeTrack` (instrument `["Electric","Operator","Drift"]` for Rhodes,
   FX `[["Chorus-Ensemble"],["Auto Filter"],["Reverb"]]`). Keep the original clip intact.

## Voicing helper

```ts
// Rootless extended voicings, mid register; bass supplies the root.
const VOICE = {
  m9:    (r) => [r+3, r+7, r+10, r+14],  // ♭3 5 ♭7 9
  maj9:  (r) => [r+4, r+7, r+11, r+14],  // 3 5 7 9
  dom13: (r) => [r+4, r+10, r+14, r+21], // 3 ♭7 9 13
};
function chordAt(rootPc, quality, octave = 5) {        // octave 5 → C=72
  const r = rootPc + (octave + 2) * 12;
  return VOICE[quality](r).map(p => ((p - 12) % 48) + 48); // fold into a tidy register
}
```

## Limits

- The bass should carry the actual root (these voicings are rootless) — pair with `ableton-bassline`.
- No automation; if the progression needs movement, vary the comping rhythm, not filter sweeps.

See `ableton-bassline`, `ableton-tone-recipes`, `ableton-theory-coach`.
