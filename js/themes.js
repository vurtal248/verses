/* ==========================================================================
   THEMES — Five hand-crafted sky palettes + time-of-day interpolation
   ========================================================================== */

export const themes = [
  /* 0 — Dawn */
  {
    name: 'Dawn',
    bgTop: '#182b49', bgMid: '#6ca3cf', bgAccent: '#f1c084', bgBottom: '#ffe6b8',
    horizonGlow: 'rgba(255,227,166,0.88)', horizonHaze: 'rgba(255,244,204,0.5)',
    sunCore: '#fff7d6', sunMid: 'rgba(255,247,214,0.96)', sunFade: 'rgba(255,216,153,0.56)',
    glowCore: 'rgba(255,241,190,0.34)', glowFade: 'rgba(255,210,133,0.18)',
    textMain: '#fffaf0', textSoft: 'rgba(255,250,240,0.82)',
    cardBorderX: 'rgba(255,250,240,0.18)', cardBgA: 'rgba(34,52,83,0.28)',
    cardBgB: 'rgba(26,38,61,0.16)', shadow: '0 24px 80px rgba(17,24,39,0.28)',
    focus: '#fff1b8',
    hourStart: 5, hourEnd: 9,
  },
  /* 1 — High Day */
  {
    name: 'High Day',
    bgTop: '#1a3a5c', bgMid: '#3a7bd5', bgAccent: '#70abe8', bgBottom: '#c8e6fa',
    horizonGlow: 'rgba(200,230,255,0.70)', horizonHaze: 'rgba(170,210,255,0.35)',
    sunCore: '#fffde8', sunMid: 'rgba(255,253,232,0.95)', sunFade: 'rgba(255,242,180,0.55)',
    glowCore: 'rgba(255,250,200,0.28)', glowFade: 'rgba(200,230,255,0.14)',
    textMain: '#f5f8ff', textSoft: 'rgba(245,248,255,0.80)',
    cardBorderX: 'rgba(245,248,255,0.16)', cardBgA: 'rgba(20,45,80,0.30)',
    cardBgB: 'rgba(14,32,60,0.18)', shadow: '0 24px 80px rgba(10,25,50,0.32)',
    focus: '#fff8c0',
    hourStart: 9, hourEnd: 16,
  },
  /* 2 — Sunset Dusk (default / manual index 1 for backward compat) */
  {
    name: 'Sunset Dusk',
    bgTop: '#21111f', bgMid: '#5f2940', bgAccent: '#a84f4a', bgBottom: '#f08c4e',
    horizonGlow: 'rgba(255,147,83,0.82)', horizonHaze: 'rgba(255,205,142,0.32)',
    sunCore: '#ffd08a', sunMid: 'rgba(255,209,138,0.95)', sunFade: 'rgba(255,164,104,0.62)',
    glowCore: 'rgba(255,207,142,0.45)', glowFade: 'rgba(255,170,103,0.24)',
    textMain: '#fff6ea', textSoft: 'rgba(255,246,234,0.68)',
    cardBorderX: 'rgba(255,244,229,0.11)', cardBgA: 'rgba(40,14,30,0.38)',
    cardBgB: 'rgba(20,7,18,0.22)', shadow: '0 32px 100px rgba(14,3,13,0.58)',
    focus: '#ffe1a8',
    hourStart: 16, hourEnd: 19,
  },
  /* 3 — Purple Haze / Nautical Twilight */
  {
    name: 'Nautical Twilight',
    bgTop: '#071423', bgMid: '#15304d', bgAccent: '#3b5a78', bgBottom: '#d18a62',
    horizonGlow: 'rgba(255,164,113,0.44)', horizonHaze: 'rgba(162,193,226,0.18)',
    sunCore: '#ffd3a3', sunMid: 'rgba(255,211,163,0.60)', sunFade: 'rgba(255,160,104,0.26)',
    glowCore: 'rgba(155,193,255,0.18)', glowFade: 'rgba(255,165,115,0.11)',
    textMain: '#f7f2e8', textSoft: 'rgba(247,242,232,0.74)',
    cardBorderX: 'rgba(234,241,250,0.13)', cardBgA: 'rgba(9,21,38,0.44)',
    cardBgB: 'rgba(7,14,29,0.28)', shadow: '0 24px 80px rgba(2,9,18,0.58)',
    focus: '#ffd6a0',
    hourStart: 19, hourEnd: 21,
  },
  /* 4 — Astronomical Night */
  {
    name: 'Astronomical Night',
    bgTop: '#030711', bgMid: '#0d1630', bgAccent: '#18274d', bgBottom: '#3b3356',
    horizonGlow: 'rgba(141,121,205,0.22)', horizonHaze: 'rgba(121,154,210,0.12)',
    sunCore: '#dfe8ff', sunMid: 'rgba(183,205,255,0.30)', sunFade: 'rgba(123,139,205,0.12)',
    glowCore: 'rgba(150,172,255,0.16)', glowFade: 'rgba(119,92,195,0.09)',
    textMain: '#f6f3ee', textSoft: 'rgba(246,243,238,0.72)',
    cardBorderX: 'rgba(234,238,248,0.11)', cardBgA: 'rgba(7,12,25,0.54)',
    cardBgB: 'rgba(4,8,17,0.36)', shadow: '0 24px 80px rgba(0,0,0,0.65)',
    focus: '#d8e3ff',
    hourStart: 21, hourEnd: 5,
  },
];

