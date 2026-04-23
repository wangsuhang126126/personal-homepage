document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('postsGrid');
  const searchInput = document.getElementById('searchInput');
  const tagFilters = document.getElementById('tagFilters');
  if (!grid) return;

  let currentTag = 'all';
  let searchTerm = '';

  function getAllTags() {
    const tags = new Set();
    BlogStore.getPublished().forEach(p => { if (p.tag) tags.add(p.tag); });
    return [...tags];
  }

  function renderTagFilters() {
    const tags = getAllTags();
    const extra = tags.map(tag => `
      <button class="tag-filter${currentTag === tag ? ' active' : ''}" data-tag="${escHtml(tag)}">${escHtml(tag)}</button>
    `).join('');
    tagFilters.innerHTML = `
      <button class="tag-filter${currentTag === 'all' ? ' active' : ''}" data-tag="all">All</button>
      ${extra}
    `;
    tagFilters.querySelectorAll('.tag-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTag = btn.dataset.tag;
        renderTagFilters();
        renderPosts();
      });
    });
  }

  function renderPosts() {
    let posts = BlogStore.getPublished();

    if (currentTag !== 'all') {
      posts = posts.filter(p => p.tag === currentTag);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        stripHtml(p.content).toLowerCase().includes(q)
      );
    }

    if (posts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--text-muted);font-family:var(--font-mono);">
          ${I18N.t('blog.noResults')}
        </div>`;
      return;
    }

    grid.innerHTML = posts.map((post, i) => `
      <article class="post-card fade-in" style="animation-delay:${i * 0.05}s" onclick="location.href='post.html?id=${post.id}'">
        <div class="post-meta">
          ${post.tag ? `<span class="post-tag">${escHtml(post.tag)}</span>` : ''}
          <span>${formatDate(post.date)}</span>
        </div>
        <h3 class="post-title">${escHtml(post.title)}</h3>
        ${post.subtitle ? `<p style="font-size:0.85rem;color:var(--accent);margin:-4px 0 0;font-style:italic;">${escHtml(post.subtitle)}</p>` : ''}
        <p class="post-excerpt">${escHtml(post.excerpt || stripHtml(post.content).slice(0, 160))}...</p>
        <div class="post-footer">
          <span>${readingTime(post.content)} min read</span>
          <span class="post-read">${I18N.t('blog.readMore')} →</span>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.fade-in').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.08 });
      obs.observe(el);
    });
  }

  searchInput?.addEventListener('input', e => {
    searchTerm = e.target.value.trim();
    renderPosts();
  });

  renderTagFilters();
  renderPosts();

  // Re-render on lang change
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(renderPosts, 50));
  });
});
