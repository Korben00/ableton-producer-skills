---
name: Ableton Live Runner
description: This skill should be used when the user asks to "drive Ableton from code", "run an Ableton extension", "set up the Ableton SDK", "compose into Ableton Live", "write MIDI into Live", or whenever any other ableton-* skill needs to actually build, run, and connect an Extension SDK project to Ableton Live. Provides the SDK setup, API cheatsheet, beta gotchas, the reusable extension scaffold, and the run/kill workflow that every Ableton producer skill depends on.
version: 0.1.0
---

# Ableton Live Runner

The foundation skill for driving Ableton Live via the **Extension SDK** (JS/TS automation that runs
in a Node process beside Live). Every other `ableton-*` skill produces a *composition function*; this
skill is responsible for getting that code to actually run inside Live, reliably, despite the beta's
rough edges.

## When to use

Use this skill whenever Ableton work needs to reach the running app: scaffolding the runner project,
inserting devices, writing clips, rendering audio, or recovering from a failed connection. The
content/musical-logic skills (genre-cover, reharmonize, bassline, drum-groove, etc.) all assume this
skill's workflow and helpers.

## Prerequisites (verify first)

1. Ableton Live 12 is **open** (Suite gives the full device set; everything falls back to `Drift`).
2. **Developer Mode is ON**: Live → Preferences → Extensions → Developer Mode. **It resets to OFF on
   every Live restart — re-check it each time.**
3. A runner project exists (an Extension SDK project with `src/extension.ts`, `npm start` = build +
   `extensions-cli run`, and `.env` pointing `EXTENSION_HOST_PATH` at `ExtensionHostNodeModule.node`).
   To start a new one, copy `examples/extension-template.ts` into the project's `src/extension.ts`.

## Core workflow

The single most important rule: **get the code right before running**, because each run effectively
costs a Live restart (see gotchas — one reliable activation per session).

1. **Write/patch** `src/extension.ts` (use the scaffold in `examples/extension-template.ts`; drop the
   musical logic from the relevant skill into `compose()`).
2. **Build to typecheck**: `npm --prefix <project> run build:dev` — fix any TS error before running.
3. **Kill stale host** (always, between runs):
   ```bash
   pkill -f "ExtensionHostNodeModule"; pkill -f "extensions-cli run"; pkill -f "<project> start"
   ```
4. **Run** in the background and watch the log:
   ```bash
   npm --prefix <project> start > /tmp/ableton-run.log 2>&1 &
   ```
5. **Diagnose the log** (this is where the two failure signatures matter):
   - Lines `sends greeting` → `cannot send now` → `send success` → then `[ext]: ...` and `Done.` = ✅.
   - Host logs `Started: Extension Host` then **nothing** = **Developer Mode is OFF** → ask the user
     to enable it, then re-run.
   - `send success` appears but **no** `activate()` output = the once-per-session activation bug →
     the only reliable fix is **restart Ableton Live**, then re-run on the fresh session.
6. **Kill the host** when done (`pkill` as above) to leave a clean state for the next run.

## Reusable helpers (in the scaffold)

- `makeTrack(song, name, instruments, fxSlots, notes, lengthBeats)` — creates a MIDI track, inserts
  the first instrument that loads (end the list with `"Drift"`), inserts one FX per slot (each slot a
  fallback list), then writes the clip notes.
- `clearPriorTracks(song)` — idempotent re-runs: deletes tracks whose names are in `TRACK_NAMES`,
  re-reading `song.tracks` each pass (deleting invalidates handles). Call it before creating tracks.
- `setParam(track, deviceName, paramName, value)` — dial a device knob via `DeviceParameter.setValue`.
- `vary(base, spread)` — velocity humanization; `inRanges(bar, ranges)` — section gating.

## Key constraints to design around

- `insertDevice` loads **default presets only** (no browser presets/kits). `Drum Rack` is empty/silent
  → tell the user to drag a kit. Get timbre via the right native device + `setParam`.
- **No `File → New`** and `song.tempo` is global → keep different songs in **different Sets**; make
  re-runs idempotent with `clearPriorTracks`.
- Note times are **beats, clip-local**. Setting the whole `clip.notes` array at once is atomic/fast.
- **No automation curves** and **no real-time/transport** — this is composition/arrangement, not live
  performance.

## Additional resources

- **`references/gotchas.md`** — the full list of beta failure modes (connection, activation, devices,
  handles, timing). Read this whenever something silently fails.
- **`references/sdk-api.md`** — API cheatsheet: Song/Track/Clip/Device/Resources/UI surface, the
  `NoteDescription` shape, working device names, MIDI/GM-drum constants.
- **`examples/extension-template.ts`** — the proven scaffold with all helpers; the starting point for
  every composition skill.
