# Ableton Producer Skills

A toolkit of [Claude Code](https://claude.com/claude-code) skills that turn Claude into a
production assistant for **Ableton Live**, driven by the **Ableton Live Extension SDK** (JS/TS
automation that runs in a Node process beside Live).

The skills let you ask, in plain language, for musical work to happen **in your actual Live Set** —
"make a reggae version of the X-Files theme", "reharmonize these chords", "write me a one-drop
bassline", "dial in a Rhodes tone", "humanize this MIDI" — and Claude writes the notes, inserts the
right devices, sets parameters, or renders audio for you.

> ⚠️ **Beta SDK.** This relies on the Extension SDK beta. Read
> [`skills/ableton-live-runner/references/gotchas.md`](skills/ableton-live-runner/references/gotchas.md)
> first — the beta has real friction (Developer Mode resets on restart, one reliable activation per
> Live session, no preset loading, not real-time). The `ableton-live-runner` skill encodes all of it.

## What's inside

Every skill is grounded in a **real** SDK capability (verified against the type definitions).

### 🧱 Foundation
| Skill | What it does |
|---|---|
| **ableton-live-runner** | Scaffold/build/run the extension reliably; the API cheatsheet, the beta gotchas, the proven `makeTrack` + idempotent-cleanup patterns, and the device-name table. **Every other skill depends on this.** |

### 🎼 Composition / songwriting
| Skill | What it does |
|---|---|
| **ableton-genre-cover** | "Make a *[genre]* version of *[song]*" → full multi-track arrangement + instruments/FX. |
| **ableton-reharmonize** | Read a chord clip, reharmonize it (7ths/9ths, modal interchange, substitutions). |
| **ableton-bassline** | Generate an idiomatic bassline that follows a chord progression. |
| **ableton-topline** | Generate a melody/topline over an existing progression. |

### 🥁 Groove / rhythm
| Skill | What it does |
|---|---|
| **ableton-drum-groove** | Style-specific drum patterns (boom-bap, one-drop, house, trap, breakbeat). |
| **ableton-humanize** | Apply micro-timing, swing/groove and velocity dynamics to a clip. |

### 🎛️ Sound-design & mix
| Skill | What it does |
|---|---|
| **ableton-tone-recipes** | Recreate sounds *parametrically* — insert a device **and set its parameters** (no presets needed). |
| **ableton-fx-chain** | Build a tailored FX chain (lofi-ize, dub-ize…) with the knobs actually dialed in. |
| **ableton-quick-mix** | Set a sensible starting balance (volumes / pans / sends). |

### 🔊 Sampling / audio
| Skill | What it does |
|---|---|
| **ableton-freeze-resample** | Bounce a MIDI track to audio (freeze / commit / stems) via `renderPreFxAudio`. |
| **ableton-sample-chopper** | Import a sample, load it into Simpler/Drum Rack, map slices to MIDI. |

### 🤖 AI-native
| Skill | What it does |
|---|---|
| **ableton-describe-to-midi** | Natural-language → MIDI written into a clip. |
| **ableton-theory-coach** | Analyze the current clip and explain the harmony/scale/voice-leading. |

## Install

Clone this repo and point Claude Code at it as a plugin directory:

```bash
cc --plugin-dir /path/to/ableton-producer-skills
```

Or copy the `skills/` folders into your `~/.claude/skills/` (or a plugin you already load).

## Requirements

- Ableton Live 12 (Suite recommended for the full device set; skills fall back to `Drift`).
- The Ableton Live Extension SDK (beta) + a runner project (see `ableton-live-runner`).
- **Developer Mode** enabled in Live → Preferences → Extensions (re-check after every restart).

## Credits

Built with Claude Code. Born out of making a reggae X-Files theme and a lo-fi Nirvana track.
