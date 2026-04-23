document.addEventListener('DOMContentLoaded', () => {
  // ── Live stats ─────────────────────────────────────────
  const postCount = BlogStore.getPublished().length;
  const photoCount = BlogStore.getMedia().filter(m => m.type === 'photo').length;

  const statPosts = document.getElementById('statPosts');
  const statPhotos = document.getElementById('statPhotos');

  if (statPosts) {
    statPosts.dataset.count = postCount;
    statPosts.textContent = postCount;
  }
  if (statPhotos) {
    statPhotos.dataset.count = photoCount;
    statPhotos.textContent = photoCount;
  }

  // ── Skill bars animate on scroll ───────────────────────
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        const fill = entry.target.querySelector('.skill-fill');
        if (fill) {
          const level = parseFloat(entry.target.dataset.level || 0.7);
          fill.style.width = (level * 100) + '%';
        }
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skill-card').forEach(card => skillObs.observe(card));

  // ── Fade-in observer ───────────────────────────────────
  const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in').forEach(el => fadeObs.observe(el));

  // ── Radar chart ────────────────────────────────────────
  // drawRadar is called inline in about.html after effects.js loads
});
