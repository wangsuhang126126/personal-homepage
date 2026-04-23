document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('galleryMain');
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxClose = document.getElementById('lightboxClose');
  const filterBtns = document.querySelectorAll('.gallery-filter');
  if (!grid) return;

  let currentFilter = 'all';

  function render() {
    let media = BlogStore.getMedia();
    if (currentFilter === 'photo') media = media.filter(m => m.type === 'photo');
    else if (currentFilter === 'video') media = media.filter(m => m.type === 'video' || m.type === 'embed');

    if (media.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--text-muted);font-family:var(--font-mono);">
          ${I18N.t('gallery.empty')}
        </div>`;
      return;
    }

    grid.innerHTML = media.map((item, i) => {
      if (item.type === 'embed') {
        return `
          <div class="video-card fade-in" style="animation-delay:${i * 0.05}s">
            <iframe
              src="${item.embedUrl}"
              allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
              allowfullscreen loading="lazy">
            </iframe>
            <span class="video-platform-badge ${VideoUtils.platformColor(item.platform)}">
              ${VideoUtils.platformLabel(item.platform)}
            </span>
            <div class="gallery-overlay">
              <span class="gallery-caption">${escHtml(item.name)}</span>
            </div>
          </div>`;
      }
      return `
        <div class="gallery-item fade-in" data-idx="${i}" style="animation-delay:${i * 0.05}s">
          ${item.type === 'video'
            ? `<video src="${item.dataUrl}" muted loop preload="metadata"></video>`
            : `<img src="${item.dataUrl}" alt="${escHtml(item.name)}" loading="lazy">`}
          <div class="gallery-overlay">
            <span class="gallery-caption">${escHtml(item.name)}</span>
          </div>
        </div>`;
    }).join('');

    // Click to open lightbox for local files only
    grid.querySelectorAll('.gallery-item').forEach(el => {
      const idx = parseInt(el.dataset.idx);
      const item = media[idx];
      if (!item) return;
      el.addEventListener('click', () => openLightbox(item));

      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.08 });
      obs.observe(el);
    });

    grid.querySelectorAll('.video-card.fade-in').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.05 });
      obs.observe(el);
    });
  }

  function openLightbox(item) {
    lightboxContent.innerHTML = item.type === 'video'
      ? `<video src="${item.dataUrl}" controls autoplay style="max-width:90vw;max-height:80vh;border-radius:var(--radius);"></video>`
      : `<img src="${item.dataUrl}" alt="${escHtml(item.name)}" style="max-width:90vw;max-height:80vh;border-radius:var(--radius);object-fit:contain;">`;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightboxContent.innerHTML = '';
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  });

  render();
});
