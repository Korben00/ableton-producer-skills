---
name: Ableton Describe To MIDI
description: This skill should be used when the user describes music in natural language and wants it written into Ableton Live — "turn this description into MIDI", "generate a [mood] [instrument] motif", "write me an 8-bar [genre] [part] in [key]", "make a melancholic piano line in D dorian", or any free-form "make music that sounds like…" request. Translates a prose brief into a MIDI clip in the Set.
version: 0.1.0
---

# Ableton Describe To MIDI

Translate a natural-language brief ("a melancholic 8-bar piano motif in D dorian, sparse, building")
into MIDI written into the Live Set. This is the "language → music in your project" magic. Two
delivery modes: (A) Claude composes the notes and writes them via the runner; (B) the extension calls
an LLM at runtime from Node (it has network access) and writes the returned notes.

## When to use

Triggers: "turn this into MIDI", "generate a [mood/genre] [part] in [key]", "make music like…". For a
known song's melody use `ableton-genre-cover`; for a melody over given chords use `ableton-topline`.

## Process

1. **Use `ableton-live-runner`** for build/run/kill + scaffold.
2. **Parse the brief into musical parameters** — key/scale, tempo, length (bars), part(s)
   (chords/bass/melody/drums), density, register, mood. Ask 1–2 questions only if a critical
   parameter is missing (key or length).
3. **Set the project context** — `song.tempo`, and optionally `song.rootNote`/scale so the Set stays
   coherent and Ableton's scale-aware tools agree.
4. **Compose** — for each requested part, reuse the relevant skill's logic (chords →
   `ableton-reharmonize` voicings, melody → `ableton-topline` principles, bass → `ableton-bassline`,
   drums → `ableton-drum-groove`). Stay in scale; anchor chord tones on strong beats; phrase with
   rests.
5. **Write tracks** with `makeTrack` (sensible instrument per part + light FX) and report what was
   generated (key, bars, parts).

## Mode B — generate at runtime via an LLM (optional, advanced)

Because the extension is a full Node process it has network access, so `compose()` *can* call an LLM
API and parse structured notes. Caveats: **verify `fetch` exists in Live's bundled Node** (the runtime
Node version is not guaranteed — polyfill or use `node-fetch` if it is undefined); **load the API key
from `environment.storageDirectory`**, not `process.env`; and pin the model in one constant so it is
easy to update. Force JSON output and validate before writing.

```ts
const MODEL = "claude-opus-4-8"; // update as models change
async function llmNotes(apiKey, brief, bars) { // apiKey read from environment.storageDirectory
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 2000,
      messages: [{ role: "user", content:
        `Return ONLY JSON: {"notes":[{"pitch":0-127,"startTime":beats,"duration":beats,"velocity":1-127}]}.
         ${bars} bars, 4/4. Brief: ${brief}` }],
    }),
  });
  const txt = (await res.json()).content[0].text;
  return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)).notes;
}
// then: clip.notes = validate(await llmNotes(apiKey, brief, bars));
```

## Validation (always, especially Mode B)

Clamp `pitch` 0–127, `velocity` 1–127, `startTime ≥ 0`, `duration > 0`; drop out-of-scale notes if a
scale was requested; cap total to the clip length. Never write unvalidated model output.

## Limits

- Mode B needs an API key and network; interactively-authenticated services may be unavailable in
  headless runs — prefer Mode A (Claude composes) for reliability.
- No automation/real-time — generates notes, not performance moves.

See `ableton-topline`, `ableton-reharmonize`, `ableton-bassline`, `ableton-drum-groove`.
