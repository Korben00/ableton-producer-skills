# Ableton Extension SDK — beta gotchas (battle-tested)

These are the non-obvious failure modes of the Extension SDK beta. Internalize them before driving
Live, because most "it doesn't work" moments map to one of these.

## Connection & activation

- **Developer Mode is mandatory and RESETS to OFF on every Live restart.** Live → Preferences →
  Extensions → Developer Mode. Re-enable it after *every* restart.
  - Symptom when OFF: the host logs `Started: Extension Host` and then **stays silent** — no
    `sends greeting` / `cannot send now` / `send success` lines at all, so `activate()` never runs.
  - When ON, the normal warm-up is `FlipMessageStreamSocket cannot send now` immediately followed
    (~200 ms) by `send success`, then `activate()` fires.

- **One reliable activation per Live session.** `activate()` fires dependably only on the **first**
  host connection after Live (re)starts. After that, killing the host and re-running usually does
  **not** re-fire `activate()` (host connects, `send success`, then silence). Delays don't help; no
  CLI reload flag exists. **To apply edited code you generally must restart Ableton Live.**
  - Corollary: **get the code right before running** — each run effectively costs a Live restart.
  - The registered context-menu action / command can re-run the *currently loaded* bundle in-session,
    but won't pick up rebuilt code.

- **Two distinct silent-failure signatures** (don't confuse them):
  - *No greeting at all* → Developer Mode is OFF.
  - *Greeting + `send success` but no `activate()` output* → the once-per-session / stale-host bug.

- **Always kill the host between runs.** A lingering host (and its `extensions-cli` / `sh -c npm`
  wrappers) keeps the dead connection open and blocks re-activation:
  ```bash
  # the first two are project-name-independent and do the real work; the third is optional
  pkill -f "ExtensionHostNodeModule"; pkill -f "extensions-cli run"; pkill -f "<project> start"
  ```

## Devices

- **`insertDevice(name, idx)` loads only the device's DEFAULT preset.** Browser presets/kits cannot
  be loaded via the API. So `insertDevice("Drum Rack")` gives an **empty, silent** rack — the user
  must drag a kit manually. `Drift` is the safest synth (all Live 12 editions) and makes sound by
  default. To get the right *timbre* despite defaults, either pick the right native device or set its
  parameters via `DeviceParameter.setValue()` (see `ableton-tone-recipes`).

- **Device names — confirmed working** (Live 12 Beta, Suite): `Drift`, `Wavetable`, `Operator`,
  `Analog`, `Simpler`, `Tension`, `Electric`, `Drum Rack`, `Reverb`, `Delay`, `Echo`, `Saturator`,
  `Auto Filter`, `EQ Eight`, `Compressor`, `Chorus-Ensemble`, `Overdrive`, `Vinyl Distortion`,
  `Redux`, `Amp`, `Cabinet`.
- **Device names — did NOT insert**: `Bass` (use `Operator` for sub bass), `Auto Pan`. Always pass a
  fallback list and accept a slot may be skipped.
- **Suite-only devices** (`Electric`, `Analog`, `Tension`, `Operator`, `Wavetable`, `Bass`, `Amp`,
  `Cabinet`…) fail to insert on Intro/Lite. Always end an instrument fallback list with `Drift`.

## Tracks & handles

- **`song.deleteTrack(track)` invalidates other Track handles.** Deleting reindexes the rest, so a
  pre-filtered `song.tracks.filter(...)` list goes stale → `TypeError: Invalid object reference`.
  Delete one-at-a-time, **re-reading `song.tracks` each pass**, and guard `.name` reads in try/catch.
- **No `File → New`.** The API cannot create a new Live Set. `createMidiTrack()` etc. **append** to
  the current Set. For a clean result either work on a fresh set (user opens one) or make runs
  **idempotent** by deleting prior tracks whose names match the ones being created.
- **`song.tempo` is global.** Composing at a new tempo overwrites the Set's tempo — keep different
  songs in different Sets.

## Timing model

- Note `startTime` / `duration` are in **beats, clip-local** (0 = clip start). Setting the whole
  `clip.notes` array at once is atomic and fast.
- **No parameter automation over time.** A parameter value can be set, but envelopes/automation
  curves cannot be drawn. Emulate movement via note density / rhythm / inserted FX instead.

## Runtime

- The extension runs under **Live's bundled Node** (`…/ExtensionHost/node`), not the system Node, so
  the system Node version only gates the *build*. `EXTENSION_HOST_PATH` in `.env` points at
  `ExtensionHostNodeModule.node`.
- Being a full Node process, it has **filesystem + network access** → it can call HTTP APIs / LLMs and
  read/write files (`environment.storageDirectory` is the per-extension persistent dir).
- **Not real-time.** It runs beside Live, not in the audio thread, and there are **no observers /
  listeners and no transport (play/stop)** in the API. It is request→response, not reactive — fine
  for composition/arrangement/utility, not for live MIDI effects.
