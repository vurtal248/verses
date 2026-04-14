/* ==========================================================================
   VERSE APP v2 — orchestrates data fetching, animations, and user actions
   ========================================================================== */

import { TextScramble } from './effects/text-scramble.js';
import { StarBurst } from './effects/magnetic.js';
import { themes, applyTheme, getAutoThemeIndex, blendThemes } from './themes.js';
import { cache, favorites, themeOverride, planProgress } from './store.js';

const PLANS = {
  'psalms-7': { label: 'Psalms', file: './plans/psalms-7.json' },
  'proverbs-7': { label: 'Proverbs', file: './plans/proverbs-7.json' },
};

export class VerseApp {
  constructor() {
    // Core DOM refs
    this.bookEl = document.getElementById('verseBook');
    this.numEl = document.getElementById('verseNum');
    this.contentEl = document.getElementById('verse-content');
    this.card = document.getElementById('verseCard');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.themeBtn = document.getElementById('themeBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.contextBtn = document.getElementById('contextBtn');
    this.bookmarkBtn = document.getElementById('bookmarkBtn');
    this.historyPrev = document.getElementById('historyPrev');
    this.historyNext = document.getElementById('historyNext');
    this.historyDots = document.getElementById('historyDots');
    this.favDrawer = document.getElementById('favoritesDrawer');
    this.favList = document.getElementById('favList');
    this.favTrigger = document.getElementById('favTrigger');
    this.favClose = document.getElementById('favDrawerClose');
    this.planChip = document.getElementById('planChip');
    this.planMenu = document.getElementById('planMenu');
    this.planProgress = document.getElementById('planProgressBar');
    this.timeIndicator = document.getElementById('timeIndicator');

    // Scramble instances
    this.bookScramble = new TextScramble(this.bookEl);
    this.numScramble = new TextScramble(this.numEl);

    // Theme state
    // Start with auto-theme, overriding with session selection if present
    this.themeIndex = themeOverride.get() ?? getAutoThemeIndex();
    this.autoTheme = themeOverride.get() === null; // true = following time

    // Loading / entrance flags
    this.isLoading = false;
    this.hasCompletedEntrance = false;
    this.isExpanded = false;
    this.currentVerseData = null;

    // Verse history: circular buffer, max 20 entries
    this.history = [];
    this.historyPos = -1; // current index in history

    // Offline fallback
    this.fallback = {
      reference: 'Matthew 11:28',
      content: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    };

    // God rays ref (injected from outside)
    this.godRays = null;

    // Active reading plan data
    this.planData = null;
    this.activePlanId = null;
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
      return null;
    }
  }

  /* ------------------------------------------------------------------
     Main load routine — fetch or pick from plan, animate, display
  ------------------------------------------------------------------ */
  async loadVerse(fromHistory = false) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.isExpanded = false;

    this.card.classList.add('is-loading');
    this.refreshBtn.classList.add('is-spinning');

    let verse;

    // Reading plan takes priority
    if (this.activePlanId && this.planData) {
      const progress = planProgress.get();
      const idx = (progress && progress.planId === this.activePlanId) ? progress.currentIndex : 0;
      const capped = Math.min(idx, this.planData.length - 1);
      verse = this.planData[capped];
      this.updatePlanProgress(capped);
    } else if (!fromHistory) {
      if (!navigator.onLine && cache.get().length > 0) {
        const c = cache.get();
        verse = c[Math.floor(Math.random() * c.length)];
      } else {
        verse = await this.fetchVerse();
        if (!verse) {
          verse = this.fallback;
        } else {
          cache.push(verse);
        }
      }
    }

    this.currentVerseData = verse;

    // Reset context button
    this._resetContextBtn();

