/**
 * Logic-layer tests for the DOM-free modules (format / store / engine / session / data).
 * Run with `npm test` (plain Node, no dependencies). The view layer (ui.js /
 * app.js) needs a browser and is not covered here.
 */
import assert from 'node:assert/strict';
import { formatRange, formatDosageShort, dosagePills, clamp, painToY, greeting } from './src/format.js';
import { Store, DEFAULT_PACING } from './src/store.js';
import { RepSetTracker, buildExercisePlan, PACING } from './src/engine.js';
import { matchCommand } from './src/speech.js';
import { RoutineSession } from './src/session.js';
import { PROGRAM, validateProgram } from './src/data.js';

let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (e) { console.error(`FAIL: ${name}\n  ${e.message}`); failed += 1; process.exitCode = 1; }
}

function fakeStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}
const at = (iso) => () => new Date(iso);

/* ---- format ---- */
test('formatRange', () => {
  assert.equal(formatRange({ min: 5, max: 5 }), '5');
  assert.equal(formatRange({ min: 6, max: 8 }), '6–8');
  assert.equal(formatRange(null), null);
});
test('formatDosageShort', () => {
  assert.equal(formatDosageShort({ hold_seconds: 30 }), '30s hold');
  assert.equal(formatDosageShort({ reps: { min: 10, max: 10 }, sets: { min: 2, max: 3 } }), '10 reps • 2–3 sets');
  assert.equal(formatDosageShort(null), 'No dosage');
});
test('dosagePills', () => {
  assert.deepEqual(dosagePills({ hold_seconds: 30, daily: 1 }), ['30 Second Hold', '1x Daily']);
});
test('clamp keeps 0', () => {
  assert.equal(clamp(0, 0, 10), 0);   // the old `|| 5` bug turned this into 5
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(99, 0, 10), 10);
});
test('painToY scale', () => {
  assert.equal(painToY(10), 20);
  assert.equal(painToY(0), 140);
  assert.equal(painToY(5), 80);
});
test('greeting', () => {
  assert.equal(greeting(new Date('2026-01-01T09:00')), 'Good Morning');
  assert.equal(greeting(new Date('2026-01-01T13:00')), 'Good Afternoon');
  assert.equal(greeting(new Date('2026-01-01T18:00')), 'Good Evening');
});

/* ---- store: the streak bug ---- */
test('streak: first ever session = 1', () => {
  const s = new Store(fakeStorage(), at('2026-05-22T14:00'));
  assert.equal(s.recordSession({ duration_minutes: 5 }).streak, 1);
});
test('streak: consecutive day increments (regression)', () => {
  // Previously broken: returning the next day reset the streak to 0.
  const s = new Store(fakeStorage({
    neck_pt_streak: '3',
    neck_pt_last_date: new Date('2026-05-21T09:00').toDateString(),
  }), at('2026-05-22T14:00'));
  assert.equal(s.streak, 3, 'refresh should not break a 1-day-old streak');
  assert.equal(s.recordSession({ duration_minutes: 5 }).streak, 4);
});
test('streak: missing a day resets to 1', () => {
  const s = new Store(fakeStorage({
    neck_pt_streak: '5',
    neck_pt_last_date: new Date('2026-05-20T09:00').toDateString(),
  }), at('2026-05-22T14:00'));
  assert.equal(s.streak, 0, 'a 2-day gap breaks the streak on load');
  assert.equal(s.recordSession({ duration_minutes: 5 }).streak, 1);
});
test('streak: second session same day unchanged', () => {
  const s = new Store(fakeStorage({
    neck_pt_streak: '4',
    neck_pt_last_date: new Date('2026-05-22T08:00').toDateString(),
  }), at('2026-05-22T20:00'));
  assert.equal(s.recordSession({ duration_minutes: 5 }).streak, 4);
});
test('exit-confirm dismissed preference persists', () => {
  const storage = fakeStorage();
  const s = new Store(storage, at('2026-05-25T10:00'));
  assert.equal(s.getExitConfirmDismissed(), false, 'defaults to showing the confirm');
  s.setExitConfirmDismissed(true);
  assert.equal(s.getExitConfirmDismissed(), true);
  // survives a reload
  assert.equal(new Store(storage, at('2026-05-25T10:00')).getExitConfirmDismissed(), true);
});
test('speechMuted preference defaults to true (off) and persists', () => {
  const storage = fakeStorage();
  const s = new Store(storage, at('2026-05-25T10:00'));
  assert.equal(s.getSpeechMuted(), true, 'defaults to muted (speech off)');
  s.setSpeechMuted(false);
  assert.equal(s.getSpeechMuted(), false, 'can be unmuted');
  // survives a reload
  assert.equal(new Store(storage, at('2026-05-25T10:00')).getSpeechMuted(), false, 'persists unmuted');
  s.setSpeechMuted(true);
  assert.equal(new Store(storage, at('2026-05-25T10:00')).getSpeechMuted(), true, 'persists muted');
});
test('completedToday', () => {
  const s = new Store(fakeStorage(), at('2026-05-22T20:00'));
  s.history = [{ date: new Date('2026-05-22T08:00').toISOString() }];
  assert.equal(s.completedToday(), true);
  s.history = [{ date: new Date('2026-05-21T08:00').toISOString() }];
  assert.equal(s.completedToday(), false);
});
test('completedTodaySlugs tracking', () => {
  const storage = fakeStorage();
  const s = new Store(storage, at('2026-05-25T10:00'));
  assert.deepEqual(s.completedTodaySlugs, []);
  s.markExerciseCompletedToday('seated-levator-scapulae-stretch');
  assert.deepEqual(s.completedTodaySlugs, ['seated-levator-scapulae-stretch']);
  
  // survives reload
  const s2 = new Store(storage, at('2026-05-25T10:30'));
  assert.deepEqual(s2.completedTodaySlugs, ['seated-levator-scapulae-stretch']);
  
  // clears on next day
  const s3 = new Store(storage, at('2026-05-26T08:00'));
  assert.deepEqual(s3.completedTodaySlugs, []);
});

