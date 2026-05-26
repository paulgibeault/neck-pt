#!/usr/bin/env python3
"""
Regenerate the flagged exercise illustrations (vector-*.png) with Gemini's
image model, grounding each pose on the clinician's source photo and the visual
style on a known-good sibling frame.

Usage:
    # key from env, or put it in ./.gemini_key (gitignored)
    export GEMINI_API_KEY=...        # or: echo "KEY" > .gemini_key
    python3 tools/gen_neck_images.py             # regenerate all flagged frames
    python3 tools/gen_neck_images.py 09 10       # only outputs whose path matches a filter

Notes:
  - Jobs run in dependency order: a later frame can use an earlier frame's
    freshly-written output as its style/character anchor (so a 2-frame motion
    is the same person in the same view).
  - Originals are tracked in git, so an overwrite is always revertable.
  - Model defaults to gemini-2.5-flash-image (override with GEMINI_IMAGE_MODEL).
"""

import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

EX = {
    2: "exercises/02-seated-levator-scapulae-stretch",
    3: "exercises/03-standing-isometric-cervical-sidebending",
    6: "exercises/06-cervicothoracic-mobilization",
    7: "exercises/07-seated-cervical-retraction",
    9: "exercises/09-standing-median-nerve-glide",
    10: "exercises/10-prone-single-arm-shoulder-y",
    11: "exercises/11-prone-shoulder-horizontal-abduction",
}
SRC = {
    2: f"{EX[2]}/seated-levator-scapulae-stretch.jpeg",
    3: f"{EX[3]}/standing-isometric-cervical-sidebending.jpeg",
    6: f"{EX[6]}/cervicothoracic-mobilization.jpeg",
    7: f"{EX[7]}/seated-cervical-retraction.jpeg",
    9: f"{EX[9]}/standing-median-nerve-glide.jpeg",
    10: f"{EX[10]}/prone-single-arm-shoulder-y.jpeg",
    11: f"{EX[11]}/prone-shoulder-horizontal-abduction.jpeg",
}

STYLE = (
    "You are drawing ONE illustration frame for a physical-therapy app.\n"
    "STYLE — match Reference image 1 precisely: a clean, minimalist flat line-art "
    "drawing of a single person, thin smooth sage/teal outlines, body filled pale "
    "mint-white, on a PURE WHITE background. The target muscles or nerve are shown as "
    "a soft translucent gold/yellow highlight. No text, letters, numbers, panel "
    "borders, captions, logos, shadows, grid, or background scenery. Square 1:1 "
    "framing, the figure centered with comfortable margins. Anatomically correct hands "
    "with five clearly drawn fingers.\n"
    "POSE — Reference image 2 is a photo of the clinician's printout that shows the "
    "correct body position; copy the POSE and MOTION from it but ignore the paper, "
    "grain, printed text and watermarks. Draw exactly the position described below; do "
    "not add any arrows or symbols unless explicitly requested.\n\nDRAW:\n"
)

