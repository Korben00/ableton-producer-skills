---
name: Ableton Quick Mix
description: This skill should be used when the user asks to "rough mix", "balance the levels", "set track volumes/pans", "set up sends", "give me a starting mix", or wants a sensible starting balance applied across tracks in Ableton Live. Sets mixer volume, panning, and sends via the API.
version: 0.1.0
---

# Ableton Quick Mix

Apply a sensible starting balance across the Set's tracks — volumes, pans, and sends — via the mixer
parameters (`track.mixer.volume / panning / sends`, all `DeviceParameter`s with get/set). Not a
mastering pass; a clean, musical starting point so the arrangement is immediately listenable.

## When to use

Triggers: "rough mix", "balance levels", "set volumes/pans", "set up sends". For per-track tone use
`ableton-tone-recipes` / `ableton-fx-chain`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Enumerate tracks** (`song.tracks`) and classify by name/role (drums, bass, keys, lead, pad…).
3. **Read each control's range first** (`param.min`/`param.max`/`getValue`) — volume is **not** dB
   0–1; discover the scale, then set relative to it. Don't hardcode blind.
4. **Apply a balance** by role (guidelines below): set `mixer.volume`, pan complementary parts
   apart, keep bass/kick/lead centered, route reverb-heavy parts to a return via `sends`.
5. **Leave headroom** — aim for a peaky-but-not-clipping balance; the user mixes finer by ear after.

## Balance guidelines

| Role | Level | Pan | Notes |
|---|---|---|---|
| Kick / bass | reference (loudest core) | center | the foundation; don't bury |
| Snare/clap | just under kick | center / slight | backbeat presence |
| Hats/percussion | quieter | spread L/R | width without clutter |
| Chords/keys | mid | slightly off-center | leave room for lead |
| Lead/vocal | sits on top, clear | center | the focal point |
| Pad/texture | low, supportive | wide | glue, not foreground |

## Code pattern

```ts
async function setRelative(param, frac) {           // frac 0..1 across the param's range
  await param.setValue(param.min + (param.max - param.min) * frac);
}
for (const t of song.tracks) {
  const m = t.mixer, n = t.name.toLowerCase();
  if (/bass|kick|drum/.test(n))      { await setRelative(m.volume, 0.82); await m.panning.setValue((m.panning.min+m.panning.max)/2); }
  else if (/lead|vocal|whistle/.test(n)) await setRelative(m.volume, 0.78);
  else if (/pad|texture/.test(n))    await setRelative(m.volume, 0.55);
  else                                await setRelative(m.volume, 0.7);
}
```

## Limits

- No automation → this is a static balance, not moves over time.
- Sends require return tracks to **already exist** (`song.returnTracks`) — the SDK cannot create a
  return. Guard the call (`m.sends[0]?.setValue(...)`) and skip the send step if there are no returns,
  rather than silently no-op.
- Role classification relies on descriptive track names (which the producer skills set via `makeTrack`).

See `ableton-fx-chain`, `ableton-tone-recipes`.
