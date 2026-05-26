# neck-pt

Interactive companion app for a prescribed neck physical-therapy routine.

Origin: 11 photos (`IMG_7049.jpeg`, `IMG_7051.jpeg` … `IMG_7060.jpeg`) of a
MedBridge GO printout prescribed by Therapeutic Associates Physical Therapy.
The program was transcribed into structured data, and a static, dependency-free
web app was built on top.

## Running

ES modules require an HTTP origin (they will not load from `file://`):

```
npm start          # serves on http://localhost:8080 via http-server
npm test           # runs the logic-layer tests (plain Node, no deps)
```

## Architecture

Vanilla JS, no framework, no build step. The code is split into focused ES
modules with a one-way flow — the controller reads the model and calls the
view; the view never reaches back into logic.

```
index.html      — static screen skeleton (DOM template) + <script type="module">
data.js         — PROGRAM: the single source of truth (patient/provider meta + 11 exercises)
format.js       — pure formatting & chart-geometry helpers (no DOM)        ← tested
store.js        — localStorage persistence, history, day-streak math       ← tested
engine.js       — CountdownTimer, RepSetTracker, buildExercisePlan (no DOM) ← tested
audio.js        — Web Audio cue synthesizer
speech.js       — Speaker (spoken coaching/TTS) + VoiceCommander (voice control) ← matchCommand tested
ui.js           — View: owns the DOM cache and every DOM mutation
app.js          — controller: wiring, routing, session flow, guided autopilot
test.mjs        — Node tests for the DOM-free modules
exercises/
  NN-<slug>/
    <slug>.jpeg                    — source photo this exercise was transcribed from
    example-1.png, example-2.png…  — cropped demonstration panels from the printout
    vector-1.png, vector-2.png…    — generated vector illustrations (animation frames)
```

`data.js` is the only program data the app reads. (Earlier `program.json` and
per-exercise `exercise.json` files were removed to eliminate three diverging
copies of the same data.)

### Exercise shape (in `data.js`)

```jsonc
{
  "order": 1,
  "slug": "seated-upper-trapezius-stretch",
  "title": "Seated Upper Trapezius Stretch",
  "category": "stretch | isometric | mobilization | nerve-glide | strengthening",
  "folder": "exercises/01-seated-upper-trapezius-stretch",
  "source_image": "seated-upper-trapezius-stretch.jpeg",
  "unilateral": true,                 // drives left/right side guidance
  "dosage": {
    "hold_seconds": 30 | null,        // present → timer mode; absent → reps mode
    "reps": null | { "min": 5, "max": 5 },
    "sets": null | { "min": 2, "max": 3 },
    "daily":  1 | null,
    "weekly": 7 | null
  },
  "equipment": ["foam roller"],       // optional
  "example_image_count": 2,           // number of example-/vector- frames in the folder
  "setup": "…",
  "movement": "…",
  "tip": "…" | null,
  "notes": ["3-4\" holds"]
}
```

Range display rule: show `"5"` when `min == max`, else `"min–max"` (e.g. `"6–8"`).

## Hands-free guided mode

The routine is meant to be run while your hands are busy doing the technique, so
it is **auto-paced**: pressing *Start Hands-Free Routine* hands the whole program
to an autopilot that runs itself end to end and coaches you out loud.

- **`engine.js buildExercisePlan(ex)`** turns one exercise into an ordered list of
  timed *phases* — `announce → prepare → (hold | rep…) → switch → rest → … →
  complete` — including side switches for unilateral work and breathing rests
  between sets. Pure & DOM-free, so it is unit-tested.
- **`app.js` plays the plan**: a 1 s scheduler walks the phases, drives the
  countdown ring + breathing guide + status banner, fires the audio cues, and
  advances exercise-to-exercise automatically. There is no per-rep button and no
  blocking `alert()`/`confirm()` — side switches, set rests and exit are all
  spoken/inline.
- **`speech.js Speaker`** speaks every cue via the Web Speech *synthesis* API
  (TTS). This is the reliable backbone — you follow by ear. It no-ops gracefully
  where unavailable.
- **`speech.js VoiceCommander`** is the optional control layer (Web Speech
  *recognition*, Chrome/Edge): the spoken grammar `pause · resume · next · back ·
  repeat · slower · faster` maps to controls (`matchCommand`, tested). Where
  recognition is unavailable the mic chip shows *No mic* and control falls back to
  the keyboard / on-screen buttons.

**Control surface (all equivalent):** big on-screen Back / Pause / Skip buttons
plus a Repeat / Slower / Faster / Mic row · tap the countdown ring to pause ·
keyboard `Space` = pause, `←/→` = back/skip, `R` = repeat, `-/+` = slower/faster,
`Esc` = exit. *Slower/Faster* scales the coaching tempo (reps, get-ready, rest)
only — prescribed `hold_seconds` are never sped up.

## Source-photo → exercise map

| Photo         | Folder                                          | Panels |
|---------------|-------------------------------------------------|--------|
| IMG_7049.jpeg | 01-seated-upper-trapezius-stretch               | 2 |
| IMG_7051.jpeg | 02-seated-levator-scapulae-stretch              | 2 |
| IMG_7052.jpeg | 03-standing-isometric-cervical-sidebending      | 2 |
| IMG_7053.jpeg | 04-seated-isometric-cervical-rotation           | 1 |
| IMG_7054.jpeg | 05-sternocleidomastoid-stretch                  | 3 |
| IMG_7055.jpeg | 06-cervicothoracic-mobilization                 | 1 |
| IMG_7056.jpeg | 07-seated-cervical-retraction                   | 2 |
| IMG_7057.jpeg | 08-supine-chest-stretch-foam-roll               | 2 |
| IMG_7058.jpeg | 09-standing-median-nerve-glide                  | 4 |
| IMG_7059.jpeg | 10-prone-single-arm-shoulder-y                  | 2 |
| IMG_7060.jpeg | 11-prone-shoulder-horizontal-abduction          | 2 |

(IMG_7050 is intentionally missing from the source set.)

## Known follow-ups (UI-tightening phase)

- ~~Replace remaining native `alert()`/`confirm()` (side switches, set rests, exit)
  with in-app, non-blocking UI.~~ **Done** — the hands-free guided autopilot
  removed all per-rep clicking and blocking dialogs (see *Hands-free guided mode*).
- Honest per-exercise progress (the dashboard radial is currently all-or-nothing
  per completed session).
- PWA: add a manifest + service worker to back the existing install meta tags.
- De-duplicate the repeated glass-card CSS into a shared `.card` base + tokens.
