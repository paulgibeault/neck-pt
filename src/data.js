/**
 * Neck PT Companion - Canonical Program Prescription Data
 *
 * This is the SINGLE SOURCE OF TRUTH for the program. The app reads only this file.
 * (The former program.json + per-exercise exercise.json files were removed; their
 * content was folded in here.) Loaded as an ES module — the app must be served over
 * http (see `npm start`), not opened via file://.
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
  "printed_dates": ["2026-05-15", "2026-05-22"],
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
      "notes": []
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
      "notes": []
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
        "reps": { "min": 5, "max": 5 },
        "sets": { "min": 2, "max": 2 },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 2,
      "setup": "Begin in a standing upright position with your feet shoulder width apart.",
      "movement": "Gently tuck your chin. Place your hand on your temple and gently apply pressure, using your neck muscles to keep your head steady.",
      "tip": "Do not let your head tilt or rotate during the exercise.",
      "notes": [
        "3-4\" holds"
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
        "reps": { "min": 5, "max": 5 },
        "sets": { "min": 2, "max": 2 },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 1,
      "setup": "Begin sitting in an upright position.",
      "movement": "Place your hand on the side of your face, then try to turn your head, resisting the motion with your hand. Hold, then relax and repeat.",
      "tip": "There should be little to no movement. Make sure to keep your back straight during the exercise.",
      "notes": [
        "3-4\" holds"
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
        "reps": { "min": 10, "max": 10 },
        "sets": { "min": 3, "max": 3 },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 3,
      "setup": "Begin sitting upright with one hand placed flat on your collarbone.",
      "movement": "Slowly tilt your head to the side away from your hand, then turn your head to look up towards the ceiling until you feel a gentle stretch in the side of your neck. Hold this position, then relax and repeat.",
      "tip": "Make sure to keep your neck and shoulders relaxed during the stretch.",
      "notes": []
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
        "reps": { "min": 8, "max": 8 },
        "sets": { "min": 2, "max": 2 },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 1,
      "setup": "Begin sitting upright.",
      "movement": "Interlace fingers at base of neck, tuck chin in, fingers locked together behind head, elbows forward. Slowly look up with your eyes and elbows, only moving the elbows 1-2 inches up/down.",
      "tip": "Keep your breathing relaxed and focus on a small, focused motion.",
      "notes": []
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
        "reps": { "min": 6, "max": 8 },
        "sets": { "min": 3, "max": 3 },
        "daily": 1,
        "weekly": 7
      },
      "example_image_count": 2,
      "setup": "Begin sitting in an upright position with your feet flat on the floor.",
      "movement": "Gently draw your chin in, while keeping your eyes fixed on something in front of you.",
      "tip": "Make sure that you do not look down as you do this exercise, or bend your neck forward.",
      "notes": []
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
        "reps": { "min": 6, "max": 8 },
        "sets": { "min": 3, "max": 3 },
        "daily": 1,
        "weekly": null
      },
      "equipment": ["foam roller"],
      "example_image_count": 2,
      "setup": "Begin lying with your knees bent and a foam roll positioned vertically along the middle of your back, hands resting on your stomach.",
      "movement": "Slowly move your arms straight out to your sides, then return to the starting position and repeat.",
      "tip": "Make sure your back is laying flat against the foam roll.",
      "notes": []
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
        "reps": { "min": 10, "max": 10 },
        "sets": { "min": 2, "max": 3 },
        "daily": 1,
        "weekly": null
      },
      "example_image_count": 4,
      "setup": "Begin in a standing upright position.",
      "movement": "Curl one arm toward the top of your shoulder, bending at your elbow and wrist. Next, slowly straighten your elbow out to the side of your body. When your elbow is straight, extend your wrist so your fingers are pointed toward the floor. Slowly return to the starting position and repeat.",
      "tip": "Make sure to do the movements smoothly and continuously. Try to keep your back straight during the exercise.",
      "notes": []
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
        "reps": { "min": 10, "max": 10 },
        "sets": { "min": 2, "max": 3 },
        "daily": 1,
        "weekly": null
      },
      "equipment": ["table or bed"],
      "example_image_count": 2,
      "setup": "Begin lying on your front with your arm hanging off the edge of a table or bed.",
      "movement": "Keeping your elbow straight and thumb pointing up, raise your arm forward and up toward the ceiling. Slowly lower your arm down, then repeat the movement.",
      "tip": "Make sure not to arch your back as you lift your arm. Keep your thumb up throughout the exercise.",
      "notes": []
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
        "reps": { "min": 10, "max": 10 },
        "sets": { "min": 2, "max": 3 },
        "daily": 1,
        "weekly": null
      },
      "equipment": ["table or bed"],
      "example_image_count": 2,
      "setup": "Begin lying on your front with one arm hanging off the edge of a bed.",
      "movement": "Raise your arm straight out to your side with your palm down. Slowly lower your arm back down, then repeat the movement.",
      "tip": "Make sure not to arch your back or shrug your shoulder as you lift your arm.",
      "notes": []
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
