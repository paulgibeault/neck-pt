/**
 * Logic-layer tests for the DOM-free modules (format / store / engine).
 * Run with `npm test` (plain Node, no dependencies). The view layer (ui.js /
 * app.js) needs a browser and is not covered here.
 */
import assert from 'node:assert/strict';
import { formatRange, formatDosageShort, dosagePills, clamp, painToY, greeting } from './format.js';
import { Store } from './store.js';
import { RepSetTracker } from './engine.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (e) { console.error(`FAIL: ${name}\n  ${e.message}`); process.exitCode = 1; }
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
test('completedToday', () => {
  const s = new Store(fakeStorage(), at('2026-05-22T20:00'));
  s.history = [{ date: new Date('2026-05-22T08:00').toISOString() }];
  assert.equal(s.completedToday(), true);
  s.history = [{ date: new Date('2026-05-21T08:00').toISOString() }];
  assert.equal(s.completedToday(), false);
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

console.log(`\n${passed} tests passed`);
