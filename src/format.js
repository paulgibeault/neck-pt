/**
 * Neck PT Companion - Pure formatting & math helpers.
 * No DOM, no side effects — safe to unit-test under Node.
 */

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** Display rule for {min,max} ranges: "5" when equal, else "6–8". */
export function formatRange(range) {
  if (!range) return null;
  return range.min === range.max ? `${range.min}` : `${range.min}–${range.max}`;
}

/** Compact one-line dosage for dashboard cards: "30s hold • 5 reps • 2 sets". */
export function formatDosageShort(dosage) {
  if (!dosage) return 'No dosage';
  const parts = [];
  if (dosage.hold_seconds) parts.push(`${dosage.hold_seconds}s hold`);
  if (dosage.reps) parts.push(`${formatRange(dosage.reps)} reps`);
  if (dosage.sets) parts.push(`${formatRange(dosage.sets)} sets`);
  return parts.join(' • ');
}

/** Full dosage pill labels for the summary/routine detail views. */
export function dosagePills(dosage) {
  if (!dosage) return [];
  const pills = [];
  if (dosage.hold_seconds) pills.push(`${dosage.hold_seconds} Second Hold`);
  if (dosage.reps) pills.push(`${formatRange(dosage.reps)} Repetitions`);
  if (dosage.sets) pills.push(`${formatRange(dosage.sets)} Sets`);
  if (dosage.daily) pills.push(`${dosage.daily}x Daily`);
  return pills;
}

/** Time-of-day greeting for the dashboard header. */
export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h >= 17) return 'Good Evening';
  if (h >= 12) return 'Good Afternoon';
  return 'Good Morning';
}

/* ---- Pain trend chart geometry (viewBox 400x160) ----
 * Plot band runs y=20 (pain 10) to y=140 (pain 0): 12px per pain point. */
export const CHART = {
  top: 20,
  bottom: 140,
  left: 40,
  right: 380,
  maxPain: 10,
};

/** Map a 0–10 pain score to a chart Y coordinate. */
export function painToY(pain) {
  return CHART.bottom - (pain / CHART.maxPain) * (CHART.bottom - CHART.top);
}

/** Gridline pain values, rendered at their true Y so labels never drift. */
export const CHART_GRIDLINES = [10, 7.5, 5, 2.5, 0];
