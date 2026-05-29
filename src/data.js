/**
 * Neck PT Companion - Canonical Program Prescription Data
 *
 * This is the SINGLE SOURCE OF TRUTH for the program. The app reads only this file.
 * Automatically saved and managed via the Exercise Admin Panel.
 */

export const PROGRAM = {
  "patient": {
    "name": "Rachel Gibeault",
    "episode": "Neck"
  },
  "provider": {
    "name": "Brian Weiderman",
    "clinic": "Therapeutic Associates Physical Therapy",
    "address": "1859 S. Topaz Way, Suite 200, Meridian, Idaho",
    "phone": "208-888-7765"
  },
  "platform": {
    "name": "MedBridge GO",
    "login_url": "taiweb.medbridgego.com",
    "access_code": "CC8X3A8B"
  },
  "printed_dates": [
    "2026-05-15",
    "2026-05-22"
  ],
  "clinician_notes": [
    "Breath - James Nestor (book recommendation written across the header of page 1)",
    "3-4\" holds (handwritten beside the isometric exercises)"
  ],
  "exercises": [
    {
      "order": 1,
      "slug": "seated-upper-trapezius-stretch",
      "folder": "exercises/01-seated-upper-trapezius-stretch",
      "title": "Seated Upper Trapezius Stretch",
      "category": "stretch",
      "source_image": "seated-upper-trapezius-stretch.jpeg",
      "unilateral": true,
      "dosage": {
        "hold_seconds": 30,
        "reps": null,
        "sets": null,
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 2,
      "setup": "Begin sitting upright on a table grasping the edge with one hand.",
      "movement": "Rotate your head up and to the side opposite of your anchored arm and slowly lean it toward your shoulder, applying pressure with your hand until you feel a stretch and hold.",
      "tip": "Make sure to keep your back straight during the exercise.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. No text, Captions, grids or background scenery. Square 1:1 framing.\nDRAW:\nA person sitting upright on a table, tilting their head to the side opposite their anchored arm to stretch the upper trapezius muscle. Highlight target neck stretch area in pale gold.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. No text, Captions, grids or background scenery. Square 1:1 framing.\nDRAW:\nA person sitting upright on a table, tilting their head to the side opposite their anchored arm to stretch the upper trapezius muscle. Highlight target neck stretch area in pale gold.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. No text, Captions, grids or background scenery. Square 1:1 framing.\nDRAW:\nThe same person in the final stretched position, tilting their head fully to the side opposite their anchored arm, applying gentle pressure with their hand to deepen the stretch on the upper trapezius. Highlight target stretch area in pale gold."
      ]
    },
    {
      "order": 2,
      "slug": "seated-levator-scapulae-stretch",
      "folder": "exercises/02-seated-levator-scapulae-stretch",
      "title": "Seated Levator Scapulae Stretch",
      "category": "stretch",
      "source_image": "seated-levator-scapulae-stretch.jpeg",
      "unilateral": true,
      "dosage": {
        "hold_seconds": 30,
        "reps": null,
        "sets": null,
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 2,
      "setup": "Begin sitting upright in a chair, grasping the edge with one hand.",
      "movement": "Rotate your head to the side opposite your anchored arm, then tuck your chin towards your chest. With your free hand, grasp the back of your head and gently pull it downward until you feel a stretch and hold.",
      "tip": "Make sure to keep your back straight during the exercise.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA man sitting upright on a simple chair, front 3/4 view — SAME character, clothing (t-shirt and shorts), chair and viewpoint as Reference image 1. This is the STARTING position only: back straight, head and neck neutral and upright with NO tilt or rotation, facing forward. One hand reaches down and grips the front edge of the chair seat to anchor the shoulder; the other arm hangs relaxed. No stretch is being applied yet. Lightly highlight the side neck muscles in pale gold.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA man sitting upright on a simple chair, front 3/4 view — SAME character, clothing (t-shirt and shorts), chair and viewpoint as Reference image 1. This is the STARTING position only: back straight, head and neck neutral and upright with NO tilt or rotation, facing forward. One hand reaches down and grips the front edge of the chair seat to anchor the shoulder; the other arm hangs relaxed. No stretch is being applied yet. Lightly highlight the side neck muscles in pale gold.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA man sitting upright in a chair, rotating his head away from the anchored arm, then tucking his chin toward his chest. His free hand holds the back of his head, gently pulling it down to stretch the levator scapulae muscle. Highlight the target stretch area on the back/side of the neck in pale gold."
      ]
    },
    {
      "order": 3,
      "slug": "standing-isometric-cervical-sidebending",
      "folder": "exercises/03-standing-isometric-cervical-sidebending",
      "title": "Standing Isometric Cervical Sidebending with Manual Resistance",
      "category": "isometric",
      "source_image": "standing-isometric-cervical-sidebending.jpeg",
      "unilateral": true,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 5,
          "max": 5
        },
        "sets": {
          "min": 2,
          "max": 2
        },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 2,
      "setup": "Begin in a standing upright position with your feet shoulder width apart.",
      "movement": "Gently tuck your chin. Place your hand on your temple and gently apply pressure, using your neck muscles to keep your head steady.",
      "tip": "Do not let your head tilt or rotate during the exercise.",
      "notes": [
        "3-4\" holds"
      ],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA woman standing upright, front view — SAME character, tank top and shorts, and style as Reference image 1. Her chin is gently tucked and her hand is pressed flat against the side of her head / temple. Show the ISOMETRIC resistance with TWO bold dark arrows at the top of the head pointing toward each other (one from the head pressing toward the hand, one from the hand pressing back into the head): the head and hand push against each other with NO movement. Include ONLY these two converging arrows. Highlight the side neck muscles in pale gold.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA woman standing upright, front view — SAME character, tank top and shorts, and style as Reference image 1. Her chin is gently tucked, posture is straight and she looks forward. One hand is relaxed by her side; the other hand is not yet touching her head. No manual resistance is applied yet.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA woman standing upright, front view — SAME character, tank top and shorts, and style as Reference image 1. Her chin is gently tucked and her hand is pressed flat against the side of her head / temple. Show the ISOMETRIC resistance with TWO bold dark arrows at the top of the head pointing toward each other (one from the head pressing toward the hand, one from the hand pressing back into the head): the head and hand push against each other with NO movement. Include ONLY these two converging arrows. Highlight the side neck muscles in pale gold."
      ]
    },
    {
      "order": 4,
      "slug": "seated-isometric-cervical-rotation",
      "folder": "exercises/04-seated-isometric-cervical-rotation",
      "title": "Seated Isometric Cervical Rotation",
      "category": "isometric",
      "source_image": "seated-isometric-cervical-rotation.jpeg",
      "unilateral": true,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 5,
          "max": 5
        },
        "sets": {
          "min": 2,
          "max": 2
        },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 1,
      "setup": "Begin sitting in an upright position.",
      "movement": "Place your hand on the side of your face, then try to turn your head, resisting the motion with your hand. Hold, then relax and repeat.",
      "tip": "There should be little to no movement. Make sure to keep your back straight during the exercise.",
      "notes": [
        "3-4\" holds"
      ],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person sitting in an upright position, placing their hand on the side of their face to resist head rotation. Include two converging arrows at the head and hand showing isometric pressure. Highlight side neck muscles in pale gold.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person sitting in an upright position, placing their hand on the side of their face to resist head rotation. Include two converging arrows at the head and hand showing isometric pressure. Highlight side neck muscles in pale gold."
      ]
    },
    {
      "order": 5,
      "slug": "sternocleidomastoid-stretch",
      "folder": "exercises/05-sternocleidomastoid-stretch",
      "title": "Sternocleidomastoid Stretch",
      "category": "stretch",
      "source_image": "sternocleidomastoid-stretch.jpeg",
      "unilateral": true,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 10,
          "max": 10
        },
        "sets": {
          "min": 3,
          "max": 3
        },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 3,
      "setup": "Begin sitting upright with one hand placed flat on your collarbone.",
      "movement": "Slowly tilt your head to the side away from your hand, then turn your head to look up towards the ceiling until you feel a gentle stretch in the side of your neck. Hold this position, then relax and repeat.",
      "tip": "Make sure to keep your neck and shoulders relaxed during the stretch.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person sitting upright, tilting their head to the side and slightly rotating it upward to stretch the sternocleidomastoid muscle. One hand is placed flat on the collarbone. Highlight the side neck stretch area in pale gold.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person sitting upright, hands relaxed. One hand is beginning to move toward their collarbone. Posture is straight and eyes look forward. STARTING position.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person sitting upright, one hand flat on the collarbone, tilting their head to the side opposite their hand to begin the stretch of the sternocleidomastoid muscle.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nThe same person in the final position, looking up towards the ceiling while keeping their hand anchored on the collarbone to maximize the stretch on the sternocleidomastoid muscle. Highlight the side neck stretch area in pale gold."
      ]
    },
    {
      "order": 6,
      "slug": "cervicothoracic-mobilization",
      "folder": "exercises/06-cervicothoracic-mobilization",
      "title": "Cervicothoracic Mobilization",
      "category": "mobilization",
      "source_image": "cervicothoracic-mobilization.jpeg",
      "unilateral": false,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 8,
          "max": 8
        },
        "sets": {
          "min": 2,
          "max": 2
        },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 1,
      "setup": "Begin sitting upright.",
      "movement": "Interlace fingers at base of neck, tuck chin in, fingers locked together behind head, elbows forward. Slowly look up with your eyes and elbows, only moving the elbows 1-2 inches up/down.",
      "tip": "Keep your breathing relaxed and focus on a small, focused motion.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA woman with a pony tail sitting upright on a chair, side view. The fingers are interlaced and clasped behind the BASE OF THE NECK, both elbows raised above and in front of the face. The chin is gently tucked. The person looks slightly upward — a small, controlled movement where just the eyes and elbows rise about 1-2 inches. The neck is NOT thrown far back; the head stays close to upright. Add ONE small thin double-headed vertical arrow beside the elbows to indicate the tiny 1-2 inch up/down range of motion. Highlight the upper spine / cervicothoracic region in pale gold.\n\nEnsure the clothing hair and pose match exactly, The person's elbows should be raised 45 degrees",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA woman with a pony tail sitting upright on a chair, side view. The fingers are interlaced and clasped behind the BASE OF THE NECK, both elbows raised above and in front of the face. The chin is gently tucked. The person looks slightly upward — a small, controlled movement where just the eyes and elbows rise about 1-2 inches. The neck is NOT thrown far back; the head stays close to upright. Add ONE small thin double-headed vertical arrow beside the elbows to indicate the tiny 1-2 inch up/down range of motion. Highlight the upper spine / cervicothoracic region in pale gold.\n\nEnsure the clothing hair and pose match exactly, The person's elbows should be raised 45 degrees"
      ],
      "equipment": []
    },
    {
      "order": 7,
      "slug": "seated-cervical-retraction",
      "folder": "exercises/07-seated-cervical-retraction",
      "title": "Seated Cervical Retraction",
      "category": "mobilization",
      "source_image": "seated-cervical-retraction.jpeg",
      "unilateral": false,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 6,
          "max": 8
        },
        "sets": {
          "min": 3,
          "max": 3
        },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 2,
      "setup": "Begin sitting in an upright position with your feet flat on the floor.",
      "movement": "Gently draw your chin in, while keeping your eyes fixed on something in front of you.",
      "tip": "Make sure that you do not look down as you do this exercise, or bend your neck forward.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA man shown in clean LEFT-FACING SIDE PROFILE, seated upright, wearing glasses; framed from the top of the head to the upper chest at a medium zoom. STARTING posture for cervical retraction: the head sits in a slightly forward / neutral position, eyes looking straight ahead at the horizon, neck relaxed.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA man shown in clean LEFT-FACING SIDE PROFILE, seated upright, wearing glasses; framed from the top of the head to the upper chest at a medium zoom. STARTING posture for cervical retraction: the head sits in a slightly forward / neutral position, eyes looking straight ahead at the horizon, neck relaxed.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nThe SAME man, SAME left-facing side profile, SAME zoom and framing as Reference image 1 (identical character, glasses, hair, clothing). END posture of cervical retraction: he has gently drawn his chin STRAIGHT BACK (posterior translation) producing a slight double-chin — the back of the head moves backward while the eyes stay level looking straight ahead. He does NOT look down and does NOT tip the head forward. Add one small thin arrow at the chin pointing straight back to show the gentle 'draw the chin in' motion. Highlight the upper neck in pale gold."
      ]
    },
    {
      "order": 8,
      "slug": "supine-chest-stretch-foam-roll",
      "folder": "exercises/08-supine-chest-stretch-foam-roll",
      "title": "Supine Chest Stretch on Foam Roll",
      "category": "stretch",
      "source_image": "supine-chest-stretch-foam-roll.jpeg",
      "unilateral": false,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 6,
          "max": 8
        },
        "sets": {
          "min": 3,
          "max": 3
        },
        "daily": 1,
        "weekly": null
      },
      "equipment": [
        "foam roller"
      ],
      "example_image_count": 2,
      "setup": "Begin lying with your knees bent and a foam roll positioned vertically along the middle of your back, hands resting on your stomach.",
      "movement": "Slowly move your arms straight out to your sides, then return to the starting position and repeat.",
      "tip": "Make sure your back is laying flat against the foam roll.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person lying on their back vertically along a foam roller, knees bent, arms straight out to their sides in a chest stretch. Highlight the chest/shoulder stretch areas in pale gold.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person lying on their back vertically along a foam roller, knees bent, hands resting flat on their stomach. Posture is relaxed. STARTING position.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. Soft translucent gold/yellow highlights on target muscles. Square 1:1 framing.\nDRAW:\nA person lying on their back vertically along a foam roller, knees bent, arms straight out to their sides in a chest stretch. Highlight the chest/shoulder stretch areas in pale gold."
      ]
    },
    {
      "order": 9,
      "slug": "standing-median-nerve-glide",
      "folder": "exercises/09-standing-median-nerve-glide",
      "title": "Standing Median Nerve Glide",
      "category": "nerve-glide",
      "source_image": "standing-median-nerve-glide.jpeg",
      "unilateral": true,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 10,
          "max": 10
        },
        "sets": {
          "min": 2,
          "max": 3
        },
        "daily": 1,
        "weekly": null
      },
      "example_image_count": 3,
      "setup": "Begin in a standing upright position.",
      "movement": "Curl one arm toward the top of your shoulder, bending at your elbow and wrist. Next, slowly straighten your elbow out to the side of your body. When your elbow is straight, extend your wrist so your fingers are pointed toward the floor. Slowly return to the starting position and repeat.",
      "tip": "Make sure to do the movements smoothly and continuously. Try to keep your back straight during the exercise.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA man standing upright, front view, full upper body — SAME character, clothing and style as Reference image 1. STEP 1 of a median-nerve glide on the RIGHT arm: the right arm is curled UP so the hand comes to the TOP OF THE SHOULDER, the elbow is bent and points down/forward, and the WRIST IS FLEXED so the open fingers curl in toward the shoulder. The left arm hangs relaxed. Draw an OPEN hand with five clear fingers — NOT a clenched fist and NOT a fist up by the ear. Highlight the median-nerve path down the right arm in soft gold. ONE single figure only.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA man standing upright, front view, full upper body — SAME character, clothing and style as Reference image 1. STEP 1 of a median-nerve glide on the RIGHT arm: the right arm is curled UP so the hand comes to the TOP OF THE SHOULDER, the elbow is bent and points down/forward, and the WRIST IS FLEXED so the open fingers curl in toward the shoulder. The left arm hangs relaxed. Draw an OPEN hand with five clear fingers — NOT a clenched fist and NOT a fist up by the ear. Highlight the median-nerve path down the right arm in soft gold. ONE single figure only.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nThe SAME man and style as Reference image 1, front view. STEP 2 of the glide: the RIGHT elbow is lifting and beginning to straighten, the forearm swinging outward to the side, roughly halfway between the shoulder and a fully extended arm. The hand is open and relaxed. Highlight the median-nerve path in gold. ONE single figure only.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nThe SAME man and style as Reference image 1, front view. STEP 3 of the glide: the RIGHT arm is now fully STRAIGHT and raised horizontally OUT TO THE SIDE at shoulder height (elbow locked straight), palm facing forward, fingers relaxed and straight. Highlight the median-nerve path in gold. ONE single figure only."
      ]
    },
    {
      "order": 10,
      "slug": "prone-single-arm-shoulder-y",
      "folder": "exercises/10-prone-single-arm-shoulder-y",
      "title": "Prone Single Arm Shoulder Y",
      "category": "strengthening",
      "source_image": "prone-single-arm-shoulder-y.jpeg",
      "unilateral": true,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 10,
          "max": 10
        },
        "sets": {
          "min": 2,
          "max": 3
        },
        "daily": 1,
        "weekly": null
      },
      "equipment": [
        "table or bed"
      ],
      "example_image_count": 2,
      "setup": "Begin lying on your front with your arm hanging off the edge of a table or bed.",
      "movement": "Keeping your elbow straight and thumb pointing up, raise your arm forward and up toward the ceiling. Slowly lower your arm down, then repeat the movement.",
      "tip": "Make sure not to arch your back as you lift your arm. Keep your thumb up throughout the exercise.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA person lying face-down (prone) on a flat therapy table, side view, head to the RIGHT. The near (working) arm hangs straight DOWN off the long front edge of the table toward the floor, thumb pointing forward. Torso and legs lie flat. STARTING position. Highlight the shoulder / upper-back in pale gold.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA person lying face-down (prone) on a flat therapy table, side view, head to the RIGHT. The near (working) arm hangs straight DOWN off the long front edge of the table toward the floor, thumb pointing forward. Torso and legs lie flat. STARTING position. Highlight the shoulder / upper-back in pale gold.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nThe SAME prone person, SAME table, view and head-right orientation as Reference image 1. Now the SAME working arm is raised FORWARD AND UP into a 'Y': the straight arm lifts up toward the ceiling AND angles forward toward the head end, so it forms roughly a 45-degree diagonal with the torso (like the upper arm of a letter Y), elbow straight, THUMB POINTING UP toward the ceiling. The arm is NOT straight vertical and NOT straight out to the side. Add a small arrow showing the arm lifting forward and up. Highlight the shoulder / upper-back muscles in gold."
      ]
    },
    {
      "order": 11,
      "slug": "prone-shoulder-horizontal-abduction",
      "folder": "exercises/11-prone-shoulder-horizontal-abduction",
      "title": "Prone Single Arm Shoulder Horizontal Abduction with Scapular Retraction and Palm Down",
      "category": "strengthening",
      "source_image": "prone-shoulder-horizontal-abduction.jpeg",
      "unilateral": true,
      "dosage": {
        "hold_seconds": null,
        "reps": {
          "min": 10,
          "max": 10
        },
        "sets": {
          "min": 2,
          "max": 3
        },
        "daily": 1,
        "weekly": null
      },
      "equipment": [
        "table or bed"
      ],
      "example_image_count": 2,
      "setup": "Begin lying on your front with one arm hanging off the edge of a bed.",
      "movement": "Raise your arm straight out to your side with your palm down. Slowly lower your arm back down, then repeat the movement.",
      "tip": "Make sure not to arch your back or shrug your shoulder as you lift your arm.",
      "notes": [],
      "prompt": "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA person lying face-down (prone) on a flat therapy table, side view, head to the RIGHT — match the framing, table, viewpoint and style of Reference image 1 (the Shoulder-Y illustration) so the two exercises look like a consistent set. The near (working) arm hangs straight DOWN off the long front edge of the table toward the floor, palm facing back toward the feet. STARTING position. Highlight the shoulder / upper-back in pale gold.",
      "prompts": [
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nA person lying face-down (prone) on a flat therapy table, side view, head to the RIGHT — match the framing, table, viewpoint and style of Reference image 1 (the Shoulder-Y illustration) so the two exercises look like a consistent set. The near (working) arm hangs straight DOWN off the long front edge of the table toward the floor, palm facing back toward the feet. STARTING position. Highlight the shoulder / upper-back in pale gold.",
        "You are drawing ONE illustration frame for a physical-therapy app.\nSTYLE — match Reference image 1 precisely: a clean, minimalist flat line-art drawing of a single person, thin smooth sage/teal outlines, body filled pale mint-white, on a PURE WHITE background. The target muscles or nerve are shown as a soft translucent gold/yellow highlight. No text, letters, numbers, panel borders, captions, logos, shadows, grid, or background scenery. Square 1:1 framing, the figure centered with comfortable margins. Anatomically correct hands with five clearly drawn fingers.\nPOSE — Reference image 2 is a photo of the clinician's printout that shows the correct body position; copy the POSE and MOTION from it but ignore the paper, grain, printed text and watermarks. Draw exactly the position described below; do not add any arrows or symbols unless explicitly requested.\n\nDRAW:\nThe SAME prone person, SAME table, view and head-right orientation as Reference image 1. Now the SAME working arm is raised straight OUT TO THE SIDE (horizontal abduction): the straight arm lifts directly sideways to about shoulder height so it is roughly horizontal and PERPENDICULAR to the torso (like the crossbar of a letter T), elbow straight, PALM FACING DOWN toward the floor, shoulder blade squeezed back. It is NOT forward-and-up and NOT vertical. Add a small arrow showing the arm lifting out to the side. Highlight the upper-back / scapular muscles in gold."
      ]
    }
  ]
};

