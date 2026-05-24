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
engine.js       — CountdownTimer + RepSetTracker state machine (no DOM)     ← tested
audio.js        — Web Audio cue synthesizer
ui.js           — View: owns the DOM cache and every DOM mutation
app.js          — controller: wiring, routing, session flow
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
  "notes": ["Handwritten by clinician: 3-4\" holds"]
}
```

Range display rule: show `"5"` when `min == max`, else `"min–max"` (e.g. `"6–8"`).

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

- Replace remaining native `alert()`/`confirm()` (side switches, set rests, exit)
  with in-app, non-blocking UI.
- Honest per-exercise progress (the dashboard radial is currently all-or-nothing
  per completed session).
- PWA: add a manifest + service worker to back the existing install meta tags.
- De-duplicate the repeated glass-card CSS into a shared `.card` base + tokens.
