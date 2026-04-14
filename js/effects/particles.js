/* ==========================================================================
   PARTICLE SYSTEM — ambient dust motes drifting upward
   DOM-based so particles inherit theme colours via CSS custom properties.
   ========================================================================== */
export class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.count = window.matchMedia('(max-width: 640px)').matches ? 10 : 22;
    this.init();
  }

  buildParticle() {
    const el = document.createElement('span');
    el.className = 'particle';

    const size = Math.random() * 2.5 + 0.7;
    const x = Math.random() * 100;
    const bottom = Math.random() * 35 + 5;
    const duration = Math.random() * 12 + 8;
    const delay = -(Math.random() * duration);
    const drift = (Math.random() - 0.5) * 70;

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
