/**
 * Background Theme Switcher
 * Cycles through colour palettes by overriding CSS custom properties.
 * Works on top of the dark/light theme toggle.
 */
(function () {
  const STORAGE_KEY = 'wsh-bg-theme';

  const THEMES = [
    {
      id: 'cyber',
      label: '赛博',
      icon: '◈',
      desc: 'Cyber Blue',
      vars: {
        '--bg-primary':    '#050a0f',
        '--bg-secondary':  '#0a1520',
        '--bg-card':       '#0d1a28',
        '--bg-card-hover': '#122030',
        '--accent':        '#00d4ff',
        '--accent-dim':    'rgba(0,212,255,0.15)',
        '--accent-glow':   'rgba(0,212,255,0.4)',
        '--accent2':       '#7c3aed',
        '--accent2-dim':   'rgba(124,58,237,0.15)',
        '--border':        'rgba(0,212,255,0.12)',
        '--border-hover':  'rgba(0,212,255,0.35)',
        '--shadow-glow':   '0 0 30px rgba(0,212,255,0.15)',
      }
    },
    {
      id: 'aurora',
      label: '极光',
      icon: '◈',
      desc: 'Aurora Green',
      vars: {
        '--bg-primary':    '#03120a',
        '--bg-secondary':  '#071a0e',
        '--bg-card':       '#0b2016',
        '--bg-card-hover': '#102819',
        '--accent':        '#00ffaa',
        '--accent-dim':    'rgba(0,255,170,0.15)',
        '--accent-glow':   'rgba(0,255,170,0.4)',
        '--accent2':       '#a855f7',
        '--accent2-dim':   'rgba(168,85,247,0.15)',
        '--border':        'rgba(0,255,170,0.12)',
        '--border-hover':  'rgba(0,255,170,0.35)',
        '--shadow-glow':   '0 0 30px rgba(0,255,170,0.15)',
      }
    },
    {
      id: 'sunset',
      label: '夕阳',
      icon: '◈',
      desc: 'Sunset Red',
      vars: {
        '--bg-primary':    '#0f0605',
        '--bg-secondary':  '#1a0d08',
        '--bg-card':       '#20100a',
        '--bg-card-hover': '#281510',
        '--accent':        '#ff6b35',
        '--accent-dim':    'rgba(255,107,53,0.15)',
        '--accent-glow':   'rgba(255,107,53,0.4)',
        '--accent2':       '#f59e0b',
        '--accent2-dim':   'rgba(245,158,11,0.15)',
        '--border':        'rgba(255,107,53,0.12)',
        '--border-hover':  'rgba(255,107,53,0.35)',
        '--shadow-glow':   '0 0 30px rgba(255,107,53,0.15)',
      }
    },
    {
      id: 'sakura',
      label: '樱花',
      icon: '◈',
      desc: 'Sakura Pink',
      vars: {
        '--bg-primary':    '#100610',
        '--bg-secondary':  '#1a0b1a',
        '--bg-card':       '#200d20',
        '--bg-card-hover': '#281228',
        '--accent':        '#ff79c6',
        '--accent-dim':    'rgba(255,121,198,0.15)',
        '--accent-glow':   'rgba(255,121,198,0.4)',
        '--accent2':       '#bd93f9',
        '--accent2-dim':   'rgba(189,147,249,0.15)',
        '--border':        'rgba(255,121,198,0.12)',
        '--border-hover':  'rgba(255,121,198,0.35)',
        '--shadow-glow':   '0 0 30px rgba(255,121,198,0.15)',
      }
    },
    {
      id: 'ocean',
      label: '深海',
      icon: '◈',
      desc: 'Deep Ocean',
      vars: {
        '--bg-primary':    '#020d1a',
        '--bg-secondary':  '#041524',
        '--bg-card':       '#061c2e',
        '--bg-card-hover': '#092438',
        '--accent':        '#0ea5e9',
        '--accent-dim':    'rgba(14,165,233,0.15)',
        '--accent-glow':   'rgba(14,165,233,0.4)',
        '--accent2':       '#06b6d4',
        '--accent2-dim':   'rgba(6,182,212,0.15)',
        '--border':        'rgba(14,165,233,0.12)',
        '--border-hover':  'rgba(14,165,233,0.35)',
        '--shadow-glow':   '0 0 30px rgba(14,165,233,0.15)',
      }
    },
    {
      id: 'gold',
      label: '暗金',
      icon: '◈',
      desc: 'Dark Gold',
      vars: {
        '--bg-primary':    '#0d0a02',
        '--bg-secondary':  '#160f03',
        '--bg-card':       '#1c1304',
        '--bg-card-hover': '#231805',
        '--accent':        '#fbbf24',
        '--accent-dim':    'rgba(251,191,36,0.15)',
        '--accent-glow':   'rgba(251,191,36,0.4)',
        '--accent2':       '#f97316',
        '--accent2-dim':   'rgba(249,115,22,0.15)',
        '--border':        'rgba(251,191,36,0.12)',
        '--border-hover':  'rgba(251,191,36,0.35)',
        '--shadow-glow':   '0 0 30px rgba(251,191,36,0.15)',
      }
    },
  ];

  let currentIndex = 0;

  function applyTheme(idx) {
    const theme = THEMES[idx];
    const root = document.documentElement;
    // Only apply dark-mode overrides (light theme has its own palette)
    const isDark = root.getAttribute('data-theme') !== 'light';
    if (isDark) {
      Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    }
    localStorage.setItem(STORAGE_KEY, theme.id);
    updateButton(idx);
  }

  function clearTheme() {
    const root = document.documentElement;
    Object.keys(THEMES[0].vars).forEach(k => root.style.removeProperty(k));
  }

  function updateButton(idx) {
    const btn = document.getElementById('bgSwitcher');
    if (!btn) return;
    const t = THEMES[idx];
    const dot = btn.querySelector('.bg-dot');
    if (dot) dot.style.background = t.vars['--accent'];
    btn.title = `背景: ${t.label} (${t.desc})`;
  }

  function next() {
    currentIndex = (currentIndex + 1) % THEMES.length;
    applyTheme(currentIndex);
  }

  function init() {
    // Restore saved theme
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const idx = THEMES.findIndex(t => t.id === saved);
      if (idx !== -1) currentIndex = idx;
    }

    // Inject button into nav-controls
    const navControls = document.querySelector('.nav-controls');
    if (!navControls) return;

    const btn = document.createElement('button');
    btn.id = 'bgSwitcher';
    btn.className = 'bg-switcher-btn';
    btn.setAttribute('aria-label', '切换背景颜色');
    btn.innerHTML = `<span class="bg-dot"></span>`;

    // Insert before fx toggle (or theme toggle as fallback)
    const fxBtn = document.getElementById('fxToggle');
    const themeBtn = document.getElementById('themeToggle');
    const ref = fxBtn || themeBtn;
    if (ref) {
      navControls.insertBefore(btn, ref);
    } else {
      navControls.appendChild(btn);
    }

    btn.addEventListener('click', next);

    // Re-apply when dark/light theme changes (observer on data-theme attr)
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      if (isDark) {
        applyTheme(currentIndex);
      } else {
        clearTheme();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Apply initial
    applyTheme(currentIndex);
  }

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .bg-switcher-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1.5px solid var(--border);
      background: var(--accent-dim);
      transition: border-color var(--transition), background var(--transition), transform 0.2s;
      position: relative;
      overflow: hidden;
    }
    .bg-switcher-btn:hover {
      border-color: var(--border-hover);
      background: var(--accent-dim);
      transform: scale(1.1);
    }
    .bg-switcher-btn:active {
      transform: scale(0.95);
    }
    .bg-dot {
      display: block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent-glow);
      transition: background 0.4s, box-shadow 0.4s;
    }
    .bg-switcher-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(
        #00d4ff 0deg 60deg,
        #00ffaa 60deg 120deg,
        #ff6b35 120deg 180deg,
        #ff79c6 180deg 240deg,
        #0ea5e9 240deg 300deg,
        #fbbf24 300deg 360deg
      );
      opacity: 0;
      transition: opacity 0.2s;
    }
    .bg-switcher-btn:hover::after {
      opacity: 0.15;
    }
  `;
  document.head.appendChild(style);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
