/**
 * Neural Network Background
 * Drifting nodes connected by weighted edges,
 * with energy pulses traveling along active connections.
 */
const NeuralNet = {
  canvas: null,
  ctx: null,
  nodes: [],
  pulses: [],
  frame: 0,
  animId: null,

  MAX_DIST: 200,
  PULSE_CHANCE: 0.00025,

  // ── User-controlled settings (persisted in localStorage) ──
  settings: {
    enabled: true,
    pulseOpacity: 0.55,   // 0–1
    pulseEnabled: true,
    nodeOpacity: 0.85,    // 0–1
    edgeOpacity: 0.85,    // 0–1
  },

  loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('wsh-fx') || '{}');
      Object.assign(this.settings, saved);
    } catch {}
  },

  saveSettings() {
    localStorage.setItem('wsh-fx', JSON.stringify(this.settings));
  },

  init() {
    this.loadSettings();
    this.canvas = document.getElementById('matrix');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.opacity = this.settings.enabled ? '1' : '0';
    this.resize();
    this.animate();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.buildNodes();
  },

  buildNodes() {
    const area  = this.canvas.width * this.canvas.height;
    const count = Math.max(30, Math.floor(area / 16000));
    this.nodes  = [];
    this.pulses = [];

    for (let i = 0; i < count; i++) {
      // ~15 % are "hub" nodes (larger, brighter)
      const isHub = Math.random() < 0.15;
      this.nodes.push({
        x:      Math.random() * this.canvas.width,
        y:      Math.random() * this.canvas.height,
        vx:     (Math.random() - 0.5) * (isHub ? 0.18 : 0.35),
        vy:     (Math.random() - 0.5) * (isHub ? 0.18 : 0.35),
        r:      isHub ? 3.5 : 1.6 + Math.random() * 1.2,
        phase:  Math.random() * Math.PI * 2,
        isHub,
        // color: alternate between accent (cyan) and accent2 (purple)
        hue:    Math.random() < 0.6 ? 'cyan' : 'purple',
        activeCooldown: 0,   // frames until next "spark" is allowed
      });
    }
  },

  spawnPulse(a, b) {
    // Swap direction randomly for visual variety
    const [src, dst] = Math.random() < 0.5 ? [a, b] : [b, a];
    this.pulses.push({
      sx: src.x, sy: src.y,
      tx: dst.x, ty: dst.y,
      t:  0,
      speed: 0.008 + Math.random() * 0.014,
      hue: src.hue,
    });
  },

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());
    this.frame++;
    const { ctx, canvas, nodes, pulses } = this;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // ── Colors ──────────────────────────────────────────
    const parseCssRgb = v => {
      const s = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
      if (s.startsWith('#') && s.length === 7) {
        return [parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16)];
      }
      const m = s.match(/\d+/g);
      return m ? [+m[0], +m[1], +m[2]] : null;
    };
    const fallbackCyan   = isDark ? [0, 212, 255]  : [0, 100, 180];
    const fallbackPurple = isDark ? [124, 58, 237] : [109, 40, 217];
    const C = {
      cyan:   parseCssRgb('--accent')  || fallbackCyan,
      purple: parseCssRgb('--accent2') || fallbackPurple,
      bg:     isDark ? [5, 10, 15]     : [240, 244, 248],
    };
    const rgba = ([r,g,b], a) => `rgba(${r},${g},${b},${a})`;

    // ── Clear ────────────────────────────────────────────
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── Update nodes ─────────────────────────────────────
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.phase += 0.018;
      if (n.activeCooldown > 0) n.activeCooldown--;

      // Soft bounce at edges
      if (n.x < 0)            { n.x = 0;            n.vx *= -1; }
      if (n.x > canvas.width) { n.x = canvas.width;  n.vx *= -1; }
      if (n.y < 0)            { n.y = 0;             n.vy *= -1; }
      if (n.y > canvas.height){ n.y = canvas.height; n.vy *= -1; }
    });

    // ── Draw edges + spawn pulses ─────────────────────────
    const MAX2 = this.MAX_DIST * this.MAX_DIST;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > MAX2) continue;

        const dist   = Math.sqrt(d2);
        const weight = 1 - dist / this.MAX_DIST;  // 0–1

        // Edge line: cyan side → purple gradient
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        const edgeAlpha = weight * (isDark ? 0.18 : 0.12) * this.settings.edgeOpacity;
        grad.addColorStop(0, rgba(C[a.hue], edgeAlpha));
        grad.addColorStop(1, rgba(C[b.hue], edgeAlpha));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = weight * (a.isHub || b.isHub ? 1.2 : 0.6);
        ctx.stroke();

        // Pulse spawn
        if (Math.random() < this.PULSE_CHANCE * weight) {
          this.spawnPulse(a, b);
        }
      }
    }

    // ── Draw nodes ────────────────────────────────────────
    nodes.forEach(n => {
      const glow = 0.5 + 0.5 * Math.sin(n.phase);
      const col  = C[n.hue];
      const baseAlpha = (n.isHub ? 0.75 + 0.25 * glow : 0.4 + 0.35 * glow) * this.settings.nodeOpacity;
      const radius    = n.r * (n.isHub ? 1 + 0.25 * glow : 0.9 + 0.2 * glow);

      // Outer halo
      const haloR = radius * (n.isHub ? 8 : 5);
      const halo  = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
      halo.addColorStop(0, rgba(col, isDark ? 0.12 * glow : 0.07 * glow));
      halo.addColorStop(1, rgba(col, 0));
      ctx.beginPath();
      ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(col, baseAlpha);
      ctx.fill();

      // Hub: extra inner ring
      if (n.isHub) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 2.5 + glow * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(col, 0.25 * glow);
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }
    });

    // ── Update & draw pulses ──────────────────────────────
    if (this.settings.pulseEnabled) {
      const po = this.settings.pulseOpacity;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }

        const ease = p.t < 0.5 ? 2 * p.t * p.t : -1 + (4 - 2 * p.t) * p.t;
        const x    = p.sx + (p.tx - p.sx) * ease;
        const y    = p.sy + (p.ty - p.sy) * ease;
        const col  = C[p.hue];
        const life = Math.sin(p.t * Math.PI);

        // Glow halo
        const pg = ctx.createRadialGradient(x, y, 0, x, y, 10);
        pg.addColorStop(0, rgba(col, life * 0.4 * po));
        pg.addColorStop(1, rgba(col, 0));
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(x, y, 2.5 + life * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(col, 0.85 * life * po);
        ctx.fill();
      }
    }
  },
};

document.addEventListener('DOMContentLoaded', () => NeuralNet.init());
