/* ════════════════════════════════════════════════════════════════════════════
 * Reusable Ableton extension scaffold for the producer skills.
 * Drop your composition logic into `compose()`. Battle-tested helpers:
 *   - makeTrack(): pick the best native instrument (fallback → Drift) + an FX chain
 *   - clearPriorTracks(): idempotent re-runs (delete tracks we created, then rebuild)
 *   - vary() / inRanges(): velocity humanization + section gating
 * See ../references/gotchas.md before running (Developer Mode, once-per-session activation…).
 * ════════════════════════════════════════════════════════════════════════════ */
import {
  initialize,
  type ActivationContext,
  type NoteDescription,
} from "@ableton-extensions/sdk";

type Api = ReturnType<typeof initialize>;
type Song = Api["application"]["song"];

/* Track names this extension owns — used to build AND to clear on re-run. */
const TRACK_NAMES = ["Example Track"];

const vary = (base: number, spread = 4): number =>
  Math.max(1, Math.min(127, Math.round(base + (Math.random() - 0.5) * 2 * spread)));
const inRanges = (bar: number, ranges: number[][]): boolean =>
  ranges.some(([a, b]) => bar >= a && bar <= b);

/* Delete our previous tracks so re-runs replace them. Re-read song.tracks each
 * pass: deleting a track invalidates other handles (Invalid object reference). */
async function clearPriorTracks(song: Song) {
  const names = new Set(TRACK_NAMES);
  let count = 0;
  for (let guard = 0; guard < 64; guard++) {
    let target: (typeof song.tracks)[number] | null = null;
    for (const t of song.tracks) {
      let nm = "";
      try { nm = t.name; } catch { continue; }
      if (names.has(nm)) { target = t; break; }
    }
    if (!target) break;
    try { await song.deleteTrack(target); count++; } catch { break; }
  }
  if (count) console.log(`  cleared ${count} old track(s)`);
  return count;
}

/* insertDevice loads a device's DEFAULT preset only. `instruments` = fallback list
 * (first that loads wins, end with "Drift"). `fxSlots` = ordered chain; each slot is
 * a fallback list → one device inserted per slot. Optionally dial params after. */
async function makeTrack(
  song: Song,
  name: string,
  instruments: string[],
  fxSlots: string[][],
  notes: NoteDescription[],
  lengthBeats: number,
) {
  const track = await song.createMidiTrack();
  track.name = name;
  let idx = 0;
  for (const dev of instruments) {
    try { await track.insertDevice(dev, idx); idx++; console.log(`  ${name}: inst "${dev}"`); break; } catch { /* next */ }
  }
  for (const slot of fxSlots) {
    for (const fx of slot) {
      try { await track.insertDevice(fx, idx); idx++; console.log(`  ${name}: fx "${fx}"`); break; } catch { /* next */ }
    }
  }
  const clip = await track.createMidiClip(0, lengthBeats);
  clip.name = name;
  clip.notes = notes;
  return track;
}

/* Set a device parameter by (case-insensitive) name, clamped to its range. */
async function setParam(track: Awaited<ReturnType<typeof makeTrack>>, deviceName: string, paramName: string, value: number) {
  const dev = track.devices.find((d) => d.name.toLowerCase().includes(deviceName.toLowerCase()));
  if (!dev) return;
  const p = dev.parameters.find((x) => x.name.toLowerCase() === paramName.toLowerCase());
  if (!p) return;
  await p.setValue(Math.max(p.min, Math.min(p.max, value)));
}

/* ── your composition ───────────────────────────────────────────────────────*/
async function compose(api: Api) {
  const song = api.application.song;
  const TEMPO = 90;
  const TOTAL_BEATS = 16 * 4; // 16 bars
  song.tempo = TEMPO;

  await clearPriorTracks(song);

  const notes: NoteDescription[] = [];
  for (let bar = 0; bar < 16; bar++) {
    const b = bar * 4;
    // example: a C minor 9 chord per bar
    for (const p of [48, 51, 55, 58, 62]) // C3 Eb3 G3 Bb3 D4
      notes.push({ pitch: p, startTime: b, duration: 3.8, velocity: vary(70) });
  }

  const track = await makeTrack(song, "Example Track", ["Electric", "Operator", "Drift"],
    [["Chorus-Ensemble"], ["Auto Filter"], ["Reverb"]], notes, TOTAL_BEATS);
  void setParam; // available to dial in device knobs, e.g. setParam(track, "Auto Filter", "Frequency", 800)

  console.log(`Done. ${notes.length} notes @ ${TEMPO} bpm.`);
}

/* ── entry point ─────────────────────────────────────────────────────────────*/
export function activate(activation: ActivationContext) {
  const api = initialize(activation, "1.0.0");
  const song = api.application.song;
  console.log("=== producer-skill extension ===");
  console.log(`Connected. Tempo: ${song.tempo} bpm, tracks: ${song.tracks.length}.`);

  api.commands.registerCommand("producer.run", () => {
    void compose(api).catch((e) => console.error("Compose failed:", e));
  });
  void api.ui.registerContextMenuAction("Scene", "▶︎ Run producer skill (Claude)", "producer.run");

  void compose(api).catch((e) => console.error("Compose failed:", e));
}
