---
name: Ableton Freeze Resample
description: This skill should be used when the user asks to "freeze a track", "resample/bounce to audio", "render stems", "commit this MIDI to audio", "print this track", or wants a MIDI/instrument track rendered to an audio file in Ableton Live. Uses renderPreFxAudio to bounce a track region and import it back as an audio clip.
version: 0.1.0
---

# Ableton Freeze / Resample

Bounce a track region to an audio file and bring it back into the project — for CPU relief
(freeze/commit), creating stems, or capturing a performance. Uses
`resources.renderPreFxAudio(track, startBeat, endBeat)` (returns a file path) and
`resources.importIntoProject(path)`.

## When to use

Triggers: "freeze", "resample", "bounce to audio", "render stems", "commit/print track". For
sampling an *external* file into an instrument, use `ableton-sample-chopper`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Identify the source track + range** (in beats). For a full song, use 0 → total beats; for stems,
   loop over the relevant tracks.
3. **Render** the region to audio:
   ```ts
   const path = await api.resources.renderPreFxAudio(track, startBeat, endBeat);
   ```
   Note: this renders **pre-FX** audio of the track's content.
4. **Bring it back** — import and place on a (new) audio track as a clip:
   ```ts
   const imported = await api.resources.importIntoProject(path);
   const audioTrack = await song.createAudioTrack();
   await audioTrack.createAudioClip({ filePath: imported, startTime: startBeat });
   ```
5. **Show progress** for long renders with `api.ui.showProgressDialog` (update per track).
6. Optionally mute/disable the original to "freeze" it (the rendered clip now plays instead).

## Stems pattern

```ts
async function renderStems(api, song, startBeat, endBeat) {
  const out = [];
  for (const t of song.tracks) {
    try {
      const p = await api.resources.renderPreFxAudio(t, startBeat, endBeat);
      out.push({ track: t.name, path: await api.resources.importIntoProject(p) });
    } catch { /* skip tracks that can't render (e.g. empty Drum Rack) */ }
  }
  return out; // array of { track, path }
}
```

## Limits

- `renderPreFxAudio` targets a track + beat range; it renders the track's pre-effects signal.
- An empty Drum Rack (no kit) renders silence — load a kit first.
- Audio import copies the file into the project; use the returned path for clips.

See `ableton-sample-chopper`, `ableton-quick-mix`.
