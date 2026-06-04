---
name: Ableton Sample Chopper
description: This skill should be used when the user asks to "chop a sample", "load a sample into Simpler", "make a beat from this sample", "slice this loop", "map a sample across the keys", or wants an audio file imported and turned into a playable instrument in Ableton Live. Imports audio and loads it into a Simpler/Drum Rack, mapping slices to MIDI.
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
   const simpler = track.devices[0]; // a Simpler/RackDevice
   await simpler.replaceSample(imported);
   ```
4. **Choose a mapping** and write MIDI to trigger it:
   - **Pitched one-shot** — play a melody/bassline; each MIDI note repitches the sample.
   - **Sliced loop** — in Simpler's slice mode, consecutive notes (from the base note up) trigger
     successive slices; write notes in slice order to "replay" or re-sequence the loop.
5. **Confirm** with the user which mapping/slice approach (sample content determines the best one),
   then write the MIDI clip.

## Code pattern (replay a chopped loop, 16 slices over a bar)

```ts
async function chopLoop(api, song, file, slices = 16, base = 48 /* C3 */) {
  const path = await api.resources.importIntoProject(file);
  const track = await song.createMidiTrack();
  track.name = "Chop";
  await track.insertDevice("Simpler", 0);
  await track.devices[0].replaceSample(path); // set Simpler to Slice mode in the UI
  const notes = Array.from({ length: slices }, (_, i) => ({
    pitch: base + i, startTime: i * (4 / slices), duration: 4 / slices, velocity: 100,
  }));
  const clip = await track.createMidiClip(0, 4);
  clip.notes = notes;
}
```

## Limits

- Slice mode itself is set in Simpler's UI; the API replaces the sample and triggers notes — confirm
  the user enables Slice (or use a pitched mapping that needs no slicing).
- Warp/tempo of the source affects pitched playback; mention warping if the loop must stay in time.
- For multi-pad kits (one sample per pad) a Drum Rack is needed; building racks per-pad is limited via
  the API — Simpler slicing is the reliable path.

See `ableton-freeze-resample`, `ableton-drum-groove`.