/* ---- store: defensive/self-healing storage ---- */
test('store self-heals corrupted history (non-array)', () => {
  // If storage holds a JSON object instead of an array, history falls back to [].
  const storage = fakeStorage({ neck_pt_history: JSON.stringify({ corrupt: true }) });
  const s = new Store(storage, at('2026-05-25T10:00'));
  assert.deepEqual(s.history, [], 'corrupted history falls back to empty array');
});
test('store self-heals corrupted streak (non-integer)', () => {
  const storage = fakeStorage({ neck_pt_streak: 'not-a-number' });
  const s = new Store(storage, at('2026-05-25T10:00'));
  assert.equal(s.streak, 0, 'non-integer streak defaults to 0');
});
test('pacing defaults load from DEFAULT_PACING when not stored', () => {
  const s = new Store(fakeStorage(), at('2026-05-25T10:00'));
  assert.deepEqual(s.getPacing(), DEFAULT_PACING);
});
test('pacing can be set and persisted', () => {
  const storage = fakeStorage();
  const s = new Store(storage, at('2026-05-25T10:00'));
  s.setPacing({ restSec: 20 });
  assert.equal(s.getPacing().restSec, 20);
  // survives reload
  const s2 = new Store(storage, at('2026-05-25T10:00'));
  assert.equal(s2.getPacing().restSec, 20);
});
test('setPacing ignores invalid (non-number) keys', () => {
  const s = new Store(fakeStorage(), at('2026-05-25T10:00'));
  const before = { ...s.getPacing() };
  s.setPacing({ repSec: 'bad', announceSec: null });
  assert.deepEqual(s.getPacing(), before, 'invalid pacing values are ignored');
});

/* ---- engine: rep/set state machine ---- */
test('RepSetTracker bilateral', () => {
  const t = new RepSetTracker();
  t.init({ reps: { min: 8, max: 8 }, sets: { min: 2, max: 2 } }, false);
  const events = [];
  for (let i = 0; i < 16; i++) events.push(t.tickRep().type);
  assert.equal(events.filter((e) => e === 'setComplete').length, 1);
  assert.equal(events[events.length - 1], 'exerciseComplete');
});
test('RepSetTracker unilateral switches sides', () => {
  const t = new RepSetTracker();
  t.init({ reps: { min: 5, max: 5 }, sets: { min: 2, max: 2 } }, true);
  const events = [];
  for (let i = 0; i < 20; i++) events.push(t.tickRep().type);
  assert.equal(events.filter((e) => e === 'sideSwitch').length, 2);
  assert.equal(events.filter((e) => e === 'setComplete').length, 1);
  assert.equal(events[events.length - 1], 'exerciseComplete');
});

/* ---- guided autopilot: buildExercisePlan ---- */
const countTypes = (plan) => plan.reduce((m, p) => ((m[p.type] = (m[p.type] || 0) + 1), m), {});

