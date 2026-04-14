/* ==========================================================================
   CARD TILT — 3D perspective tilt following cursor inside the card
   ========================================================================== */
export class CardTilt {
  constructor(card) {
    this.card = card;
    this.spotlight = card.querySelector('.card-spotlight');
    this.maxTilt = 5;

    this.onMove = this.onMove.bind(this);
    this.onLeave = this.onLeave.bind(this);

    card.addEventListener('mousemove', this.onMove);
    card.addEventListener('mouseleave', this.onLeave);
  }

  onMove(e) {
    const rect = this.card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    const rotX = -dy * this.maxTilt;
    const rotY = dx * this.maxTilt;

    this.card.style.transition = 'none';
    this.card.style.transform =
      `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;

    if (this.spotlight) {
      this.card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      this.card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
  }

  onLeave() {
    this.card.style.transition = 'transform var(--duration-mid) var(--ease-out)';
    this.card.style.transform = '';

    setTimeout(() => {
      if (!this.card.classList.contains('is-loading')) {
        this.card.style.transition = '';
      }
    }, 250);
  }
}
