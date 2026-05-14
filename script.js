/* ==========================================================================
   THEMES — Five hand-crafted sky palettes
   Keys are camelCase; applyTheme() converts them to CSS custom properties.
   ========================================================================== */
const themes = [
  /* 0 — Dawn */
  {
    bgTop: '#182b49', bgMid: '#6ca3cf', bgAccent: '#f1c084', bgBottom: '#ffe6b8',
    horizonGlow: 'rgba(255,227,166,0.88)', horizonHaze: 'rgba(255,244,204,0.5)',
    sunCore: '#fff7d6', sunMid: 'rgba(255,247,214,0.96)', sunFade: 'rgba(255,216,153,0.56)',
    glowCore: 'rgba(255,241,190,0.34)', glowFade: 'rgba(255,210,133,0.18)',
    textMain: '#fffaf0', textSoft: 'rgba(255,250,240,0.82)',
    cardBorderX: 'rgba(255,250,240,0.18)', cardBgA: 'rgba(34,52,83,0.28)',
    cardBgB: 'rgba(26,38,61,0.16)', shadow: '0 24px 80px rgba(17,24,39,0.28)',
    focus: '#fff1b8',
  },
  /* 1 — Sunset Dusk (default) */
  {
    bgTop: '#21111f', bgMid: '#5f2940', bgAccent: '#a84f4a', bgBottom: '#f08c4e',
    horizonGlow: 'rgba(255,147,83,0.82)', horizonHaze: 'rgba(255,205,142,0.32)',
    sunCore: '#ffd08a', sunMid: 'rgba(255,209,138,0.95)', sunFade: 'rgba(255,164,104,0.62)',
    glowCore: 'rgba(255,207,142,0.45)', glowFade: 'rgba(255,170,103,0.24)',
    textMain: '#fff6ea', textSoft: 'rgba(255,246,234,0.68)',
    cardBorderX: 'rgba(255,244,229,0.11)', cardBgA: 'rgba(40,14,30,0.38)',
    cardBgB: 'rgba(20,7,18,0.22)', shadow: '0 32px 100px rgba(14,3,13,0.58)',
    focus: '#ffe1a8',
  },
  /* 2 — Purple Haze */
  {
    bgTop: '#171b36', bgMid: '#4d426d', bgAccent: '#b26967', bgBottom: '#f6a16d',
    horizonGlow: 'rgba(255,170,117,0.74)', horizonHaze: 'rgba(244,203,166,0.30)',
    sunCore: '#ffe0b2', sunMid: 'rgba(255,224,178,0.92)', sunFade: 'rgba(255,182,129,0.48)',
    glowCore: 'rgba(255,206,155,0.34)', glowFade: 'rgba(233,160,113,0.18)',
    textMain: '#fff5ec', textSoft: 'rgba(255,245,236,0.78)',
    cardBorderX: 'rgba(255,241,233,0.14)', cardBgA: 'rgba(28,24,50,0.36)',
    cardBgB: 'rgba(18,16,35,0.22)', shadow: '0 24px 80px rgba(11,11,27,0.48)',
    focus: '#ffe0b0',
  },
  /* 3 — Nautical Twilight */
  {
    bgTop: '#071423', bgMid: '#15304d', bgAccent: '#3b5a78', bgBottom: '#d18a62',
    horizonGlow: 'rgba(255,164,113,0.44)', horizonHaze: 'rgba(162,193,226,0.18)',
    sunCore: '#ffd3a3', sunMid: 'rgba(255,211,163,0.60)', sunFade: 'rgba(255,160,104,0.26)',
    glowCore: 'rgba(155,193,255,0.18)', glowFade: 'rgba(255,165,115,0.11)',
    textMain: '#f7f2e8', textSoft: 'rgba(247,242,232,0.74)',
    cardBorderX: 'rgba(234,241,250,0.13)', cardBgA: 'rgba(9,21,38,0.44)',
    cardBgB: 'rgba(7,14,29,0.28)', shadow: '0 24px 80px rgba(2,9,18,0.58)',
    focus: '#ffd6a0',
  },
  /* 4 — Astronomical Night */
  {
    bgTop: '#030711', bgMid: '#0d1630', bgAccent: '#18274d', bgBottom: '#3b3356',
    horizonGlow: 'rgba(141,121,205,0.22)', horizonHaze: 'rgba(121,154,210,0.12)',
    sunCore: '#dfe8ff', sunMid: 'rgba(183,205,255,0.30)', sunFade: 'rgba(123,139,205,0.12)',
    glowCore: 'rgba(150,172,255,0.16)', glowFade: 'rgba(119,92,195,0.09)',
    textMain: '#f6f3ee', textSoft: 'rgba(246,243,238,0.72)',
    cardBorderX: 'rgba(234,238,248,0.11)', cardBgA: 'rgba(7,12,25,0.54)',
    cardBgB: 'rgba(4,8,17,0.36)', shadow: '0 24px 80px rgba(0,0,0,0.65)',
    focus: '#d8e3ff',
  },
];