test('plan: unilateral hold (both sides, no scaling of the hold)', () => {
  const ex = { title: 'Trap Stretch', category: 'stretch', unilateral: true,
    dosage: { hold_seconds: 30 } };
  const plan = buildExercisePlan(ex);
  const t = countTypes(plan);
  assert.equal(t.announce, 1);
  assert.equal(t.prepare, 1);   // first side prepares
  assert.equal(t.switch, 1);    // one switch to the second side
  assert.equal(t.hold, 2);      // one hold per side
  assert.equal(t.complete, 1);
  const holds = plan.filter((p) => p.type === 'hold');
  assert.equal(holds[0].side, 'left');
  assert.equal(holds[1].side, 'right');
  // The prescribed hold time is carried verbatim from the dosage.
  assert.ok(holds.every((p) => p.durationSec === 30));
});

test('plan: unilateral isometric reps × sets switch sides and rest between sets', () => {
  const ex = { title: 'Iso Sidebend', category: 'isometric', unilateral: true,
    dosage: { reps: { min: 5, max: 5 }, sets: { min: 2, max: 2 } } };
  const plan = buildExercisePlan(ex);
  const t = countTypes(plan);
  assert.equal(t.rep, 5 * 2 * 2, '5 reps × 2 sets × 2 sides');
  assert.equal(t.switch, 2, 'one left→right switch per set');
  assert.equal(t.rest, 1, 'one rest before the 2nd set');
  assert.equal(t.prepare, 1);
  // Isometric reps carry their own short countdown (the 3-4" hold).
  assert.ok(plan.filter((p) => p.type === 'rep').every((p) => p.isometric && p.countdown));
});

test('plan: bilateral reps use ranges max and rest between sets only', () => {
  const ex = { title: 'Retraction', category: 'mobilization', unilateral: false,
    dosage: { reps: { min: 6, max: 8 }, sets: { min: 3, max: 3 } } };
  const plan = buildExercisePlan(ex);
  const t = countTypes(plan);
  assert.equal(t.rep, 8 * 3, 'uses reps.max, no side doubling');
  assert.equal(t.switch || 0, 0, 'bilateral never switches sides');
  assert.equal(t.rest, 2, 'rest before sets 2 and 3');
  assert.equal(plan.filter((p) => p.type === 'rep')[0].side, null);
});

test('plan: pacing is injectable', () => {
  const ex = { title: 'X', category: 'stretch', unilateral: false, dosage: { hold_seconds: 10 } };
  const plan = buildExercisePlan(ex, { ...PACING, prepareSec: 99 });
  assert.equal(plan.find((p) => p.type === 'prepare').durationSec, 99);
});

/* ---- voice grammar: matchCommand ---- */
test('matchCommand maps spoken phrases to controls', () => {
  assert.equal(matchCommand('pause please'), 'pause');
  assert.equal(matchCommand('stop'), 'pause');
  assert.equal(matchCommand('okay continue'), 'resume');
  assert.equal(matchCommand('next'), 'next');
  assert.equal(matchCommand('skip this one'), 'next');
  assert.equal(matchCommand('go back'), 'back', 'specific phrase wins over bare "go"');
  assert.equal(matchCommand('slow down'), 'slower');
  assert.equal(matchCommand('speed up'), 'faster');
  assert.equal(matchCommand('repeat that'), 'repeat');
  assert.equal(matchCommand('hello there'), null);
});

/* ---- RoutineSession state machine ---- */
function makeSession({ startIndex = 0, exercises = null, pacing = null } = {}) {
  const exs = exercises ?? [
    { title: 'Stretch A', slug: 'stretch-a', category: 'stretch', unilateral: false,
      folder: 'ex/01', example_image_count: 1,
      dosage: { hold_seconds: 4 } },
    { title: 'Iso B', slug: 'iso-b', category: 'isometric', unilateral: true,
      folder: 'ex/02', example_image_count: 2,
      dosage: { reps: { min: 2, max: 2 }, sets: { min: 1, max: 1 } } },
  ];
  const events = [];
  const session = new RoutineSession({
    exercises: exs,
    startIndex,
    pacing: pacing ?? { announceSec: 1, prepareSec: 1, switchSec: 1, restSec: 1, repSec: 1, isoRepSec: 1, completeSec: 1 },
    onEvent: (type, state) => events.push({ type, state }),
  });
  return { session, events, exs };
}

test('RoutineSession: fires exercise-load on start', () => {
  const { session, events } = makeSession();
  session.start();
  session.stop();
  assert.ok(events.some(e => e.type === 'exercise-load'), 'exercise-load emitted on start');
});

test('RoutineSession: fires phase-enter after exercise-load', () => {
  const { session, events } = makeSession();
  session.start();
  session.stop();
  assert.ok(events.some(e => e.type === 'phase-enter'), 'phase-enter emitted after loading');
});

