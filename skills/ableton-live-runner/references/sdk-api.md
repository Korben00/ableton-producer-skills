# Ableton Extension SDK — API cheatsheet (v1.0.0)

Entry point and the objects/methods most useful for the producer skills. Derived from the SDK type
definitions (`@ableton-extensions/sdk` `index.d.mts`).

## Entry point

```ts
import { initialize, type ActivationContext, type NoteDescription } from "@ableton-extensions/sdk";

export function activate(activation: ActivationContext) {
  const api = initialize(activation, "1.0.0");
  const song = api.application.song;
  // ... do work ...
}
```

`api` modules: `api.application` (the live model), `api.commands`, `api.ui`, `api.resources`,
`api.environment`.

## Song (`api.application.song`)

Read/write:
- `song.tempo` (get/set), `song.signatureNumerator`, `song.signatureDenominator`
- `song.rootNote` (0–11), `song.scaleName`, `song.scaleMode` (bool), `song.scaleIntervals: number[]`
- `song.gridQuantization`, `song.gridIsTriplet`

Collections (getters):
- `song.tracks: Track[]`, `song.returnTracks: Track[]`, `song.mainTrack: Track`
- `song.scenes: Scene[]`, `song.cuePoints: CuePoint[]`

Create:
- `await song.createMidiTrack(): Promise<MidiTrack>`
- `await song.createAudioTrack(): Promise<AudioTrack>`
- `await song.deleteTrack(track)`, `await song.deleteScene(scene)`, `await song.deleteCuePoint(cp)`

## Track

- `track.name` (get/set), `track.mute`, `track.solo`, `track.arm`, `track.color`
- `track.devices: Device[]`, `track.mixer: TrackMixer`, `track.groupTrack`
- `track.clipSlots: ClipSlot[]`, `track.arrangementClips: Clip[]`, `track.takeLanes`
- `await track.insertDevice(deviceName, index): Promise<Device>` — **default preset only**
- `await track.deleteDevice(device)`, `await track.duplicateDevice(device)`

### MidiTrack
- `await track.createMidiClip(startTime, duration): Promise<MidiClip>` (beats)

### AudioTrack
- `await track.createAudioClip({ filePath, startTime, duration?, isWarped?, loopSettings? })`

### TrackMixer (all are `DeviceParameter`)
- `mixer.volume`, `mixer.panning`, `mixer.sends: DeviceParameter[]`

## Clip / MidiClip

- `clip.name` (get/set), `clip.color`, `clip.muted`, `clip.looping`, `clip.loopStart`, `clip.loopEnd`
- MidiClip: `clip.notes: NoteDescription[]` (get/**set** — setting the whole array is atomic)

```ts
type NoteDescription = { pitch: number; startTime: number; duration: number; velocity?: number };
// startTime/duration in beats, clip-local (0 = clip start)
```

## Device & DeviceParameter (the under-used superpower)

- `device.name`, `device.parameters: DeviceParameter[]`
- `param.name`, `param.min`, `param.max`, `param.isQuantized`, `param.defaultValue`, `param.valueItems`
- `await param.getValue(): Promise<number>` / `await param.setValue(value)` — **read AND write
  device knobs** (filter cutoff, reverb dry/wet, saturator drive, mixer volume…). This is how to
  "dial in a tone" parametrically even though presets can't load.

## RackDevice / DrumRack / Simpler / Sample

- `Simpler` / `Sample`: `await sample.replaceSample(filePath)` — swap the sample in a Simpler.
- DrumRack / Chain expose `chains` and per-chain devices.

## Resources (audio I/O) — `api.resources`

- `await resources.renderPreFxAudio(track: AudioTrack, startBeat, endBeat): Promise<string>` —
  render a track region to an audio file (freeze/bounce/stems). Returns the file path.
- `await resources.importIntoProject(filePath): Promise<string>` — copy a file into the project;
  use the returned path for `createAudioClip` / `replaceSample`.

## UI — `api.ui`

- `api.commands.registerCommand(id, cb)` / `api.commands.executeCommand(id, ...args)`
- `api.ui.registerContextMenuAction(scope, title, commandId, onRegistered)` — scopes include
  `"Scene"`, `"MidiClip"`, `"AudioClip"`, `"MidiTrack"`, `"AudioTrack"`, `"DrumRack"`, `"Simpler"`,
  `"Sample"`, `"ClipSlot"`, and selection scopes.
- `api.ui.showModalDialog(url, width, height, onResult, onError)` — open a **WebView** and receive a
  string back → build little control panels. Pass a **file URL** (write HTML to `tempDirectory` /
  `storageDirectory`, pass its `file://` URL), **not** an inline HTML string.
- `api.ui.showProgressDialog({ text, progress? }, onShow, onCancel)` — progress UI for long jobs.

## Environment — `api.environment`

- `environment.storageDirectory` (per-extension persistent dir for config/credentials),
  `environment.tempDirectory`, `environment.language`.

## Useful constants

- MIDI: `C-2 = 0`, `C3 = 48`, `C4 = 60`, `A4 = 69`. Octave n for C = `(n + 2) * 12`.
- GM drums: kick 36, rim 37, snare 38, clap 39, closed-hat 42, open-hat 46, ride 51.
