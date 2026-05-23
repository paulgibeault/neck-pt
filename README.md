# neck-pt

Source data for an interactive neck-PT routine app.

Origin: 11 photos (`IMG_7049.jpeg`, `IMG_7051.jpeg` … `IMG_7060.jpeg`) of a
MedBridge GO printout prescribed by Therapeutic Associates Physical Therapy.
Phase 0 (this commit) extracts the program into structured data and per-exercise
folders so a UI can be built on top.

## Layout

```
program.json                       — patient/provider/platform info + ordered exercise list
exercises/
  NN-<slug>/
    exercise.json                  — structured prescription (see schema below)
    <slug>.jpeg                    — copy of the source photo this exercise was transcribed from
    example-1.png, example-2.png…  — cropped demonstration panels, numbered left-to-right (count matches `example_image_count`)
IMG_70*.jpeg                       — original source photos at the repo root
```

## exercise.json schema

```jsonc
{
  "order": 1,                         // execution order in the program
  "slug": "seated-upper-trapezius-stretch",
  "title": "Seated Upper Trapezius Stretch",
  "category": "stretch | isometric | mobilization | nerve-glide | strengthening",
  "source_image": "seated-upper-trapezius-stretch.jpeg",  // in-folder copy of the source photo
  "dosage": {
    "hold_seconds": null | 30,        // for stretches / holds
    "reps": null | { "min": 5, "max": 5 },
    "sets": null | { "min": 2, "max": 3 },
    "daily":  null | 1,               // sessions per day
    "weekly": null | 7                // sessions per week
  },
  "equipment": ["foam roller"],       // optional, omitted when none required
  "example_image_count": 2,           // how many panels are expected in this folder
  "setup":    "…",                    // null when the source omits a setup line
  "movement": "…",
  "tip":      "…" | null,
  "notes":    ["Handwritten by clinician: 3-4\" holds"]  // free-form clinician marginalia
}
```

Display rule for ranges: if `min == max` show `"5"`, else `"min–max"` (e.g. `"6–8"`).

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

## Phase 1 — UI

Phase 0 leaves a UI implementer with:
- A single deterministic `program.json` to load.
- A consistent `exercise.json` schema per exercise (no special cases).
- Per-exercise folders that can hold example imagery (numbered `example-N.jpg`).

Suggested first cut for the UI: a stepper that walks through `program.exercises` in order, renders `example-*.jpg` for each, and counts down `hold_seconds × reps × sets` per the dosage block.
