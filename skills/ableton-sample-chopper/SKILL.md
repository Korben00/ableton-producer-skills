---
name: Ableton Sample Chopper
description: This skill should be used when the user asks to "chop a sample", "load a sample into Simpler", "make a beat from this sample", "slice this loop", "map a sample across the keys", or wants an audio file imported and turned into a playable instrument in Ableton Live. Imports audio and loads it into a Simpler, then writes MIDI to repitch (reliable) or replay it.
version: 0.1.0
---

# Ableton Sample Chopper

Import an audio file and turn it into a playable instrument — load it into a `Simpler`
(`sample.replaceSample(path)`), then write MIDI that triggers slices/pitches. The classic
sample-based beatmaking move (chop a break, replay a vocal, pitch a one-shot).

## When to use

Triggers: "chop a sample", "load into Simpler", "beat from this sample", "slice this loop". To bounce
*existing* tracks to audio, use `ableton-freeze-resample`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Import the source file** into the project:
   ```ts
   const imported = await api.resources.importIntoProject("/path/to/sample.wav");
   ```
3. **Load it into a Simpler** — create a track, insert `Simpler`, replace its sample:
   ```ts
   const track = await song.createMidiTrack();
   await track.insertDevice("Simpler", 0);
   const simpler = track.devices[0] as any; // Simpler/Sample — replaceSample isn't on Device type
   await simpler.replaceSample(imported);
   ```
4. **Choose a mapping** (lead with the SDK-safe one):
   - **Pitched one-shot (reliable)** — each MIDI note repitches the whole sample; works with nothing
     but `replaceSample`. Use it for melodic/bass replay of a one-shot or vocal chop.
   - **Sliced loop (UI-dependent — flag this)** — slicing is set in Simpler's **UI**; the SDK only
     replaces the sample and **cannot set slice mode, slice count, or the slice→note map**. Only use
     it if the user has manually enabled Slice mode AND confirms the default chromatic-from-base
     layout; otherwise the notes won't trigger the expected slices.
5. **Confirm** with the user which mapping fits the sample, then write the MIDI clip — prefer the
   pitched one-shot unless slicing is explicitly set up.

## Code pattern

```ts
// Load a sample into a Simpler — the SDK-guaranteed part.
async function loadSimpler(api, song, file, name = "Sampler") {
  const path = await api.resources.importIntoProject(file);
  const track = await song.createMidiTrack();
  track.name = name;
  await track.insertDevice("Simpler", 0);
  await (track.devices[0] as any).replaceSample(path); // replaceSample isn't on the Device type
  return track;
}

// Pitched one-shot (RELIABLE): each note repitches the whole sample; no slice mode needed.
async function pitchedOneShot(api, song, file, notes /* NoteDescription[] */, len) {
  const track = await loadSimpler(api, song, file, "One-shot");
  const clip = await track.createMidiClip(0, len);
  clip.notes = notes; // a melody/bassline
}

// Sliced loop (UI-DEPENDENT): only works if the user enabled Slice mode in Simpler's UI and the
// default chromatic-from-base layout matches. The SDK can neither set nor verify this.
async function chopLoop(api, song, file, slices = 16, base = 48 /* C3 */) {
  const track = await loadSimpler(api, song, file, "Chop");
  const notes = Array.from({ length: slices }, (_, i) => ({
    pitch: base + i, startTime: i * (4 / slices), duration: 4 / slices, velocity: 100,
  }));
  const clip = await track.createMidiClip(0, 4);
  clip.notes = notes;
}
```

## Limits

- **The pitched one-shot is the reliable path.** Slice mode is set in Simpler's UI; the API only does
  `replaceSample` and cannot set or verify slicing — treat sliced-loop replay as best-effort.
- Warp/tempo of the source affects pitched playback; mention warping if the loop must stay in time.
- For multi-pad kits (one sample per pad) a Drum Rack is needed, but building racks per-pad is not
  exposed by the API — use Simpler (one sample) instead.

See `ableton-freeze-resample`, `ableton-drum-groove`.