JOBS = [
    # --- #1  Ex 2: setup frame (vector-2 is already correct → use as anchor) ---
    dict(out=f"{EX[2]}/vector-1.png", style=[f"{EX[2]}/vector-2.png"], pose=[SRC[2]],
         desc="A man sitting upright on a simple chair, front 3/4 view — SAME character, "
              "clothing (t-shirt and shorts), chair and viewpoint as Reference image 1. "
              "This is the STARTING position only: back straight, head and neck neutral and "
              "upright with NO tilt or rotation, facing forward. One hand reaches down and "
              "grips the front edge of the chair seat to anchor the shoulder; the other arm "
              "hangs relaxed. No stretch is being applied yet. Lightly highlight the side "
              "neck muscles in pale gold."),

    # --- #2  Ex 3: add the isometric resistance arrows (vector-1 is the anchor) ---
    dict(out=f"{EX[3]}/vector-2.png", style=[f"{EX[3]}/vector-1.png"], pose=[SRC[3]],
         desc="A woman standing upright, front view — SAME character, tank top and shorts, "
              "and style as Reference image 1. Her chin is gently tucked and her hand is "
              "pressed flat against the side of her head / temple. Show the ISOMETRIC "
              "resistance with TWO bold dark arrows at the top of the head pointing toward "
              "each other (one from the head pressing toward the hand, one from the hand "
              "pressing back into the head): the head and hand push against each other with "
              "NO movement. Include ONLY these two converging arrows. Highlight the side "
              "neck muscles in pale gold."),

    # --- #4  Ex 6: subtle 1-2 inch motion, not extreme extension ---
    dict(out=f"{EX[6]}/vector-1.png", style=[f"{EX[2]}/vector-2.png"], pose=[SRC[6]],
         desc="A person sitting upright on a chair, side view. The fingers are interlaced "
              "and clasped behind the BASE OF THE NECK, both elbows pointing forward in "
              "front of the face. The chin is gently tucked. The person looks only SLIGHTLY "
              "upward — a very small, controlled movement where just the eyes and elbows "
              "rise about 1-2 inches. The neck is NOT thrown far back; the head stays close "
              "to upright. Add ONE small thin double-headed vertical arrow beside the elbows "
              "to indicate the tiny 1-2 inch up/down range of motion. Highlight the upper "
              "spine / cervicothoracic region in pale gold."),

    # --- #5  Ex 7: matched profile pair, chin-forward -> chin-drawn-back ---
    dict(out=f"{EX[7]}/vector-1.png", style=[f"{EX[7]}/vector-1.png"], pose=[SRC[7]],
         desc="A man shown in clean LEFT-FACING SIDE PROFILE, seated upright, wearing "
              "glasses; framed from the top of the head to the upper chest at a medium zoom. "
              "STARTING posture for cervical retraction: the head sits in a slightly "
              "forward / neutral position, eyes looking straight ahead at the horizon, neck "
              "relaxed."),
    dict(out=f"{EX[7]}/vector-2.png", style=[f"{EX[7]}/vector-1.png"], pose=[SRC[7]],
         desc="The SAME man, SAME left-facing side profile, SAME zoom and framing as "
              "Reference image 1 (identical character, glasses, hair, clothing). END posture "
              "of cervical retraction: he has gently drawn his chin STRAIGHT BACK (posterior "
              "translation) producing a slight double-chin — the back of the head moves "
              "backward while the eyes stay level looking straight ahead. He does NOT look "
              "down and does NOT tip the head forward. Add one small thin arrow at the chin "
              "pointing straight back to show the gentle 'draw the chin in' motion. Highlight "
              "the upper neck in pale gold."),

    # --- #6  Ex 9: 4-step median nerve glide, correct hands, one pose per frame ---
    dict(out=f"{EX[9]}/vector-1.png", style=[f"{EX[9]}/vector-3.png"], pose=[SRC[9]],
         desc="A man standing upright, front view, full upper body — SAME character, "
              "clothing and style as Reference image 1. STEP 1 of a median-nerve glide on "
              "the RIGHT arm: the right arm is curled UP so the hand comes to the TOP OF THE "
              "SHOULDER, the elbow is bent and points down/forward, and the WRIST IS FLEXED "
              "so the open fingers curl in toward the shoulder. The left arm hangs relaxed. "
              "Draw an OPEN hand with five clear fingers — NOT a clenched fist and NOT a "
              "fist up by the ear. Highlight the median-nerve path down the right arm in "
              "soft gold. ONE single figure only."),
    dict(out=f"{EX[9]}/vector-2.png", style=[f"{EX[9]}/vector-1.png"], pose=[SRC[9]],
         desc="The SAME man and style as Reference image 1, front view. STEP 2 of the glide: "
              "the RIGHT elbow is lifting and beginning to straighten, the forearm swinging "
              "outward to the side, roughly halfway between the shoulder and a fully extended "
              "arm. The hand is open and relaxed. Highlight the median-nerve path in gold. "
              "ONE single figure only."),
    dict(out=f"{EX[9]}/vector-3.png", style=[f"{EX[9]}/vector-1.png"], pose=[SRC[9]],
         desc="The SAME man and style as Reference image 1, front view. STEP 3 of the glide: "
              "the RIGHT arm is now fully STRAIGHT and raised horizontally OUT TO THE SIDE at "
              "shoulder height (elbow locked straight), palm facing forward, fingers relaxed "
              "and straight. Highlight the median-nerve path in gold. ONE single figure only."),
    dict(out=f"{EX[9]}/vector-4.png", style=[f"{EX[9]}/vector-1.png"], pose=[SRC[9]],
         desc="The SAME man and style as Reference image 1, front view. STEP 4 (final) of the "
              "glide: the RIGHT arm stays straight out to the side at shoulder height, and now "
              "the WRIST IS EXTENDED so the open fingers point DOWN toward the FLOOR (palm "
              "facing away). Draw the open hand with five clear fingers pointing downward. Add "
              "one small curved arrow at the wrist showing it bending the fingers downward. "
              "Highlight the median-nerve path in gold. ONE single figure only — absolutely no "
              "multi-panel grid or repeated figures."),

    # --- #7  Ex 10: prone Shoulder-Y, forward-and-up diagonal, correct arm ---
    dict(out=f"{EX[10]}/vector-1.png", style=[f"{EX[10]}/vector-1.png"], pose=[SRC[10]],
         desc="A person lying face-down (prone) on a flat therapy table, side view, head to "
              "the RIGHT. The near (working) arm hangs straight DOWN off the long front edge "
              "of the table toward the floor, thumb pointing forward. Torso and legs lie flat. "
              "STARTING position. Highlight the shoulder / upper-back in pale gold."),
    dict(out=f"{EX[10]}/vector-2.png", style=[f"{EX[10]}/vector-1.png"], pose=[SRC[10]],
         desc="The SAME prone person, SAME table, view and head-right orientation as Reference "
              "image 1. Now the SAME working arm is raised FORWARD AND UP into a 'Y': the "
              "straight arm lifts up toward the ceiling AND angles forward toward the head end, "
              "so it forms roughly a 45-degree diagonal with the torso (like the upper arm of a "
              "letter Y), elbow straight, THUMB POINTING UP toward the ceiling. The arm is NOT "
              "straight vertical and NOT straight out to the side. Add a small arrow showing the "
              "arm lifting forward and up. Highlight the shoulder / upper-back muscles in gold."),

    # --- #8  Ex 11: prone horizontal abduction, framing mirrors Ex 10 ---
    dict(out=f"{EX[11]}/vector-1.png", style=[f"{EX[10]}/vector-1.png"], pose=[SRC[11]],
         desc="A person lying face-down (prone) on a flat therapy table, side view, head to "
              "the RIGHT — match the framing, table, viewpoint and style of Reference image 1 "
              "(the Shoulder-Y illustration) so the two exercises look like a consistent set. "
              "The near (working) arm hangs straight DOWN off the long front edge of the table "
              "toward the floor, palm facing back toward the feet. STARTING position. Highlight "
              "the shoulder / upper-back in pale gold."),
    dict(out=f"{EX[11]}/vector-2.png", style=[f"{EX[11]}/vector-1.png"], pose=[SRC[11]],
         desc="The SAME prone person, SAME table, view and head-right orientation as Reference "
              "image 1. Now the SAME working arm is raised straight OUT TO THE SIDE (horizontal "
              "abduction): the straight arm lifts directly sideways to about shoulder height so "
              "it is roughly horizontal and PERPENDICULAR to the torso (like the crossbar of a "
              "letter T), elbow straight, PALM FACING DOWN toward the floor, shoulder blade "
              "squeezed back. It is NOT forward-and-up and NOT vertical. Add a small arrow "
              "showing the arm lifting out to the side. Highlight the upper-back / scapular "
              "muscles in gold."),
]


