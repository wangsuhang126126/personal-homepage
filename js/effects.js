// ── 3D Card Tilt ──────────────────────────────────────
function initTilt() {
  document.querySelectorAll('.post-card, .skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── Boot Sequence (first visit only) ────────────────────
function initBoot() {
  const BOOT_KEY = 'wsh-booted-v1';
  if (localStorage.getItem(BOOT_KEY)) return;
  if (!document.body.classList.contains('index-page')) return;

  const lines = [
    '> SYSTEM INIT...',
    '> LOADING PERSONAL SPACE v2.0',
    '> LANG: ZH / JA / EN  ✓',
    '> THEME: DARK  ✓',
    '> PARTICLES: ONLINE  ✓',
    '> MATRIX: ACTIVE  ✓',
    '> READY.',
  ];

  const overlay = document.createElement('div');
  overlay.className = 'boot-overlay';
  overlay.innerHTML = `
    <div class="boot-lines"></div>
    <div class="boot-bar-wrap"><div class="boot-bar" id="bootBar"></div></div>
  `;
  document.body.appendChild(overlay);

  const linesEl = overlay.querySelector('.boot-lines');
  let i = 0;
  const interval = setInterval(() => {
    if (i >= lines.length) {
      clearInterval(interval);
      const bar = document.getElementById('bootBar');
      if (bar) bar.style.width = '100%';
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 700);
        localStorage.setItem(BOOT_KEY, '1');
      }, 800);
      return;
    }
    const el = document.createElement('div');
    el.className = 'boot-line';
    el.textContent = lines[i];
    el.style.animationDelay = '0s';
    el.style.color = i === lines.length - 1 ? '#10b981' : 'var(--accent)';
    linesEl.appendChild(el);
    const bar = document.getElementById('bootBar');
    if (bar) bar.style.width = `${((i + 1) / lines.length) * 85}%`;
    i++;
  }, 220);
}

// ── Scroll-triggered counter animation ──────────────────
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

function initCounters() {
  const statEls = document.querySelectorAll('.stat-num[data-count]');
  if (!statEls.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.count));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => obs.observe(el));
}

// ── Radar Chart (About page) ─────────────────────────────
function drawRadar(canvasId, labels, values, color1 = '#00d4ff', color2 = '#7c3aed') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = 340;
  const H = canvas.height = 320;
  const cx = W / 2, cy = H / 2;
  const R = 120;
  const N = labels.length;
  const angle = (i) => (i / N) * Math.PI * 2 - Math.PI / 2;

  ctx.clearRect(0, 0, W, H);

  // Grid rings
  for (let r = 1; r <= 4; r++) {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const a = angle(i);
      const rr = (R / 4) * r;
      i === 0 ? ctx.moveTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a))
              : ctx.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,212,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Spokes
  for (let i = 0; i < N; i++) {
    const a = angle(i);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
    ctx.strokeStyle = 'rgba(0,212,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Data polygon
  const grad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  grad.addColorStop(0, color1 + '80');
  grad.addColorStop(1, color2 + '80');

  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const a = angle(i);
    const r = R * values[i];
    i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
            : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = color1;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points
  for (let i = 0; i < N; i++) {
    const a = angle(i);
    const r = R * values[i];
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 4, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? color1 : color2;
    ctx.fill();
  }

  // Labels
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  ctx.font = '12px -apple-system,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = isDark ? 'rgba(232,244,252,0.8)' : 'rgba(15,25,35,0.8)';
  for (let i = 0; i < N; i++) {
    const a = angle(i);
    const r = R + 22;
    ctx.fillText(labels[i], cx + r * Math.cos(a), cy + r * Math.sin(a) + 4);
  }
}

// ── Init all effects ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initBoot();
  initTilt();
  initCounters();

  // Re-run tilt when new cards are added
  const mo = new MutationObserver(() => initTilt());
  const grid = document.getElementById('postsGrid') || document.getElementById('latestPosts');
  if (grid) mo.observe(grid, { childList: true });
});
