---
name: Ableton Tone Recipes
description: This skill should be used when the user asks to "dial in a [sound]", "recreate a Rhodes/dub-bass/supersaw tone", "set device parameters", "build a patch without presets", "make this synth sound like X", or wants a tone designed parametrically in Ableton Live. Inserts a native device and SETS its parameters via the API (since browser presets cannot be loaded).
version: 0.1.0
---

# Ableton Tone Recipes

Design sounds **parametrically**. The SDK cannot load browser presets, but it *can* read and write
device parameter values (`DeviceParameter.getValue()` / `setValue()`). So a tone is recreated by
inserting the right native device and dialing its knobs — a repeatable "recipe".

## When to use

Triggers: "dial in a [tone]", "recreate [sound]", "set the filter cutoff / reverb mix", "patch
without presets". This is the under-used superpower behind good-sounding output.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold (it includes `setParam`).
2. **Insert the closest native device** (default preset), then **enumerate its parameters** to learn
   exact names/ranges — names vary per device, so don't hardcode blind:
   ```ts
   const dev = track.devices.find(d => d.name.includes("Auto Filter"));
   for (const p of dev.parameters) console.log(p.name, p.min, p.max, await p.getValue());
   ```
3. **Apply a recipe** — set parameters with `setParam(track, deviceName, paramName, value)` (clamps
   to range). Build the tone from device + macro knobs, not presets.
4. **Layer FX** for character (see `ableton-fx-chain`) and re-check by reading values back.

## Starter recipes (verify exact param names at runtime — they differ by edition)

| Tone | Device(s) | Key moves |
|---|---|---|
| Warm Rhodes | `Electric` (+`Chorus-Ensemble`,`Reverb`) | soften mallet/decay, light chorus, ~15% reverb |
| Dub sub bass | `Operator`/`Drift` + `Auto Filter` + `Saturator` | low-pass ~120–300 Hz, drive for harmonics, slow release |
| Lofi keys | `Electric`/`Operator` + `Auto Filter` + `Redux`/`Vinyl Distortion` | LP ~2–4 kHz, gentle bit/down-sample, wow/flutter |
| Supersaw lead | `Wavetable`/`Analog` | detune/unison up, slow attack, hi-pass, wide |
| Pad | `Analog`/`Drift` + `Auto Filter` + `Reverb` | slow attack/release, LP to taste, long reverb |

## Reusable recipe shape

```ts
type Recipe = { instruments: string[]; fx: string[][]; params: [string, string, number][] };
const DUB_BASS: Recipe = {
  instruments: ["Operator", "Drift"],
  fx: [["Auto Filter"], ["Compressor"], ["Saturator"]],
  params: [["Auto Filter", "Frequency", 180], ["Saturator", "Drive", 6]],
};
async function applyRecipe(track, r) { for (const [d, p, v] of r.params) await setParam(track, d, p, v); }
```

## Limits

- Parameter names/ranges differ across Live editions/versions — **discover them at runtime** before
  setting. Skip unknown params gracefully.
- No automation: a recipe is a static parameter snapshot, not a sweep over time.

See `ableton-fx-chain`, `ableton-quick-mix`.
