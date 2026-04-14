/* ==========================================================================
   MAIN — Bootstrap entry point for Verses v2
   Uses native ES modules; no bundler required.
   ========================================================================== */

import { GodRays } from './effects/god-rays.js';
import { ParticleSystem } from './effects/particles.js';
import { ButtonRipple } from './effects/magnetic.js';
import { VerseApp } from './verse-app.js';

function bootstrap() {
  /* God rays */
  let godRays = null;
  const canvas = document.getElementById('canvasRays');
  if (canvas) godRays = new GodRays(canvas);

  /* Particles */
  const pContainer = document.getElementById('particles');
  if (pContainer) new ParticleSystem(pContainer);

  /* Button ripple feedback */
  new ButtonRipple('[data-magnetic]');

  /* Main app */
  const app = new VerseApp();
  app.godRays = godRays;
  app.init();

  /* Service worker registration (PWA, Phase 4) */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // SW registration failed — app still works without it
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
