---
name: Ableton Theory Coach
description: This skill should be used when the user asks to "analyze this clip", "what chords/key/scale is this", "explain the harmony", "what's the progression", "show me the voice-leading", or wants a music-theory explanation of MIDI already in Ableton Live. Reads a clip's notes and explains the harmony, scale, and voice-leading (optionally in a WebView).
version: 0.1.0
---

# Ableton Theory Coach

Read MIDI from the Set and explain the music theory behind it — detected key/scale, chord names and
functions (Roman numerals), the progression, melodic analysis, and voice-leading observations.
Educational: it teaches *why* a part works, not just what it is.

## When to use

Triggers: "analyze this clip", "what chords/key is this", "explain the harmony/progression",
"voice-leading". To generate music use the composition skills; this one *explains existing* MIDI.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Read the target clip's notes** (`clip.notes`) and the project context (`song.rootNote`,
   `song.scaleName`, `song.scaleIntervals`).
3. **Analyze:**
   - **Pitch-class content** → infer key/scale (compare note set to major/minor/modal templates; the
     project scale is a strong prior).
   - **Chords** → group notes overlapping in time per beat/bar; identify root + quality (triad, 7th,
     9th, sus, slash) from intervals.
   - **Function** → Roman numerals relative to the key; flag cadences, secondary dominants, modal
     interchange, the turnaround.
   - **Melody** → contour, chord-tone vs non-chord-tone usage, motif/repetition, range.
   - **Voice-leading** → common tones, smooth vs leapy motion, parallel intervals.
4. **Explain clearly** — concise, leveled to the user; name the theory and say why it sounds the way
   it does (e.g. "the ♭6 over the tonic is what makes it eerie").
5. **Optionally render a WebView report** with `api.ui.showModalDialog(htmlUrl, w, h, …)` for a nice
   visual breakdown (chord chart + notes), or just print the analysis.

## Chord-detection sketch

```ts
function chordsByBar(notes, bpb = 4) {
  const bars = {};
  for (const n of notes) { const bar = Math.floor(n.startTime / bpb); (bars[bar] ??= []).push(n.pitch % 12); }
  return Object.entries(bars).map(([bar, pcs]) => ({ bar: +bar, pcs: [...new Set(pcs)].sort((a, b) => a - b) }));
}
// match each bar's pitch-class set against interval templates {maj:[0,4,7], min:[0,3,7], m7:[0,3,7,10], ...}
// to name root + quality; then convert to a Roman numeral relative to song.rootNote.
```

## Limits

- Detection is heuristic — ambiguous sets (e.g. rootless/quartal voicings) may need the bass clue or a
  best-guess with alternatives stated.
- Reads notes only; expression/automation isn't analyzed.

See `ableton-reharmonize`, `ableton-topline`, `ableton-describe-to-midi`.
