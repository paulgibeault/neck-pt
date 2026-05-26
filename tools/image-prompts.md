# Exercise illustration regeneration prompts

Fully enriched prompts to regenerate the flagged `vector-*.png` frames for the
Neck PT app. Built from a comparison of each generated drawing against the
clinician's source printout photo.

## How to use

- Recommended model: an image model that accepts reference images + text
  (e.g. Gemini `gemini-2.5-flash-image` / "Nano Banana", or any img2img tool).
- Each frame below lists **two reference images to attach** and a **self-contained
  prompt** (style + pose instructions are already baked in — just paste it).
  - **Reference 1 (STYLE):** the look to match (a known-good sibling drawing, or a
    frame you regenerated in an earlier step).
  - **Reference 2 (POSE):** the clinician's source photo — the ground truth for the
    body position. The prompt already tells the model to ignore the paper/text.
- **Generate in the order listed.** Frames marked *(chained)* use a frame you just
  regenerated as their Reference 1, so the person stays identical across a motion.
- Save each result to the exact output path shown (overwrites the current file;
  the originals are tracked in git, so it's all revertable).

> If you ever get a Gemini API key, `tools/gen_neck_images.py` runs all of this
> automatically (reads the key from `$GEMINI_API_KEY` or `./.gemini_key`).

---

## 1 — Exercise 2: Seated Levator Scapulae Stretch

**Output:** `exercises/02-seated-levator-scapulae-stretch/vector-1.png`
**Reference 1 (STYLE):** `exercises/02-seated-levator-scapulae-stretch/vector-2.png` *(already-correct stretch frame — use it as the character/style anchor)*
**Reference 2 (POSE):** `exercises/02-seated-levator-scapulae-stretch/seated-levator-scapulae-stretch.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
A man sitting upright on a simple chair, front 3/4 view — SAME character, clothing (t-shirt and shorts), chair and viewpoint as Reference image 1. This is the STARTING position only: back straight, head and neck neutral and upright with NO tilt or rotation, facing forward. One hand reaches down and grips the front edge of the chair seat to anchor the shoulder; the other arm hangs relaxed. No stretch is being applied yet. Lightly highlight the side neck muscles in pale gold.
```

---

## 2 — Exercise 3: Standing Isometric Cervical Sidebending

**Output:** `exercises/03-standing-isometric-cervical-sidebending/vector-2.png`
**Reference 1 (STYLE):** `exercises/03-standing-isometric-cervical-sidebending/vector-1.png`
**Reference 2 (POSE):** `exercises/03-standing-isometric-cervical-sidebending/standing-isometric-cervical-sidebending.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
A woman standing upright, front view — SAME character, tank top and shorts, and style as Reference image 1. Her chin is gently tucked and her hand is pressed flat against the side of her head / temple. Show the ISOMETRIC resistance with TWO bold dark arrows at the top of the head pointing toward each other (one from the head pressing toward the hand, one from the hand pressing back into the head): the head and hand push against each other with NO movement. Include ONLY these two converging arrows. Highlight the side neck muscles in pale gold.
```

---

## 3 — Exercise 6: Cervicothoracic Mobilization

**Output:** `exercises/06-cervicothoracic-mobilization/vector-1.png`
**Reference 1 (STYLE):** `exercises/02-seated-levator-scapulae-stretch/vector-2.png` *(clean seated figure — style anchor)*
**Reference 2 (POSE):** `exercises/06-cervicothoracic-mobilization/cervicothoracic-mobilization.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
A person sitting upright on a chair, side view. The fingers are interlaced and clasped behind the BASE OF THE NECK, both elbows pointing forward in front of the face. The chin is gently tucked. The person looks only SLIGHTLY upward — a very small, controlled movement where just the eyes and elbows rise about 1-2 inches. The neck is NOT thrown far back; the head stays close to upright. Add ONE small thin double-headed vertical arrow beside the elbows to indicate the tiny 1-2 inch up/down range of motion. Highlight the upper spine / cervicothoracic region in pale gold.
```

---

## 4 — Exercise 7: Seated Cervical Retraction (matched pair)

Generate **4a first**, then attach that result as Reference 1 for **4b** so the
profile, zoom and character match exactly.

### 4a — start (chin forward)

**Output:** `exercises/07-seated-cervical-retraction/vector-1.png`
**Reference 1 (STYLE):** `exercises/07-seated-cervical-retraction/vector-1.png` *(current file — keep the lighter clean profile look)*
**Reference 2 (POSE):** `exercises/07-seated-cervical-retraction/seated-cervical-retraction.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
A man shown in clean LEFT-FACING SIDE PROFILE, seated upright, wearing glasses; framed from the top of the head to the upper chest at a medium zoom. STARTING posture for cervical retraction: the head sits in a slightly forward / neutral position, eyes looking straight ahead at the horizon, neck relaxed.
```

### 4b — end (chin drawn back) *(chained — Reference 1 is your regenerated 4a)*

**Output:** `exercises/07-seated-cervical-retraction/vector-2.png`
**Reference 1 (STYLE):** your **regenerated** `exercises/07-seated-cervical-retraction/vector-1.png` from step 4a
**Reference 2 (POSE):** `exercises/07-seated-cervical-retraction/seated-cervical-retraction.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
The SAME man, SAME left-facing side profile, SAME zoom and framing as Reference image 1 (identical character, glasses, hair, clothing). END posture of cervical retraction: he has gently drawn his chin STRAIGHT BACK (posterior translation) producing a slight double-chin — the back of the head moves backward while the eyes stay level looking straight ahead. He does NOT look down and does NOT tip the head forward. Add one small thin arrow at the chin pointing straight back to show the gentle 'draw the chin in' motion. Highlight the upper neck in pale gold.
```

---

## 5 — Exercise 9: Standing Median Nerve Glide (4-step sequence)

Generate **5a first**, then attach **regenerated 5a** as Reference 1 for 5b, 5c
and 5d so the same man appears in every frame. Each frame is a SINGLE figure —
never a multi-panel grid.

### 5a — step 1 (hand to top of shoulder, wrist flexed)

**Output:** `exercises/09-standing-median-nerve-glide/vector-1.png`
**Reference 1 (STYLE):** `exercises/09-standing-median-nerve-glide/vector-3.png` *(clean standing man — character anchor)*
**Reference 2 (POSE):** `exercises/09-standing-median-nerve-glide/standing-median-nerve-glide.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
A man standing upright, front view, full upper body — SAME character, clothing and style as Reference image 1. STEP 1 of a median-nerve glide on the RIGHT arm: the right arm is curled UP so the hand comes to the TOP OF THE SHOULDER, the elbow is bent and points down/forward, and the WRIST IS FLEXED so the open fingers curl in toward the shoulder. The left arm hangs relaxed. Draw an OPEN hand with five clear fingers — NOT a clenched fist and NOT a fist up by the ear. Highlight the median-nerve path down the right arm in soft gold. ONE single figure only.
```

### 5b — step 2 (elbow lifting/straightening out to side) *(chained)*

**Output:** `exercises/09-standing-median-nerve-glide/vector-2.png`
**Reference 1 (STYLE):** your **regenerated** `exercises/09-standing-median-nerve-glide/vector-1.png`
**Reference 2 (POSE):** `exercises/09-standing-median-nerve-glide/standing-median-nerve-glide.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
The SAME man and style as Reference image 1, front view. STEP 2 of the glide: the RIGHT elbow is lifting and beginning to straighten, the forearm swinging outward to the side, roughly halfway between the shoulder and a fully extended arm. The hand is open and relaxed. Highlight the median-nerve path in gold. ONE single figure only.
```

### 5c — step 3 (arm straight out to side, shoulder height) *(chained)*

**Output:** `exercises/09-standing-median-nerve-glide/vector-3.png`
**Reference 1 (STYLE):** your **regenerated** `exercises/09-standing-median-nerve-glide/vector-1.png`
**Reference 2 (POSE):** `exercises/09-standing-median-nerve-glide/standing-median-nerve-glide.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
The SAME man and style as Reference image 1, front view. STEP 3 of the glide: the RIGHT arm is now fully STRAIGHT and raised horizontally OUT TO THE SIDE at shoulder height (elbow locked straight), palm facing forward, fingers relaxed and straight. Highlight the median-nerve path in gold. ONE single figure only.
```

### 5d — step 4 (wrist extended, fingers to floor) *(chained)*

**Output:** `exercises/09-standing-median-nerve-glide/vector-4.png`
**Reference 1 (STYLE):** your **regenerated** `exercises/09-standing-median-nerve-glide/vector-1.png`
**Reference 2 (POSE):** `exercises/09-standing-median-nerve-glide/standing-median-nerve-glide.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
The SAME man and style as Reference image 1, front view. STEP 4 (final) of the glide: the RIGHT arm stays straight out to the side at shoulder height, and now the WRIST IS EXTENDED so the open fingers point DOWN toward the FLOOR (palm facing away). Draw the open hand with five clear fingers pointing downward. Add one small curved arrow at the wrist showing it bending the fingers downward. Highlight the median-nerve path in gold. ONE single figure only — absolutely no multi-panel grid or repeated figures.
```

---

## 6 — Exercise 10: Prone Single Arm Shoulder Y (matched pair)

Generate **6a first**, then attach **regenerated 6a** as Reference 1 for 6b.

### 6a — start (arm hanging off table edge)

**Output:** `exercises/10-prone-single-arm-shoulder-y/vector-1.png`
**Reference 1 (STYLE):** `exercises/10-prone-single-arm-shoulder-y/vector-1.png` *(current file — table/character anchor)*
**Reference 2 (POSE):** `exercises/10-prone-single-arm-shoulder-y/prone-single-arm-shoulder-y.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
A person lying face-down (prone) on a flat therapy table, side view, head to the RIGHT. The near (working) arm hangs straight DOWN off the long front edge of the table toward the floor, thumb pointing forward. Torso and legs lie flat. STARTING position. Highlight the shoulder / upper-back in pale gold.
```

### 6b — raise (forward-and-up into a Y) *(chained)*

**Output:** `exercises/10-prone-single-arm-shoulder-y/vector-2.png`
**Reference 1 (STYLE):** your **regenerated** `exercises/10-prone-single-arm-shoulder-y/vector-1.png`
**Reference 2 (POSE):** `exercises/10-prone-single-arm-shoulder-y/prone-single-arm-shoulder-y.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
The SAME prone person, SAME table, view and head-right orientation as Reference image 1. Now the SAME working arm is raised FORWARD AND UP into a 'Y': the straight arm lifts up toward the ceiling AND angles forward toward the head end, so it forms roughly a 45-degree diagonal with the torso (like the upper arm of a letter Y), elbow straight, THUMB POINTING UP toward the ceiling. The arm is NOT straight vertical and NOT straight out to the side. Add a small arrow showing the arm lifting forward and up. Highlight the shoulder / upper-back muscles in gold.
```

---

## 7 — Exercise 11: Prone Shoulder Horizontal Abduction (matched pair, mirrors Ex 10)

Framing/table/viewpoint deliberately match Exercise 10 so the two prone exercises
read as a set. Generate **7a first** (anchored to your regenerated Ex 10 start),
then attach **regenerated 7a** as Reference 1 for 7b.

### 7a — start (arm hanging off table edge)

**Output:** `exercises/11-prone-shoulder-horizontal-abduction/vector-1.png`
**Reference 1 (STYLE):** your **regenerated** `exercises/10-prone-single-arm-shoulder-y/vector-1.png` *(match the Ex 10 table & viewpoint)*
**Reference 2 (POSE):** `exercises/11-prone-shoulder-horizontal-abduction/prone-shoulder-horizontal-abduction.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
A person lying face-down (prone) on a flat therapy table, side view, head to the RIGHT — match the framing, table, viewpoint and style of Reference image 1 (the Shoulder-Y illustration) so the two exercises look like a consistent set. The near (working) arm hangs straight DOWN off the long front edge of the table toward the floor, palm facing back toward the feet. STARTING position. Highlight the shoulder / upper-back in pale gold.
```

### 7b — raise (straight out to the side, palm down) *(chained)*

**Output:** `exercises/11-prone-shoulder-horizontal-abduction/vector-2.png`
**Reference 1 (STYLE):** your **regenerated** `exercises/11-prone-shoulder-horizontal-abduction/vector-1.png`
**Reference 2 (POSE):** `exercises/11-prone-shoulder-horizontal-abduction/prone-shoulder-horizontal-abduction.jpeg`

```
You are drawing ONE illustration frame for a physical-therapy app.
STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.
POSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.

DRAW:
The SAME prone person, SAME table, view and head-right orientation as Reference image 1. Now the SAME working arm is raised straight OUT TO THE SIDE (horizontal abduction): the straight arm lifts directly sideways to about shoulder height so it is roughly horizontal and PERPENDICULAR to the torso (like the crossbar of a letter T), elbow straight, PALM FACING DOWN toward the floor, shoulder blade squeezed back. It is NOT forward-and-up and NOT vertical. Add a small arrow showing the arm lifting out to the side. Highlight the upper-back / scapular muscles in gold.
```