/** Convert camelCase key → CSS custom property (bgTop → --bg-top) */
function toCssVar(key) {
  return '--' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
}

/** Write all theme values to :root CSS custom properties */
export function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    if (key === 'name' || key === 'hourStart' || key === 'hourEnd') return;
    let cssKey = key;
    if (key === 'cardBorderX') cssKey = 'cardBorder';
    root.style.setProperty(toCssVar(cssKey), value);
  });
}

/**
 * Get the auto-theme index based on current local hour.
 * Returns the index into the themes array.
 */
export function getAutoThemeIndex() {
  const hour = new Date().getHours();

  // Dawn: 5–9
  if (hour >= 5 && hour < 9) return 0;
  // High Day: 9–16
  if (hour >= 9 && hour < 16) return 1;
  // Sunset Dusk: 16–19
  if (hour >= 16 && hour < 19) return 2;
  // Nautical Twilight: 19–21
  if (hour >= 19 && hour < 21) return 3;
  // Astronomical Night: 21–5
  return 4;
}

/**
 * Linearly interpolate two numeric values.
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Parse an rgb/rgba/hex string into [r, g, b, a].
 * Returns null on failure.
 */
function parseColor(str) {
  if (!str) return null;
  str = str.trim();
  const hex = str.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
  if (hex) return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16), 1];
  const rgba = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgba) return [+rgba[1], +rgba[2], +rgba[3], rgba[4] !== undefined ? +rgba[4] : 1];
  return null;
}

/**
 * Interpolate between two CSS color strings by t (0..1).
 * Falls back to colorA if either can't be parsed.
 */
function lerpColor(colorA, colorB, t) {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  if (!a || !b) return colorA;
  const r = Math.round(lerp(a[0], b[0], t));
  const g = Math.round(lerp(a[1], b[1], t));
  const bl = Math.round(lerp(a[2], b[2], t));
  const al = parseFloat(lerp(a[3], b[3], t).toFixed(3));
  return al >= 1 ? `rgb(${r},${g},${bl})` : `rgba(${r},${g},${bl},${al})`;
}

/**
 * Blend two themes by t (0..1), returning a synthetic theme object.
 * String-only properties (name, etc.) come from themeA.
 */
export function blendThemes(themeA, themeB, t) {
  const colorKeys = [
    'bgTop', 'bgMid', 'bgAccent', 'bgBottom',
    'horizonGlow', 'horizonHaze',
    'sunCore', 'sunMid', 'sunFade',
    'glowCore', 'glowFade',
    'textMain', 'textSoft',
    'cardBorderX', 'cardBgA', 'cardBgB',
    'focus',
  ];

  const result = { ...themeA };
  for (const key of colorKeys) {
    result[key] = lerpColor(themeA[key], themeB[key], t);
  }
  return result;
}
