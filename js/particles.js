const ParticleSystem = {
  canvas: null,
  ctx: null,
  particles: [],
  animFrame: null,
  mouse: { x: -9999, y: -9999 },

  init() {
    // Disabled — particles removed
    return;
    this.canvas = document.getElementById('particles');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.particles.length) {
      this.particles = [];
      this.createParticles();
    }
  },

  createParticles() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 15000);
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  },

  createParticle(x, y) {
    return {
      x: x ?? Math.random() * window.innerWidth,
      y: y ?? Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    };
  },

  getAccentColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#00d4ff';
  },

  animate() {
    this.animFrame = requestAnimationFrame(() => this.animate());
    const { ctx, canvas, particles, mouse } = this;
    const accentColor = this.getAccentColor();
    const accentRgba = (a) => hexToRgba(accentColor, a);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x -= (dx / dist) * 0.8;
        p.y -= (dy / dist) * 0.8;
      }

      const opacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = accentRgba(opacity);
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx2 = p.x - p2.x;
        const dy2 = p.y - p2.y;
        const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (d2 < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = accentRgba(0.08 * (1 - d2 / 100));
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
  }
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

document.addEventListener('DOMContentLoaded', () => ParticleSystem.init());
