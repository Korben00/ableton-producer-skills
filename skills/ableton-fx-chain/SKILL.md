---
name: Ableton FX Chain
description: This skill should be used when the user asks to "add effects", "build an FX chain", "lofi-ize / dub-ize this track", "process this track", "make it sound vintage/wide/gritty", or wants a tailored device chain inserted (and dialed) on a track in Ableton Live. Inserts an ordered effect chain with fallbacks and sets the key parameters.
version: 0.1.0
---

# Ableton FX Chain

Build a tailored audio-effect chain on a track and dial in its key knobs — not just insert defaults.
Genre character lives largely in the FX: lofi = saturation + bit/down-sample + low-pass + chorus
wobble; dub = delay/echo + spring reverb; etc.

## When to use

Triggers: "add effects", "lofi-ize / dub-ize", "process this track", "make it gritty/wide/warm".
For designing an instrument's core tone use `ableton-tone-recipes`; for levels use `ableton-quick-mix`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold + `setParam`.
2. **Insert the chain in order** with `makeTrack`'s `fxSlots` (each slot a fallback list → one device
   per slot). Order matters (e.g. EQ → comp → saturate → modulation → delay → reverb). End optional
   slots gracefully (a missing device is skipped).
3. **Dial the key params** with `setParam` (discover names at runtime; see `ableton-tone-recipes`):
   filter cutoff, dry/wet, drive, feedback.
4. **Verify** by reading values back, and keep wet effects (reverb/delay) modest unless going dub.

## Device names

Use the **canonical confirmed/failed list** in `ableton-live-runner/references/gotchas.md` (single
source of truth — do not fork it). Common confirmed audio FX: `EQ Eight`, `Compressor`, `Saturator`,
`Overdrive`, `Redux`, `Vinyl Distortion`, `Auto Filter`, `Chorus-Ensemble`, `Reverb`, `Delay`, `Echo`,
`Amp`, `Cabinet`. (`Auto Pan` did **not** insert.) For any device not on the confirmed list (e.g.
`Glue Compressor`), pass a fallback slot like `["Glue Compressor", "Compressor"]` so the chain still
builds if it is unavailable.

## Genre chain presets

| Goal | Chain (left → right) |
|---|---|
| Lofi-ize | `Saturator` → `Redux`/`Vinyl Distortion` → `Auto Filter` (LP) → `Chorus-Ensemble` → `Reverb` |
| Dub-ize | `EQ Eight` → `Echo`/`Delay` (high feedback) → `Reverb` (long) |
| Clean guitar tone | `Overdrive`(light) → `Amp` → `Cabinet` → `Chorus-Ensemble` → `Reverb` |
| Glue a bus | `Compressor` (or `Glue Compressor` w/ fallback) → `EQ Eight` → `Saturator`(gentle) |
| Warm sub bass | `Auto Filter`(LP) → `Compressor` → `Saturator` |

## Code pattern

```ts
const LOFI = [["Saturator"], ["Vinyl Distortion", "Redux"], ["Auto Filter"], ["Chorus-Ensemble"], ["Reverb"]];
const track = await makeTrack(song, "Keys", ["Electric", "Drift"], LOFI, notes, len);
await setParam(track, "Auto Filter", "Frequency", 3000); // muffle for lofi
await setParam(track, "Reverb", "Dry/Wet", 0.18);
```

## Limits

- Param names/scales (`"Frequency"`, `"Dry/Wet"`, 0–1 vs Hz) differ per device/edition — discover them
  at runtime (`ableton-tone-recipes`) before `setParam`; the values in the code are illustrative.
- Effects need an instrument before them to process; on an empty Drum Rack they process nothing until
  a kit is dropped.
- No automation lanes — character must be a static setting (or implied by note dynamics).

See `ableton-tone-recipes`, `ableton-quick-mix`.