// Valid clinical exercise categories
const VALID_CATEGORIES = new Set(['stretch', 'isometric', 'mobilization', 'nerve-glide', 'strengthening']);

/**
 * Validates the program schema at startup. Throws a descriptive Error if
 * data.js has been edited incorrectly, so problems surface immediately
 * rather than crashing mid-routine with a cryptic undefined read.
 * @param {Object} program - The PROGRAM export to validate
 * @returns {void}
 */
export function validateProgram(program) {
  if (!program || !Array.isArray(program.exercises) || program.exercises.length === 0) {
    throw new Error('[data] PROGRAM.exercises must be a non-empty array.');
  }

  program.exercises.forEach((ex, i) => {
    const id = `exercises[${i}] "${ex.slug || '(no slug)'}"`;

    if (typeof ex.slug !== 'string' || !ex.slug) throw new Error(`${id}: missing slug`);
    if (typeof ex.title !== 'string' || !ex.title) throw new Error(`${id}: missing title`);
    if (!VALID_CATEGORIES.has(ex.category)) {
      throw new Error(`${id}: invalid category "${ex.category}". Must be one of: ${[...VALID_CATEGORIES].join(', ')}`);
    }
    if (typeof ex.folder !== 'string' || !ex.folder) throw new Error(`${id}: missing folder`);
    if (typeof ex.unilateral !== 'boolean') throw new Error(`${id}: unilateral must be a boolean`);
    if (typeof ex.example_image_count !== 'number' || ex.example_image_count < 1) {
      throw new Error(`${id}: example_image_count must be a positive number`);
    }
    if (!ex.dosage || typeof ex.dosage !== 'object') throw new Error(`${id}: missing dosage`);

    const d = ex.dosage;
    const hasHold = d.hold_seconds !== null && d.hold_seconds !== undefined;
    const hasReps = d.reps !== null && d.reps !== undefined;
    if (!hasHold && !hasReps) {
      throw new Error(`${id}: dosage must have either hold_seconds or reps`);
    }
    if (hasHold && typeof d.hold_seconds !== 'number') throw new Error(`${id}: dosage.hold_seconds must be a number`);
    if (hasReps && (typeof d.reps !== 'object' || !('min' in d.reps) || !('max' in d.reps))) {
      throw new Error(`${id}: dosage.reps must be an object with min and max`);
    }
    if (!ex.setup) throw new Error(`${id}: missing setup text`);
    if (!ex.movement) throw new Error(`${id}: missing movement text`);
  });
}