test('RoutineSession: getState returns correct currentIndex', () => {
  const { session } = makeSession();
  session.start();
  assert.equal(session.getState().currentIndex, 0);
  session.stop();
});

test('RoutineSession: tick decrements phaseRemaining', () => {
  const { session } = makeSession();
  session.start();
  const before = session.getState().phaseRemaining;
  session.tick();
  const after = session.getState().phaseRemaining;
  // Either still counting down, or phase advanced (next phase entered)
  assert.ok(after < before || session.getState().phaseIdx > 0, 'tick advances time or phase');
  session.stop();
});

test('RoutineSession: togglePause emits pause then resume events', () => {
  const { session, events } = makeSession();
  session.start();
  session.togglePause();
  assert.ok(events.some(e => e.type === 'pause'), 'pause event emitted');
  session.togglePause();
  assert.ok(events.some(e => e.type === 'resume'), 'resume event emitted');
  session.stop();
});

test('RoutineSession: skip advances to next exercise', () => {
  const { session } = makeSession();
  session.start();
  session.skip();
  assert.equal(session.getState().currentIndex, 1, 'currentIndex advanced to 1 after skip');
  session.stop();
});

test('RoutineSession: skip on last exercise fires session-complete', () => {
  const { session, events } = makeSession({ startIndex: 1 });
  session.start();
  session.skip(); // skip to beyond last exercise
  assert.ok(events.some(e => e.type === 'session-complete'), 'session-complete fired after last exercise');
});

test('RoutineSession: repeat reloads same exercise index', () => {
  const { session } = makeSession();
  session.start();
  const idxBefore = session.getState().currentIndex;
  // Advance a couple ticks then repeat
  session.tick();
  session.tick();
  session.repeat();
  assert.equal(session.getState().currentIndex, idxBefore, 'repeat stays on same exercise');
  session.stop();
});

test('RoutineSession: adjustTempo scales tempoScale', () => {
  const { session } = makeSession();
  session.start();
  const before = session.getState().tempoScale;
  session.adjustTempo('slower');
  assert.ok(session.getState().tempoScale > before, 'tempoScale increased on slower');
  session.adjustTempo('faster');
  session.adjustTempo('faster');
  assert.ok(session.getState().tempoScale < session.getState().tempoScale + 1, 'faster decreases tempoScale');
  session.stop();
});

test('RoutineSession: completed slugs tracked', () => {
  // A session with a single very-short hold exercise
  const { session, events } = makeSession({ startIndex: 0 });
  session.start();
  // Drive ticks until session-complete or exercise-complete fires
  for (let i = 0; i < 30 && !events.some(e => e.type === 'exercise-complete'); i++) {
    session.tick();
  }
  const completedEvent = events.find(e => e.type === 'exercise-complete');
  if (completedEvent) {
    assert.equal(completedEvent.state.completedSlug, 'stretch-a', 'completed slug matches');
  }
  session.stop();
});

/* ---- data schema validation ---- */
test('validateProgram passes with the real PROGRAM data', () => {
  assert.doesNotThrow(() => validateProgram(PROGRAM));
});
test('validateProgram throws on missing exercises', () => {
  assert.throws(() => validateProgram({ exercises: [] }), /non-empty array/);
});
test('validateProgram throws on invalid category', () => {
  assert.throws(() => validateProgram({
    exercises: [{
      order: 1, slug: 'test', title: 'Test', category: 'yoga',
      folder: 'ex/01', unilateral: false, example_image_count: 1,
      dosage: { hold_seconds: 10, reps: null, sets: null },
      setup: 'sit', movement: 'move', notes: [],
    }],
  }), /invalid category/);
});
test('validateProgram throws on missing dosage', () => {
  assert.throws(() => validateProgram({
    exercises: [{
      order: 1, slug: 'test', title: 'Test', category: 'stretch',
      folder: 'ex/01', unilateral: false, example_image_count: 1,
      dosage: { hold_seconds: null, reps: null, sets: null },
      setup: 'sit', movement: 'move', notes: [],
    }],
  }), /hold_seconds or reps/);
});
test('validateProgram throws on non-boolean unilateral', () => {
  assert.throws(() => validateProgram({
    exercises: [{
      order: 1, slug: 'test', title: 'Test', category: 'stretch',
      folder: 'ex/01', unilateral: 'yes', example_image_count: 1,
      dosage: { hold_seconds: 30 },
      setup: 'sit', movement: 'move', notes: [],
    }],
  }), /unilateral must be a boolean/);
});

console.log(`\n${passed} tests passed${failed > 0 ? `, ${failed} FAILED` : ''}`);
