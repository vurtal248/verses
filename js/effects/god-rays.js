/* ==========================================================================
   GOD RAYS — crepuscular light shafts from a virtual sun
   Canvas 2D with triangular rays; mix-blend-mode: screen in CSS.
   ========================================================================== */
export class GodRays {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.animId = null;
    this.rayRgb = [255, 218, 148];
    this.rayFadeRgb = [255, 170, 100];

    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);

    window.addEventListener('resize', this.resize, { passive: true });
    this.resize();
    this.generateRays();
    this.updateColors();
    this.tick();
  }

  static parseRgb(str, fallback) {
    if (!str) return fallback;
    const hex = str.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
    if (hex) return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
    const rgb = str.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
    return fallback;
  }

  updateColors() {
    const styles = getComputedStyle(document.documentElement);
    this.rayRgb = GodRays.parseRgb(styles.getPropertyValue('--sun-core').trim(), [255, 218, 148]);
    this.rayFadeRgb = GodRays.parseRgb(styles.getPropertyValue('--glow-fade').trim(), [255, 170, 100]);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.sunX = this.canvas.width / 2;
    this.sunY = this.canvas.height * 0.82;
  }

  generateRays() {
    const count = 22;
    this.rays = Array.from({ length: count }, (_, i) => ({
      angle: (195 + (i / (count - 1)) * 150) * (Math.PI / 180),
      halfWidth: (Math.random() * 4 + 1.2) * (Math.PI / 180),
      alpha: Math.random() * 0.05 + 0.01,
      phase: Math.random() * Math.PI * 2,
      speed: (Math.random() * 0.28 + 0.08) * 0.001,
    }));
  }

  drawRay(ray) {
    const { ctx, sunX, sunY, canvas, time, rayRgb, rayFadeRgb } = this;
    const pulse = 0.55 + 0.45 * Math.sin(time * ray.speed + ray.phase);
    const alpha = ray.alpha * pulse;
    if (alpha < 0.005) return;

    const diag = Math.hypot(canvas.width, canvas.height) * 1.25;
    const a = ray.angle;
    const hw = ray.halfWidth;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(a - hw) * diag, sunY + Math.sin(a - hw) * diag);
    ctx.lineTo(sunX + Math.cos(a + hw) * diag, sunY + Math.sin(a + hw) * diag);
    ctx.closePath();

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
