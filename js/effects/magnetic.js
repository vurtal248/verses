/* ==========================================================================
   MAGNETIC BUTTONS — buttons drift toward the cursor when nearby
   ========================================================================== */
export class MagneticButtons {
  constructor(selector) {
    this.buttons = [...document.querySelectorAll(selector)];
    this.strength = 0.38;
    this.radius = 80;
    this.init();
  }

  init() {
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
   ========================================================================== */
export class ButtonRipple {
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
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }
}

/* ==========================================================================
   STAR BURST — delight moment on theme cycle
   ========================================================================== */
export class StarBurst {
  static emit(button, count = 10) {
    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 28 + Math.random() * 32;
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
