/**
 * Neck PT Companion - Persistence & derived state.
 *
 * Owns everything in localStorage: session history, day-streak, last completion
 * date, and theme. The streak math lives here (and is unit-tested) — the old
 * implementation reset the streak every day because it compared a midnight
 * date string against the current time of day.
 */

const KEYS = {
  history: 'neck_pt_history',
  streak: 'neck_pt_streak',
  lastDate: 'neck_pt_last_date',
  theme: 'neck_pt_theme',
  speechMuted: 'neck_pt_speech_muted',
  exitConfirmDismissed: 'neck_pt_exit_confirm_dismissed',
  completedTodaySlugs: 'neck_pt_completed_today_slugs',
  completedTodayDate: 'neck_pt_completed_today_date',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Calendar-day key for a date, e.g. "Fri May 23 2026" (local, time stripped). */
export function dayKey(date) {
  return new Date(date).toDateString();
}

/** Whole calendar days from dayKey `a` to dayKey `b`. Rounds to absorb DST. */
export function calendarDaysBetween(aKey, bKey) {
  const a = new Date(aKey).getTime();
  const b = new Date(bKey).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

export class Store {
  // `storage` and `now` are injectable for tests; default to the browser.
  constructor(storage = window.localStorage, now = () => new Date()) {
    this.storage = storage;
    this.now = now;

    this.history = this._readJSON(KEYS.history, []);
    this.streak = parseInt(this.storage.getItem(KEYS.streak), 10) || 0;
    this.lastDate = this.storage.getItem(KEYS.lastDate) || null;

    this.completedTodaySlugs = this._readJSON(KEYS.completedTodaySlugs, []);
    this.completedTodayDate = this.storage.getItem(KEYS.completedTodayDate) || null;

    this.refreshStreak();
    this.refreshCompletedToday();
  }

  _readJSON(key, fallback) {
    try {
      return JSON.parse(this.storage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  /** On load: a gap of 2+ calendar days since the last session breaks the streak. */
  refreshStreak() {
    if (!this.lastDate) {
      this.streak = 0;
      return;
    }
    const gap = calendarDaysBetween(this.lastDate, dayKey(this.now()));
    if (gap >= 2 || gap < 0) {
      this.streak = 0;
      this.storage.setItem(KEYS.streak, '0');
    }
  }

  refreshCompletedToday() {
    const today = dayKey(this.now());
    if (this.completedTodayDate !== today) {
      this.completedTodaySlugs = [];
      this.completedTodayDate = today;
      this.storage.setItem(KEYS.completedTodaySlugs, JSON.stringify([]));
      this.storage.setItem(KEYS.completedTodayDate, today);
    }
  }

  markExerciseCompletedToday(slug) {
    this.refreshCompletedToday();
    if (!this.completedTodaySlugs.includes(slug)) {
      this.completedTodaySlugs.push(slug);
      this.storage.setItem(KEYS.completedTodaySlugs, JSON.stringify(this.completedTodaySlugs));
    }
  }

  /**
   * Record a completed session. Updates streak by calendar day:
   *  - same day as last  → unchanged
   *  - exactly next day   → +1
   *  - otherwise          → reset to 1
   */
  recordSession(log) {
    const today = dayKey(this.now());

    if (!this.lastDate) {
      this.streak = 1;
    } else if (this.lastDate === today) {
      // already logged today — streak unchanged
    } else if (calendarDaysBetween(this.lastDate, today) === 1) {
      this.streak += 1;
    } else {
      this.streak = 1;
    }

    this.lastDate = today;
    this.history.push(log);
    if (this.history.length > 30) this.history.shift();

    this.storage.setItem(KEYS.history, JSON.stringify(this.history));
    this.storage.setItem(KEYS.streak, String(this.streak));
    this.storage.setItem(KEYS.lastDate, today);

    return { streak: this.streak };
  }

  /** True when the most recent session was logged today. */
  completedToday() {
    if (this.history.length === 0) return false;
    const last = this.history[this.history.length - 1];
    return dayKey(last.date) === dayKey(this.now());
  }

  totalActiveMinutes() {
    return this.history.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  }

  /* ---- theme ---- */
  getTheme() {
    return this.storage.getItem(KEYS.theme); // 'light' | 'dark' | null (= follow system)
  }

  setTheme(theme) {
    this.storage.setItem(KEYS.theme, theme);
  }

  /* ---- spoken-coaching mute preference (persists across sessions) ---- */
  getSpeechMuted() {
    const val = this.storage.getItem(KEYS.speechMuted);
    return val === null ? true : val === '1';
  }

  setSpeechMuted(muted) {
    this.storage.setItem(KEYS.speechMuted, muted ? '1' : '0');
  }

  /* ---- "skip the exit confirmation" preference (persists across sessions) ---- */
  getExitConfirmDismissed() {
    return this.storage.getItem(KEYS.exitConfirmDismissed) === '1';
  }

  setExitConfirmDismissed(dismissed) {
    this.storage.setItem(KEYS.exitConfirmDismissed, dismissed ? '1' : '0');
  }
}