    // Push to history (only for fresh fetches, not plan or back-navigation)
    if (!fromHistory && verse) {
      // Trim forward if we navigated back then loaded new
      if (this.historyPos < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyPos + 1);
      }
      this.history.push({ ...verse, themeIndex: this.themeIndex });
      if (this.history.length > 20) this.history.shift();
      this.historyPos = this.history.length - 1;
      this._updateHistoryUI();
    }

    // Animate reference + verse text
    const { book, num } = this.parseReference(verse.reference);
    await Promise.all([
      this.bookScramble.setText(book.toUpperCase()),
      this.numScramble.setText(num),
    ]);
    this.animateWords(verse.content);

    // Update bookmark state
    this._updateBookmarkBtn(verse.reference);

    this.card.classList.remove('is-loading');
    this.refreshBtn.classList.remove('is-spinning');
    this.isLoading = false;
  }

  /* ------------------------------------------------------------------
     History navigation — step back / forward through seen verses
  ------------------------------------------------------------------ */
  async navigateHistory(direction) {
    const newPos = this.historyPos + direction;
    if (newPos < 0 || newPos >= this.history.length) return;
    this.historyPos = newPos;

    const entry = this.history[this.historyPos];
    this.currentVerseData = entry;
    this.isLoading = true;
    this.isExpanded = false;
    this.card.classList.add('is-loading');
    this._resetContextBtn();

    const { book, num } = this.parseReference(entry.reference);
    await Promise.all([
      this.bookScramble.setText(book.toUpperCase()),
      this.numScramble.setText(num),
    ]);
    this.animateWords(entry.content);
    this._updateBookmarkBtn(entry.reference);
    this._updateHistoryUI();

    this.card.classList.remove('is-loading');
    this.isLoading = false;
  }

  _updateHistoryUI() {
    if (!this.historyDots) return;
    const total = this.history.length;
    const pos = this.historyPos;

    // Generate dots
    const maxDots = 7;
    const shown = Math.min(total, maxDots);
    let dots = '';
    for (let i = 0; i < shown; i++) {
      const actualIdx = total <= maxDots ? i : Math.round(i * (total - 1) / (maxDots - 1));
      const active = actualIdx === pos ? ' is-active' : '';
      dots += `<span class="history-dot${active}" aria-hidden="true"></span>`;
    }
    this.historyDots.innerHTML = dots;
    this.historyDots.setAttribute('aria-label', `Verse ${pos + 1} of ${total}`);

    // Prev/next states
    if (this.historyPrev) this.historyPrev.disabled = pos <= 0;
    if (this.historyNext) this.historyNext.disabled = pos >= total - 1;
  }

  /* ------------------------------------------------------------------
     Context expand — fetch surrounding verses
  ------------------------------------------------------------------ */
  async toggleContext() {
    if (this.isLoading) return;
    if (!this.currentVerseData) return;

    if (this.isExpanded) {
      this.isLoading = true;
      this.card.classList.add('is-loading');
      const { num } = this.parseReference(this.currentVerseData.reference);
      await this.numScramble.setText(num);
      this.animateWords(this.currentVerseData.content);
      this.isExpanded = false;
      this._resetContextBtn();
      this.card.classList.remove('is-loading');
      this.isLoading = false;
      return;
    }

    const { book, num } = this.parseReference(this.currentVerseData.reference);
    const parts = num.split(':');
    if (parts.length !== 2) return;

    const chapterStr = parts[0];
    const targetVerseNum = parseInt(parts[1], 10);

    this.isLoading = true;
    this.contextBtn.classList.add('is-spinning');
    this.card.classList.add('is-loading');

    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(book + ' ' + chapterStr)}?translation=web`);
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
          const newNum = firstVerse === lastVerse
            ? `${chapterStr}:${firstVerse}`
            : `${chapterStr}:${firstVerse}–${lastVerse}`;

          await this.numScramble.setText(newNum);
          this.animateWords(fullText);

          this.isExpanded = true;
          this.contextBtn.classList.add('is-expanded');
          this.contextBtn.setAttribute('aria-label', 'Collapse context');
          this.contextBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 1 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>`;
        }
      }
    } catch {
      // Network/API error — leave current verse intact
    }

    this.card.classList.remove('is-loading');
    this.contextBtn.classList.remove('is-spinning');
    this.isLoading = false;
  }

  _resetContextBtn() {
    if (!this.contextBtn) return;
    this.contextBtn.classList.remove('is-expanded', 'is-spinning');
    this.contextBtn.setAttribute('aria-label', 'Show surrounding context');
    this.contextBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>`;
  }

  /* ------------------------------------------------------------------
     Word-wave animation — staggered ripple-in for verse text
  ------------------------------------------------------------------ */
  animateWords(text) {
    const words = text.split(' ');
    const cap = 1.25;

    const html = words.map((word, i) => {
      const delay = Math.min(i * 0.045, cap);
      return `<span class="word-wrapper"><span class="word" style="animation-delay:${delay}s">${word}</span></span> `;
    }).join('');

    this.contentEl.innerHTML = html;
  }

  /* ------------------------------------------------------------------
     Theme system — auto or manual cycle
  ------------------------------------------------------------------ */
  cycleTheme() {
    this.autoTheme = false;
    this.themeIndex = (this.themeIndex + 1) % themes.length;
    themeOverride.set(this.themeIndex);
    this._applyCurrentTheme();
  }

  _applyCurrentTheme() {
    const theme = themes[this.themeIndex];
    document.documentElement.style.transition = 'background 0.9s ease';
    applyTheme(theme);
    if (this.godRays) this.godRays.updateColors();
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 950);
    this._updateTimeIndicator();
  }

  applyAutoTheme() {
    if (!this.autoTheme) return;
    const idx = getAutoThemeIndex();
    if (idx !== this.themeIndex) {
      this.themeIndex = idx;
      this._applyCurrentTheme();
    }
  }

  /* ------------------------------------------------------------------
     Time indicator — small sun/moon badge showing which sky we're in
  ------------------------------------------------------------------ */
  _updateTimeIndicator() {
    if (!this.timeIndicator) return;
    const theme = themes[this.themeIndex];
    const icons = ['🌅', '☀️', '🌇', '🌆', '🌙'];
    const idx = themes.indexOf(theme);
    this.timeIndicator.textContent = icons[idx] ?? '✦';
    this.timeIndicator.setAttribute('title', theme.name);
  }

  /* ------------------------------------------------------------------
     Favorites drawer
  ------------------------------------------------------------------ */
  toggleFavorite() {
    if (!this.currentVerseData) return;
    const ref = this.currentVerseData.reference;

    if (favorites.has(ref)) {
      favorites.remove(ref);
      this._updateBookmarkBtn(ref);
    } else {
      const added = favorites.add(this.currentVerseData, this.themeIndex);
      if (added) {
        this._updateBookmarkBtn(ref);
        this._animateBookmarkSuccess();
      }
    }
    // Refresh drawer if open
    if (this.favDrawer && !this.favDrawer.hasAttribute('inert')) {
      this._renderFavoritesList();
    }
  }

  _updateBookmarkBtn(reference) {
    if (!this.bookmarkBtn) return;
    const saved = favorites.has(reference);
    this.bookmarkBtn.classList.toggle('is-saved', saved);
    this.bookmarkBtn.setAttribute('aria-label', saved ? 'Remove from collection' : 'Add to collection');
    this.bookmarkBtn.setAttribute('aria-pressed', String(saved));
  }

  _animateBookmarkSuccess() {
    if (!this.bookmarkBtn) return;
    this.bookmarkBtn.classList.add('pop');
    this.bookmarkBtn.addEventListener('animationend', () => {
      this.bookmarkBtn.classList.remove('pop');
    }, { once: true });
    StarBurst.emit(this.bookmarkBtn, 8);
  }

  openFavoritesDrawer() {
    if (!this.favDrawer) return;
    this._renderFavoritesList();
    this.favDrawer.removeAttribute('inert');
    this.favDrawer.classList.add('is-open');
    this.favDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');

    // Focus first focusable in drawer
    const firstBtn = this.favDrawer.querySelector('button, [href]');
    if (firstBtn) setTimeout(() => firstBtn.focus(), 50);
  }

  closeFavoritesDrawer() {
    if (!this.favDrawer) return;
    this.favDrawer.classList.remove('is-open');
    this.favDrawer.setAttribute('aria-hidden', 'true');
    this.favDrawer.setAttribute('inert', '');
    document.body.classList.remove('drawer-open');
    if (this.favTrigger) this.favTrigger.focus();
  }

  _renderFavoritesList() {
    if (!this.favList) return;
    const list = favorites.get();

    if (list.length === 0) {
      this.favList.innerHTML = `
        <li class="fav-empty">
          <span class="fav-empty__icon" aria-hidden="true">✦</span>
          <p>No verses saved yet.<br>Tap the bookmark to save a verse.</p>
        </li>`;
      return;
    }

    this.favList.innerHTML = list.map(fav => {
      const themeColor = themes[fav.themeIndex]?.sunCore ?? 'var(--sun-core)';
      return `
        <li class="fav-item" data-ref="${fav.reference}">
          <div class="fav-item__accent" style="background: ${themeColor}" aria-hidden="true"></div>
          <div class="fav-item__body">
            <p class="fav-item__ref">${fav.reference}</p>
            <p class="fav-item__text">${fav.content}</p>
          </div>
          <button class="fav-item__remove" data-ref="${fav.reference}" aria-label="Remove ${fav.reference} from collection" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </li>`;
    }).join('');

    // Wire remove buttons
    this.favList.querySelectorAll('.fav-item__remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const ref = btn.dataset.ref;
        favorites.remove(ref);
        if (this.currentVerseData?.reference === ref) {
          this._updateBookmarkBtn(ref);
        }
        this._renderFavoritesList();
      });
    });
  }

  /* ------------------------------------------------------------------
     Reading Plan
  ------------------------------------------------------------------ */
  async loadPlan(planId) {
    if (!PLANS[planId]) return;

    try {
      const res = await fetch(PLANS[planId].file);
      if (!res.ok) throw new Error();
      this.planData = await res.json();
      this.activePlanId = planId;

      const progress = planProgress.get();
      if (!progress || progress.planId !== planId) {
        planProgress.set(planId, 0);
      }

      // Update chip label
      if (this.planChip) {
        this.planChip.textContent = PLANS[planId].label;
        this.planChip.classList.add('is-active');
      }

      this.closePlanMenu();
      await this.loadVerse();
    } catch {
      // Plan fetch failed — continue with random verses
    }
  }

  clearPlan() {
    this.planData = null;
    this.activePlanId = null;
    planProgress.clear();
    if (this.planChip) {
      this.planChip.textContent = 'Plans';
      this.planChip.classList.remove('is-active');
    }
    if (this.planProgress) {
      this.planProgress.style.transform = 'scaleX(0)';
    }
  }

  updatePlanProgress(idx) {
    if (!this.planProgress || !this.planData) return;
    const pct = (idx + 1) / this.planData.length;
    this.planProgress.style.transform = `scaleX(${pct})`;
    this.planProgress.setAttribute('aria-valuenow', Math.round(pct * 100));
  }

  openPlanMenu() {
    if (!this.planMenu) return;
    this.planMenu.classList.add('is-open');
    this.planMenu.removeAttribute('inert');
  }

  closePlanMenu() {
    if (!this.planMenu) return;
    this.planMenu.classList.remove('is-open');
    this.planMenu.setAttribute('inert', '');
  }

  /* ------------------------------------------------------------------
     Share — native sheet with clipboard fallback
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
      // User cancelled or clipboard blocked
    }
  }

  /* ------------------------------------------------------------------
     Event wiring
  ------------------------------------------------------------------ */
  setupInteractions() {
    // Refresh (+ auto-theme evolution on new verse)
    this.refreshBtn.addEventListener('click', async () => {
      if (this.isLoading) return;
      this.cycleTheme();
      this.autoTheme = false; // manual cycle disables auto until next visit
      await this.loadVerse();
    });

    // Theme cycle (standalone)
    this.themeBtn.addEventListener('click', () => {
      this.cycleTheme();
      StarBurst.emit(this.themeBtn, 10);
    });

    // Context expand / collapse
    if (this.contextBtn) {
      this.contextBtn.addEventListener('click', () => this.toggleContext());
    }

    // Bookmark toggle
    if (this.bookmarkBtn) {
      this.bookmarkBtn.addEventListener('click', () => this.toggleFavorite());
    }

    // Share
    this.shareBtn.addEventListener('click', () => this.shareVerse());

    // History navigation
    if (this.historyPrev) {
      this.historyPrev.addEventListener('click', () => {
        if (!this.isLoading) this.navigateHistory(-1);
      });
    }
    if (this.historyNext) {
      this.historyNext.addEventListener('click', () => {
        if (!this.isLoading) this.navigateHistory(1);
      });
    }

    // Keyboard: arrow keys for history, Escape to close drawer/menu
    document.addEventListener('keydown', e => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'ArrowLeft') this.navigateHistory(-1);
      if (e.key === 'ArrowRight') this.navigateHistory(1);
      if (e.key === 'Escape') {
        this.closeFavoritesDrawer();
        this.closePlanMenu();
      }
    });

    // Favorites drawer
    if (this.favTrigger) {
      this.favTrigger.addEventListener('click', () => this.openFavoritesDrawer());
    }
    if (this.favClose) {
      this.favClose.addEventListener('click', () => this.closeFavoritesDrawer());
    }
    if (this.favDrawer) {
      // Click outside drawer panel to close
      this.favDrawer.addEventListener('click', e => {
        if (e.target === this.favDrawer) this.closeFavoritesDrawer();
      });
    }

    // Plan chip / menu
    if (this.planChip) {
      this.planChip.addEventListener('click', () => {
        if (this.planMenu?.classList.contains('is-open')) {
          this.closePlanMenu();
        } else {
          this.openPlanMenu();
        }
      });
    }
    if (this.planMenu) {
      this.planMenu.querySelectorAll('[data-plan]').forEach(btn => {
        btn.addEventListener('click', () => {
          const planId = btn.dataset.plan;
          if (planId === 'none') {
            this.clearPlan();
            this.closePlanMenu();
            this.loadVerse();
          } else {
            this.loadPlan(planId);
          }
        });
      });
      // Close on outside click
      document.addEventListener('click', e => {
        if (this.planMenu.classList.contains('is-open') &&
          !this.planMenu.contains(e.target) &&
          e.target !== this.planChip) {
          this.closePlanMenu();
        }
      });
    }

    // Swipe up for new verse (mobile)
    let touchStartY = 0;
    document.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dy < -70 && !this.isLoading && !document.body.classList.contains('drawer-open')) {
        this.refreshBtn.click();
      }
    }, { passive: true });

    // Auto-theme: check every minute
    setInterval(() => this.applyAutoTheme(), 60_000);
  }

  /* ------------------------------------------------------------------
     Entrance — cinematic reveal sequence
  ------------------------------------------------------------------ */
  revealCard() {
    this.card.classList.add('entrance-ready');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.card.style.opacity = '';
        this.card.style.transform = '';
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
    // Apply initial theme (auto or session override)
    applyTheme(themes[this.themeIndex]);
    this._updateTimeIndicator();

    this.setupInteractions();
    this._updateHistoryUI();

    // Ensure drawer/menu start inert
    if (this.favDrawer) {
      this.favDrawer.setAttribute('inert', '');
      this.favDrawer.setAttribute('aria-hidden', 'true');
    }
    if (this.planMenu) {
      this.planMenu.setAttribute('inert', '');
    }

    await document.fonts.ready;

    // Dismiss page loader
    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.classList.add('is-hidden');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }

    this.revealCard();
    await this.loadVerse();
  }
}