/* ==========================================================================
   THEME UTILITIES
   ========================================================================== */

/** Convert camelCase key → CSS custom property name (e.g. bgTop → --bg-top) */
function toCssVar(key) {
  return '--' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
}

/** Write all theme values to :root CSS custom properties */
function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    let cssKey = key;
    // Rename cardBorderX → cardBorder to match the CSS variable --card-border
    if (key === 'cardBorderX') cssKey = 'cardBorder';
    root.style.setProperty(toCssVar(cssKey), value);
  });
}

/* ==========================================================================
   TEXT SCRAMBLE
   Character-decode effect: characters start randomised, then lock in
   left-to-right to reveal the final string.
   ========================================================================== */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:·';
    this.queue = [];
    this.frame = 0;
    this.animId = null;
    this.resolve = null;
  }

  /**
   * Animate element's text from current content → newText.
   * Returns a Promise that resolves when the animation completes.
   */
  setText(newText) {
    const oldText = this.el.textContent;
    const len = Math.max(oldText.length, newText.length);

    return new Promise(resolve => {
      this.resolve = resolve;
      this.queue = [];

      for (let i = 0; i < len; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 8);
        const end = start + Math.floor(Math.random() * 14) + 4;
        this.queue.push({ from, to, start, end, char: '' });
      }

      cancelAnimationFrame(this.animId);
      this.frame = 0;
      this.tick();
    });
  }

  tick() {
    let output = '';
    let complete = 0;

    for (let i = 0, q = this.queue; i < q.length; i++) {
      const { to, start, end } = q[i];
      let { char } = q[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        // Occasionally re-randomise the scramble char
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          q[i].char = char;
        }
        // Wrap in span so CSS can dim scramble chars differently from final chars
        output += `<span class="scramble-char" aria-hidden="true">${char}</span>`;
      } else {
        output += q[i].from;
      }
    }

    this.el.innerHTML = output;
    this.frame++;

    if (complete === this.queue.length) {
      // Write clean textContent (no spans) and resolve
      this.el.textContent = this.queue.map(q => q.to).join('');
      if (this.resolve) this.resolve();
    } else {
      this.animId = requestAnimationFrame(() => this.tick());
    }
  }
}

/* ==========================================================================
   GOD RAYS — crepuscular light shafts emanating from the virtual sun
   Uses Canvas 2D with triangular rays on a transparent background so
   mix-blend-mode: screen in CSS lets them illuminate without darkening.
   ========================================================================== */
class GodRays {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.animId = null;