def api_key():
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        path = os.path.join(ROOT, ".gemini_key")
        if os.path.exists(path):
            with open(path) as f:
                key = f.read().strip()
    if not key:
        sys.exit("No API key. Set GEMINI_API_KEY or write it to ./.gemini_key")
    return key


def part_from_image(path):
    full = os.path.join(ROOT, path)
    with open(full, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    mime = mimetypes.guess_type(full)[0] or "image/png"
    return {"inline_data": {"mime_type": mime, "data": data}}


def generate(job, key):
    parts = [{"text": STYLE + job["desc"]}]
    parts += [part_from_image(p) for p in job.get("style", [])]
    parts += [part_from_image(p) for p in job.get("pose", [])]
    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            payload = json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"  HTTP {e.code} for {job['out']}: {e.read().decode()[:500]}")

    for cand in payload.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            blob = part.get("inlineData") or part.get("inline_data")
            if blob and blob.get("data"):
                out = os.path.join(ROOT, job["out"])
                with open(out, "wb") as f:
                    f.write(base64.b64decode(blob["data"]))
                return True
            if part.get("text"):
                print(f"  model said: {part['text'][:300]}")
    return False


def main():
    filters = sys.argv[1:]
    jobs = [j for j in JOBS if not filters or any(f in j["out"] for f in filters)]
    key = api_key()
    print(f"Model: {MODEL}  ·  {len(jobs)} frame(s) to generate\n")
    ok = 0
    for j in jobs:
        print(f"→ {j['out']}")
        if generate(j, key):
            ok += 1
            print("  ✓ written")
        else:
            print("  ✗ no image returned")
    print(f"\nDone: {ok}/{len(jobs)} written.")


if __name__ == "__main__":
    main()
