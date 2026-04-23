/**
 * Reading Progress Bar + Auto Table of Contents
 * Runs on post.html only.
 */

// ── Progress Bar ─────────────────────────────────────────
function initProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.prepend(bar);

  const update = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ── Table of Contents ────────────────────────────────────
function initTOC() {
  const prose = document.getElementById('postContent');
  if (!prose) return;

  const headings = [...prose.querySelectorAll('h2, h3')];
  if (headings.length < 2) return; // not worth showing for very short posts

  // Assign IDs
  const slugMap = {};
  headings.forEach((h, i) => {
    const base = h.textContent.trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\u3040-\u30ff]+/g, '-')
      .replace(/^-|-$/g, '') || `heading-${i}`;
    let slug = base;
    let count = 0;
    while (slugMap[slug]) { slug = `${base}-${++count}`; }
    slugMap[slug] = true;
    h.id = slug;
  });

  // Build TOC item list
  let idx = 0;
  const items = headings.map(h => {
    if (h.tagName === 'H2') idx++;
    return {
      id:    h.id,
      text:  h.textContent.trim(),
      level: h.tagName,
      num:   h.tagName === 'H2' ? `${idx}.` : '',
    };
  });

  const renderList = (container) => {
    if (!container) return;
    container.innerHTML = items.map(item => `
      <div class="toc-item ${item.level === 'H3' ? 'h3' : ''}" data-id="${item.id}">
        ${item.num ? `<span class="toc-num">${item.num}</span>` : '<span class="toc-num" style="opacity:0">·</span>'}
        <span>${item.text}</span>
      </div>
    `).join('');

    container.querySelectorAll('.toc-item').forEach(el => {
      el.addEventListener('click', () => {
        const target = document.getElementById(el.dataset.id);
        if (target) {
          const y = target.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  };

  // Desktop sidebar TOC
  const desktopList = document.getElementById('tocDesktopList');
  const tocSidebar  = document.getElementById('tocSidebar');
  if (desktopList) {
    renderList(desktopList);
    if (tocSidebar) tocSidebar.style.display = '';
  }

  // Mobile TOC
  const mobileList   = document.getElementById('tocMobileList');
  const mobileToggle = document.getElementById('tocMobileToggle');
  const mobilePanel  = document.getElementById('tocMobilePanel');
  if (mobileList) {
    renderList(mobileList);
    if (mobileToggle) mobileToggle.style.display = 'flex';
  }

  mobileToggle?.addEventListener('click', () => {
    mobileToggle.classList.toggle('open');
    mobilePanel?.classList.toggle('open');
  });

  // Highlight active TOC item on scroll
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.toc-item').forEach(el => {
          el.classList.toggle('active', el.dataset.id === entry.target.id);
        });
      }
    });
  }, {
    rootMargin: `-${64 + 24}px 0px -60% 0px`,
    threshold: 0,
  });

  headings.forEach(h => obs.observe(h));
}

// progress.js runs after post-page.js, so postContent exists by DOMContentLoaded.
// But post-page.js also runs on DOMContentLoaded — we need to wait for it to finish
// rendering. Use a small setTimeout to ensure content is in the DOM.
document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  // Small delay to let post-page.js inject the post content first
  setTimeout(initTOC, 50);
});