    // Theme-adaptive ray tint — parsed from CSS custom properties
    this.rayRgb = [255, 218, 148]; // fallback: warm amber
    this.rayFadeRgb = [255, 170, 100];

    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);

    window.addEventListener('resize', this.resize, { passive: true });
    this.resize();
    this.generateRays();
    this.updateColors();
    this.tick();
  }

  /** Parse a CSS color string into [r, g, b] or return the given fallback. */
  static parseRgb(str, fallback) {
    if (!str) return fallback;
    // Handle hex (#rrggbb)
    const hex = str.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
    if (hex) return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
    // Handle rgb()/rgba()
    const rgb = str.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
    return fallback;
  }

  /** Read --sun-core and --glow-fade from :root to tint rays per theme. */
  updateColors() {
    const styles = getComputedStyle(document.documentElement);
    this.rayRgb = GodRays.parseRgb(styles.getPropertyValue('--sun-core').trim(), [255, 218, 148]);
    this.rayFadeRgb = GodRays.parseRgb(styles.getPropertyValue('--glow-fade').trim(), [255, 170, 100]);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    // Sun sits at horizontal centre, 82% down the viewport
    this.sunX = this.canvas.width / 2;
    this.sunY = this.canvas.height * 0.82;
  }

  generateRays() {
    const count = 22;
    this.rays = Array.from({ length: count }, (_, i) => ({
      // Spread rays 195°–345° (straight up = 270°) to fan only above the horizon
      angle: (195 + (i / (count - 1)) * 150) * (Math.PI / 180),
      halfWidth: (Math.random() * 4 + 1.2) * (Math.PI / 180),
      alpha: Math.random() * 0.05 + 0.01,
      phase: Math.random() * Math.PI * 2,
      // Slightly different speeds give organic, asynchronous pulsing
      speed: (Math.random() * 0.28 + 0.08) * 0.001,
    }));
  }

  drawRay(ray) {
    const { ctx, sunX, sunY, canvas, time, rayRgb, rayFadeRgb } = this;

    // Pulsing alpha — makes rays feel like light filtering through clouds
    const pulse = 0.55 + 0.45 * Math.sin(time * ray.speed + ray.phase);
    const alpha = ray.alpha * pulse;
    if (alpha < 0.005) return; // skip invisible rays for performance

    const diag = Math.hypot(canvas.width, canvas.height) * 1.25;
    const a = ray.angle;
    const hw = ray.halfWidth;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(a - hw) * diag, sunY + Math.sin(a - hw) * diag);
    ctx.lineTo(sunX + Math.cos(a + hw) * diag, sunY + Math.sin(a + hw) * diag);
    ctx.closePath();

    // Gradient fades the ray's intensity with distance from the sun
    const endX = sunX + Math.cos(a) * diag * 0.55;
    const endY = sunY + Math.sin(a) * diag * 0.55;
    const [r, g, b] = rayRgb;
    const [fr, fg, fb] = rayFadeRgb;
    const midR = Math.round((r + fr) / 2);
    const midG = Math.round((g + fg) / 2);
    const midB = Math.round((b + fb) / 2);
    const grad = ctx.createLinearGradient(sunX, sunY, endX, endY);
    grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(0.35, `rgba(${midR},${midG},${midB},${alpha * 0.45})`);
    grad.addColorStop(1, `rgba(${fr},${fg},${fb},0)`);

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  tick() {
    this.time++;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.rays.forEach(r => this.drawRay(r));
    this.animId = requestAnimationFrame(this.tick);
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.resize);
  }
}

/* ==========================================================================
   PARTICLE SYSTEM — floating dust motes drifting upward
   DOM-based (no secondary canvas) so particles inherit theme colours via CSS.
   ========================================================================== */
class ParticleSystem {
  constructor(container) {
    this.container = container;
    // Fewer particles on mobile to preserve performance
    this.count = window.matchMedia('(max-width: 640px)').matches ? 10 : 22;
    this.init();
  }

