/**
 * Neck PT Companion - Persistence & derived state.
 *
 * Owns everything in localStorage: session history, day-streak, last completion
 * date, theme, and custom pacing settings. Features self-healing structural
 * parsing to prevent page crashes due to corrupted or outdated schemas in storage.
 */

export const DEFAULT_PACING = {
  announceSec: 3,   // time to speak the exercise name before starting
  prepareSec: 5,    // "get into position" before the first effort
  switchSec: 6,     // reposition to the other side
  restSec: 12,      // breathing rest between sets
  repSec: 4,        // one controlled rep (move out + return)
  isoRepSec: 5,     // one isometric rep (engage + 3–4" hold + release)
  completeSec: 2,   // closing chime / "well done"
};

const KEYS = {
  history: 'neck_pt_history',
  streak: 'neck_pt_streak',
  lastDate: 'neck_pt_last_date',
  theme: 'neck_pt_theme',
  speechMuted: 'neck_pt_speech_muted',
  exitConfirmDismissed: 'neck_pt_exit_confirm_dismissed',
  completedTodaySlugs: 'neck_pt_completed_today_slugs',
  completedTodayDate: 'neck_pt_completed_today_date',
  pacing: 'neck_pt_pacing_config',
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
  /**
   * @param {Storage} [storage=window.localStorage] - Storage interface
   * @param {function} [now=() => new Date()] - Current date injector for testing
   */
  constructor(storage = (typeof window !== 'undefined' ? window.localStorage : null), now = () => new Date()) {
    this.storage = storage;
    this.now = now;

    // Load state with defensive, type-safe fallback parsing
    this.history = this._readJSON(KEYS.history, []);
    this.streak = this._readInt(KEYS.streak, 0);
    this.lastDate = this._readString(KEYS.lastDate, null);

    this.completedTodaySlugs = this._readJSON(KEYS.completedTodaySlugs, []);
    this.completedTodayDate = this._readString(KEYS.completedTodayDate, null);
    
    this.pacing = this._readJSON(KEYS.pacing, { ...DEFAULT_PACING });

    this.refreshStreak();
    this.refreshCompletedToday();
  }

  /**
   * Defensive, type-safe JSON parser with automatic self-healing capabilities.
   */
  _readJSON(key, fallback) {
    if (!this.storage) return fallback;
    try {
      const val = this.storage.getItem(key);
      if (val === null) return fallback;
      const parsed = JSON.parse(val);

      // Verify structural matching with the fallback prototype
      if (typeof fallback === 'object' && fallback !== null) {
        if (Array.isArray(fallback)) {
          if (!Array.isArray(parsed)) return fallback;
        } else {
          if (Array.isArray(parsed) || typeof parsed !== 'object' || parsed === null) return fallback;
          // Ensure all key values in the fallback exist and match types
          for (const k of Object.keys(fallback)) {
            if (!(k in parsed) || typeof parsed[k] !== typeof fallback[k]) {
              return fallback; // Self-heal on outdated schema keys
            }
          }
        }
      }
      return parsed;
    } catch {
      return fallback;
    }
  }

  _readInt(key, fallback) {
    if (!this.storage) return fallback;
    const val = this.storage.getItem(key);
    if (val === null) return fallback;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  _readString(key, fallback) {
    if (!this.storage) return fallback;
    const val = this.storage.getItem(key);
    return val === null ? fallback : val;
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
      if (this.storage) this.storage.setItem(KEYS.streak, '0');
    }
  }

  refreshCompletedToday() {
    const today = dayKey(this.now());
    if (this.completedTodayDate !== today) {
      this.completedTodaySlugs = [];
      this.completedTodayDate = today;
      if (this.storage) {
        this.storage.setItem(KEYS.completedTodaySlugs, JSON.stringify([]));
        this.storage.setItem(KEYS.completedTodayDate, today);
      }
    }
  }

  markExerciseCompletedToday(slug) {
    this.refreshCompletedToday();
    if (!this.completedTodaySlugs.includes(slug)) {
      this.completedTodaySlugs.push(slug);
      if (this.storage) {
        this.storage.setItem(KEYS.completedTodaySlugs, JSON.stringify(this.completedTodaySlugs));
      }
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

    if (this.storage) {
      this.storage.setItem(KEYS.history, JSON.stringify(this.history));
      this.storage.setItem(KEYS.streak, String(this.streak));
      this.storage.setItem(KEYS.lastDate, today);
    }

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
    return this._readString(KEYS.theme, null); // 'light' | 'dark' | null (= follow system)
  }

  setTheme(theme) {
    if (this.storage) this.storage.setItem(KEYS.theme, theme);
  }

  /* ---- spoken-coaching mute preference (persists across sessions) ---- */
  getSpeechMuted() {
    const val = this._readString(KEYS.speechMuted, null);
    return val === null ? true : val === '1';
  }

  setSpeechMuted(muted) {
    if (this.storage) this.storage.setItem(KEYS.speechMuted, muted ? '1' : '0');
  }

  /* ---- "skip the exit confirmation" preference (persists across sessions) ---- */
  getExitConfirmDismissed() {
    return this._readString(KEYS.exitConfirmDismissed, null) === '1';
  }

  setExitConfirmDismissed(dismissed) {
    if (this.storage) this.storage.setItem(KEYS.exitConfirmDismissed, dismissed ? '1' : '0');
  }

  /* ---- pacing configurations ---- */
  getPacing() {
    return this.pacing;
  }

  setPacing(newPacing) {
    // Validate types and bounds before saving
    for (const key of Object.keys(DEFAULT_PACING)) {
      if (key in newPacing && typeof newPacing[key] === 'number' && newPacing[key] >= 0) {
        this.pacing[key] = Math.round(newPacing[key]);
      }
    }
    if (this.storage) {
      this.storage.setItem(KEYS.pacing, JSON.stringify(this.pacing));
    }
  }
}
