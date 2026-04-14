/* ==========================================================================
   TEXT SCRAMBLE — character-decode entrance effect
   Characters start randomised, then lock in left-to-right.
   ========================================================================== */
export class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:·';
    this.queue = [];
    this.frame = 0;
    this.animId = null;
    this.resolve = null;
  }

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
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          q[i].char = char;
        }
        output += `<span class="scramble-char" aria-hidden="true">${char}</span>`;
      } else {
        output += q[i].from;
      }
    }

    this.el.innerHTML = output;
    this.frame++;

    if (complete === this.queue.length) {
      this.el.textContent = this.queue.map(q => q.to).join('');
      if (this.resolve) this.resolve();
    } else {
      this.animId = requestAnimationFrame(() => this.tick());
    }
  }
}
