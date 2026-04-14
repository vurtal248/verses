/* ==========================================================================
   STORE — localStorage persistence layer
   Handles favorites, verse history, and reading plan progress.
   All reads/writes are wrapped to silently handle quota/private-mode failures.
   ========================================================================== */

const KEYS = {
  FAVORITES: 'vrs_v2_favorites',
  CACHE: 'vrs_v2_cache',
  THEME_OVERRIDE: 'vrs_v2_theme',
  PLAN_PROGRESS: 'vrs_v2_plan',
};

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail (private mode / quota exceeded)
  }
}

/* --------------------------------------------------------------------------
   Verse Cache (offline fallback)
-------------------------------------------------------------------------- */
export const cache = {
  get() { return safeRead(KEYS.CACHE, []); },
  push(verse) {
    const list = this.get();
    if (list.length >= 20) list.shift();
    list.push(verse);
    safeWrite(KEYS.CACHE, list);
  },
};

/* --------------------------------------------------------------------------
   Favorites Collection
   Each entry: { reference, content, savedAt, themeIndex }
-------------------------------------------------------------------------- */
export const favorites = {
  get() { return safeRead(KEYS.FAVORITES, []); },

  add(verse, themeIndex) {
    const list = this.get();
    const exists = list.some(f => f.reference === verse.reference);
    if (exists) return false;
    list.unshift({ ...verse, savedAt: Date.now(), themeIndex });
    safeWrite(KEYS.FAVORITES, list);
    return true;
  },

  remove(reference) {
    const list = this.get().filter(f => f.reference !== reference);
    safeWrite(KEYS.FAVORITES, list);
  },

  has(reference) {
    return this.get().some(f => f.reference === reference);
  },

  clear() {
    safeWrite(KEYS.FAVORITES, []);
  },
};

/* --------------------------------------------------------------------------
   Theme override (manual selection persisted for current session only —
   we use sessionStorage so it resets on browser close, preserving auto-theme)
-------------------------------------------------------------------------- */
export const themeOverride = {
  get() {
    try {
      const v = sessionStorage.getItem(KEYS.THEME_OVERRIDE);
      return v !== null ? parseInt(v, 10) : null;
    } catch { return null; }
  },
  set(index) {
    try { sessionStorage.setItem(KEYS.THEME_OVERRIDE, String(index)); } catch { }
  },
  clear() {
    try { sessionStorage.removeItem(KEYS.THEME_OVERRIDE); } catch { }
  },
};

/* --------------------------------------------------------------------------
   Reading Plan Progress
   { planId, currentIndex, startedAt }
-------------------------------------------------------------------------- */
export const planProgress = {
  get() { return safeRead(KEYS.PLAN_PROGRESS, null); },

  set(planId, currentIndex) {
    safeWrite(KEYS.PLAN_PROGRESS, { planId, currentIndex, startedAt: Date.now() });
  },

  advance() {
    const p = this.get();
    if (!p) return;
    safeWrite(KEYS.PLAN_PROGRESS, { ...p, currentIndex: p.currentIndex + 1 });
  },

  clear() {
    safeWrite(KEYS.PLAN_PROGRESS, null);
  },
};