  buildParticle() {
    const el = document.createElement('span');
    el.className = 'particle';

    const size = Math.random() * 2.5 + 0.7;
    const x = Math.random() * 100;       // % from left
    const bottom = Math.random() * 35 + 5;    // % from bottom
    const duration = Math.random() * 12 + 8;    // seconds
    const delay = -(Math.random() * duration); // negative = already mid-flight
    const drift = (Math.random() - 0.5) * 70; // px horizontal drift

    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}%;
      bottom: ${bottom}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${Math.random() * 0.55 + 0.2};
      --drift: ${drift}px;
    `;
    return el;
  }

  init() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.count; i++) frag.appendChild(this.buildParticle());
    this.container.appendChild(frag);
  }
}

/* ==========================================================================
   MAGNETIC BUTTONS — buttons drift toward the cursor when nearby
   ========================================================================== */
class MagneticButtons {
  constructor(selector) {
    this.buttons = [...document.querySelectorAll(selector)];
    this.strength = 0.38; // how strongly buttons pull toward cursor (0–1)
    this.radius = 80;   // px proximity threshold
    this.init();
  }

  init() {
    // Single shared mousemove handler — avoids N×2 global listeners
    document.addEventListener('mousemove', e => {
      for (const btn of this.buttons) {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < this.radius) {
          const pull = (1 - dist / this.radius) * this.strength;
          btn.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
          const icon = btn.querySelector('svg');
          if (icon) {
            icon.style.transform = `translate(${dx * pull * 0.3}px, ${dy * pull * 0.3}px) scale(1.14)`;
          }
        } else {
          btn.style.transform = '';
          const icon = btn.querySelector('svg');
          if (icon) icon.style.transform = '';
        }
      }
    });

    // Spring back when mouse leaves each button
    this.buttons.forEach(btn => {
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        const icon = btn.querySelector('svg');
        if (icon) icon.style.transform = '';
      });
    });
  }
}

/* ==========================================================================
   BUTTON RIPPLE — tactile click feedback
   Injects a scaling circle at click position, then removes it.
   ========================================================================== */
class ButtonRipple {
  constructor(selector) {
    this.buttons = [...document.querySelectorAll(selector)];
    this.init();
  }

  init() {
    this.buttons.forEach(btn => {
      btn.addEventListener('click', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);

        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        ripple.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${x - size / 2}px;
          top: ${y - size / 2}px;
        `;

        btn.appendChild(ripple);
        // Clean up after animation
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }
}

/* ==========================================================================
   STAR BURST — delight moment on theme cycle
   Spawns tiny particles from a button center that radiate outward and fade.
   ========================================================================== */
class StarBurst {
  static emit(button, count = 10) {
    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 28 + Math.random() * 32; // px travel distance
      const bx = Math.cos(angle) * dist;
      const by = Math.sin(angle) * dist;

      const dot = document.createElement('span');
      dot.className = 'star-burst-particle';
      dot.style.cssText = `
        left: ${cx}px;
        top: ${cy}px;
        --burst-x: ${bx}px;
        --burst-y: ${by}px;
        animation-delay: ${Math.random() * 0.08}s;
      `;
      document.body.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    }
  }
}

/* ==========================================================================
   CARD TILT — 3D perspective tilt following the cursor inside the card.

   Implementation detail:
   We start the card with opacity:0 + translateY via inline style (set in HTML).
   On init, clearing those inline styles triggers the CSS transition defined in
   styles.css (.verse-card { transition: opacity … transform … }).
   After the entrance completes, the card's inline style is empty, so JS can
   freely write perspective rotations without fighting a fill-mode animation.
   ========================================================================== */
class CardTilt {
  constructor(card) {
    this.card = card;
    this.spotlight = card.querySelector('.card-spotlight');
    this.maxTilt = 5; // degrees

    this.onMove = this.onMove.bind(this);
    this.onLeave = this.onLeave.bind(this);

    card.addEventListener('mousemove', this.onMove);
    card.addEventListener('mouseleave', this.onLeave);
  }

  onMove(e) {
    const rect = this.card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2); // -1 … +1
    const dy = (e.clientY - cy) / (rect.height / 2); // -1 … +1

    const rotX = -dy * this.maxTilt;
    const rotY = dx * this.maxTilt;

