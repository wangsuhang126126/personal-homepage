/**
 * Shooting Stars
 * Occasional meteor streaks across the background.
 * Reuses the #particles canvas (which is now idle).
 */
const ShootingStars = {
  canvas: null,
  ctx: null,
  stars: [],
  W: 0,
  H: 0,

  init() {
    this.canvas = document.getElementById('particles');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.scheduleNext();
    this.animate();
  },

  resize() {
    this.W = this.canvas.width  = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
  },

  // Spawn next star after a random 3–8 s pause
  scheduleNext() {
    setTimeout(() => {
      this.spawn();
      this.scheduleNext();
    }, 3000 + Math.random() * 5000);
  },

  spawn() {
    const angle = 0.38 + Math.random() * 0.28; // ~22–38° below horizontal
    const speed = 13 + Math.random() * 7;
    this.stars.push({
      x:       Math.random() * this.W * 0.70,
      y:       Math.random() * this.H * 0.45,
      vx:      Math.cos(angle) * speed,
      vy:      Math.sin(angle) * speed,
      tailLen: 90 + Math.random() * 90,
      maxLife: 50 + Math.floor(Math.random() * 30),
      life:    0,
    });
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);

    // Remove dead stars
    this.stars = this.stars.filter(s => s.life <= s.maxLife);

    for (const s of this.stars) {
      s.life++;
      s.x += s.vx;
      s.y += s.vy;

      // Opacity envelope: fast fade-in → cruise → fast fade-out
      const t = s.life / s.maxLife;
      const alpha = t < 0.15 ? t / 0.15
                  : t > 0.75 ? (1 - t) / 0.25
                  : 1;

      // Normalised direction for tail
      const len = Math.hypot(s.vx, s.vy);
      const tx = s.x - (s.vx / len) * s.tailLen;
      const ty = s.y - (s.vy / len) * s.tailLen;

      // Tail gradient: transparent → cyan tint → bright white tip
      const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
      grad.addColorStop(0,   `rgba(0,212,255,0)`);
      grad.addColorStop(0.5, `rgba(160,224,255,${alpha * 0.35})`);
      grad.addColorStop(1,   `rgba(255,255,255,${alpha * 0.95})`);

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Soft glow at the tip
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 5);
      glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
      glow.addColorStop(1, `rgba(0,212,255,0)`);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }
  },
};

document.addEventListener('DOMContentLoaded', () => ShootingStars.init());