    // transition: none so the tilt tracks the cursor instantly
    this.card.style.transition = 'none';
    this.card.style.transform =
      `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;

    // Update card spotlight coordinates
    if (this.spotlight) {
      this.card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      this.card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
  }

  onLeave() {
    // Restore transition for smooth spring-back to flat
    this.card.style.transition = 'transform var(--duration-mid) var(--ease-out)';
    this.card.style.transform = '';

    setTimeout(() => {
      // Clear transition so entrance/loading transforms aren't affected later
      if (!this.card.classList.contains('is-loading')) {
        this.card.style.transition = '';
      }
    }, 250);
  }
}

/* ==========================================================================
   VERSE APP — orchestrates data fetching, animations, and user actions
   ========================================================================== */
class VerseApp {
  constructor() {
    this.bookEl = document.getElementById('verseBook');
    this.numEl = document.getElementById('verseNum');
    this.contentEl = document.getElementById('verse-content');
    this.card = document.getElementById('verseCard');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.themeBtn = document.getElementById('themeBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.contextBtn = document.getElementById('contextBtn');

    this.bookScramble = new TextScramble(this.bookEl);
    this.numScramble = new TextScramble(this.numEl);

    this.themeIndex = 1; // start on Sunset Dusk
    this.isLoading = false;
    this.hasCompletedEntrance = false;
    this.isExpanded = false;
    this.currentVerseData = null;

    // Persist up to 15 verses for offline fallback
    this.cache = [];
    try {
      this.cache = JSON.parse(localStorage.getItem('vrs_cache') || '[]');
    } catch (e) {
      // Local storage disabled or unavailable
    }

    this.fallback = {
      reference: 'Matthew 11:28',
      content: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    };
  }

  /* ------------------------------------------------------------------
     Reference parsing — "1 Kings 3:16" → { book: "1 Kings", num: "3:16" }
  ------------------------------------------------------------------ */
  parseReference(ref) {
    const i = ref.lastIndexOf(' ');
    return i === -1
      ? { book: ref, num: '' }
      : { book: ref.slice(0, i), num: ref.slice(i + 1) };
  }

  /* ------------------------------------------------------------------
     Fetch a random verse from the public Bible API
  ------------------------------------------------------------------ */
  async fetchVerse() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch('https://bible-api.com/data/web/random', { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rv = data.random_verse;
      return {
        reference: `${rv.book} ${rv.chapter}:${rv.verse}`,
        content: rv.text.trim(),
      };
    } catch {
      return null; // caller handles null → fallback
    }
  }

  /* ------------------------------------------------------------------
     Main load routine — fetch, animate, display
  ------------------------------------------------------------------ */
  async loadVerse() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.card.classList.add('is-loading');
    this.refreshBtn.classList.add('is-spinning');

    let verse;

    if (!navigator.onLine && this.cache.length > 0) {
      // Offline: pull a random cached verse
      verse = this.cache[Math.floor(Math.random() * this.cache.length)];
    } else {
      verse = await this.fetchVerse();

      if (!verse) {
        verse = this.fallback;
      } else {
        // Keep cache fresh (FIFO, max 15)
        if (this.cache.length >= 15) this.cache.shift();
        this.cache.push(verse);
        try {
          localStorage.setItem('vrs_cache', JSON.stringify(this.cache));
        } catch {
          // localStorage may be unavailable (e.g. private browsing, storage quota exceeded)
        }
      }
    }

    this.currentVerseData = verse;
    const { book, num } = this.parseReference(verse.reference);

    // Reset expanded state
    this.isExpanded = false;
    if (this.contextBtn) {
      this.contextBtn.classList.remove('is-expanded');
      this.contextBtn.setAttribute('aria-label', 'Show surrounding context');
      this.contextBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>`;
    }

    // Scramble book name (uppercase) and chapter:verse simultaneously
    await Promise.all([
      this.bookScramble.setText(book.toUpperCase()),
      this.numScramble.setText(num),
    ]);

    // Fade in verse words sequentially
    this.animateWords(verse.content);

    this.card.classList.remove('is-loading');
    this.refreshBtn.classList.remove('is-spinning');
    this.isLoading = false;
  }

  /* ------------------------------------------------------------------
     Expand Context — fetches the chapter and gets surrounding verses
  ------------------------------------------------------------------ */
  async toggleContext() {
    if (this.isLoading) return;
    if (!this.currentVerseData) return;

    if (this.isExpanded) {
      // Restore original verse
      this.isLoading = true;
      this.card.classList.add('is-loading');

      const { num } = this.parseReference(this.currentVerseData.reference);
      await this.numScramble.setText(num);
      this.animateWords(this.currentVerseData.content);

      this.isExpanded = false;
      this.contextBtn.classList.remove('is-expanded');
      this.contextBtn.setAttribute('aria-label', 'Show surrounding context');
      this.contextBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>`;

      this.card.classList.remove('is-loading');
      this.isLoading = false;
      return;
    }

    // Expand
    const { book, num } = this.parseReference(this.currentVerseData.reference);
    const parts = num.split(':');
    if (parts.length !== 2) return;

    const chapterStr = parts[0];
    const targetVerseNum = parseInt(parts[1], 10);

    this.isLoading = true;
    this.contextBtn.classList.add('is-spinning');
    this.card.classList.add('is-loading');

    try {
      const fetchRef = `${book} ${chapterStr}`;
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(fetchRef)}?translation=web`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.verses) {
        let vIndex = data.verses.findIndex(v => v.verse === targetVerseNum);
        if (vIndex !== -1) {
          const start = Math.max(0, vIndex - 1);
          const end = Math.min(data.verses.length - 1, vIndex + 1);
          const block = data.verses.slice(start, end + 1);

          const fullText = block.map(v => v.text.trim()).join(' ');
          const firstVerse = block[0].verse;
          const lastVerse = block[block.length - 1].verse;

          const newNum = firstVerse === lastVerse ? `${chapterStr}:${firstVerse}` : `${chapterStr}:${firstVerse}-${lastVerse}`;

          await this.numScramble.setText(newNum);
          this.animateWords(fullText);

          this.isExpanded = true;
          this.contextBtn.classList.add('is-expanded');
          this.contextBtn.setAttribute('aria-label', 'Collapse context');
          this.contextBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>`;
        }
      }
    } catch {
      // Context fetch failed (network or API error) — leave current verse displayed
    }

    this.card.classList.remove('is-loading');
    this.contextBtn.classList.remove('is-spinning');
    this.isLoading = false;
  }

  /* ------------------------------------------------------------------
     Word-wave animation — wraps each word in a .word span with
     a staggered animation-delay, creating a ripple-in effect.
     Delay is capped so very long verses don't drag on forever.
  ------------------------------------------------------------------ */
  animateWords(text) {
    const words = text.split(' ');
    const cap = 1.25; // seconds — max total stagger duration

    const html = words.map((word, i) => {
      const delay = Math.min(i * 0.045, cap);
      return `<span class="word-wrapper"><span class="word" style="animation-delay:${delay}s">${word}</span></span> `;
    }).join('');

    this.contentEl.innerHTML = html;

    // Re-evaluate overflow after words render (rAF so layout is committed)
    requestAnimationFrame(() => this._syncScrollState());
  }

  /* ------------------------------------------------------------------
     Scroll-overflow helpers — drives the data-overflows attribute and
     is-scrolled-end class that control the CSS fade mask on verse text.
  ------------------------------------------------------------------ */
  _syncScrollState() {
    const el = this.contentEl;
    const overflows = el.scrollHeight > el.clientHeight + 2; // 2px fuzz

    // Reset scroll position whenever new content loads
    el.scrollTop = 0;

    if (overflows) {
      el.setAttribute('data-overflows', '');
      el.classList.remove('is-scrolled-end');

      // Lazy-attach the scroll listener only once
      if (!this._scrollListenerAttached) {
        el.addEventListener('scroll', () => this._onVerseScroll(), { passive: true });
        this._scrollListenerAttached = true;
      }
    } else {
      el.removeAttribute('data-overflows');
      el.classList.remove('is-scrolled-end');
    }
  }

  _onVerseScroll() {
    const el = this.contentEl;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 4; // 4px fuzz
    el.classList.toggle('is-scrolled-end', atEnd);
  }

  /* ------------------------------------------------------------------
     Theme system — cycle through palettes with a crossfade
  ------------------------------------------------------------------ */
  cycleTheme() {
    this.themeIndex = (this.themeIndex + 1) % themes.length;
    const theme = themes[this.themeIndex];

    // Brief transition on :root so gradient crossfades smoothly
    document.documentElement.style.transition = 'background 0.9s ease';
    applyTheme(theme);

    // Re-tint god rays to match the new palette
    if (this.godRays) this.godRays.updateColors();

    setTimeout(() => document.documentElement.style.transition = '', 950);
  }

  /* ------------------------------------------------------------------
     Share — native share sheet with clipboard fallback
  ------------------------------------------------------------------ */
  async shareVerse() {
    const ref = `${this.bookEl.textContent} ${this.numEl.textContent}`;
    const text = [...this.contentEl.querySelectorAll('.word')]
      .map(w => w.textContent)
      .join('')
      .trim();

    const payload = {
      title: ref,
      text: `${ref}\n\n"${text}"`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(`${payload.text}\n\n${payload.url}`);
        this.shareBtn.classList.add('shared');
        this.shareBtn.setAttribute('aria-label', 'Copied to clipboard!');
        setTimeout(() => {
          this.shareBtn.classList.remove('shared');
          this.shareBtn.setAttribute('aria-label', 'Share this verse');
        }, 2200);
      }
    } catch {
      // User cancelled share or clipboard blocked — fail silently
    }
  }

  /* ------------------------------------------------------------------
     Event wiring
  ------------------------------------------------------------------ */
  setupInteractions() {
    // Refresh
    this.refreshBtn.addEventListener('click', async () => {
      if (this.isLoading) return;
      this.cycleTheme();
      await this.loadVerse();
    });

    // Theme cycle (standalone, no verse reload) — with star burst delight
    this.themeBtn.addEventListener('click', () => {
      this.cycleTheme();
      StarBurst.emit(this.themeBtn, 10);
    });

    // Expand context
    if (this.contextBtn) {
      this.contextBtn.addEventListener('click', () => this.toggleContext());
    }

    // Share
    this.shareBtn.addEventListener('click', () => this.shareVerse());

    // Swipe-up gesture for mobile refresh
    let touchStartY = 0;
    document.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dy < -70 && !this.isLoading) this.refreshBtn.click();
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Entrance — orchestrated cinematic reveal sequence
     1. Loader fades out
     2. Card fades up (CSS transition via inline style removal)
     3. Inner elements cascade in (CSS entrance-play class)
  ------------------------------------------------------------------ */
  revealCard() {
    // Mark card children as ready for entrance (hidden via CSS)
    this.card.classList.add('entrance-ready');

    // Two rAFs guarantee a paint has happened before the transition starts
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Trigger card fade-up
        this.card.style.opacity = '';
        this.card.style.transform = '';

        // After card settles, trigger the inner cascade
        setTimeout(() => {
          this.card.classList.add('entrance-play');
          this.hasCompletedEntrance = true;
        }, 400);
      });
    });
  }

  /* ------------------------------------------------------------------
     Init
  ------------------------------------------------------------------ */
  async init() {
    applyTheme(themes[this.themeIndex]);
    this.setupInteractions();

    // Wait for fonts before revealing
    await document.fonts.ready;

    // Dismiss the page loader
    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.classList.add('is-hidden');
      // Remove from DOM after transition
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }

    // Begin entrance
    this.revealCard();
    await this.loadVerse();
  }
}

/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */
function bootstrap() {
  /* God rays */
  let godRays = null;
  const canvas = document.getElementById('canvasRays');
  if (canvas) godRays = new GodRays(canvas);

  /* Particles */
  const pContainer = document.getElementById('particles');
  if (pContainer) new ParticleSystem(pContainer);

  /* Magnetic pull on buttons */
  new MagneticButtons('[data-magnetic]');

  /* Button ripple feedback */
  new ButtonRipple('[data-magnetic]');

  /* 3D card tilt */
  const card = document.getElementById('verseCard');
  if (card) {
    new CardTilt(card);
  }

  /* Main app — pass god rays reference for theme-adaptive tinting */
  const app = new VerseApp();
  app.godRays = godRays;
  app.init();
}

/* Kick off after DOM is ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}