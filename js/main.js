// ============================================
// NAVIGATION
// ============================================
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ============================================
// BLOG DATA (localStorage)
// ============================================
const BlogStore = {
  POSTS_KEY: 'wsh-posts',
  MEDIA_KEY: 'wsh-media',

  getPosts() {
    try {
      return JSON.parse(localStorage.getItem(this.POSTS_KEY) || '[]');
    } catch { return []; }
  },

  savePosts(posts) {
    localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
  },

  getPost(id) {
    return this.getPosts().find(p => p.id === id);
  },

  savePost(post) {
    const posts = this.getPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx >= 0) posts[idx] = post;
    else posts.unshift(post);
    this.savePosts(posts);
    return post;
  },

  deletePost(id) {
    this.savePosts(this.getPosts().filter(p => p.id !== id));
  },

  getPublished() {
    return this.getPosts().filter(p => p.status === 'published')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getMedia() {
    try {
      return JSON.parse(localStorage.getItem(this.MEDIA_KEY) || '[]');
    } catch { return []; }
  },

  saveMedia(media) {
    localStorage.setItem(this.MEDIA_KEY, JSON.stringify(media));
  },

  addMedia(item) {
    const media = this.getMedia();
    media.unshift(item);
    this.saveMedia(media);
  },

  deleteMedia(id) {
    this.saveMedia(this.getMedia().filter(m => m.id !== id));
  }
};

// ============================================
// HOME PAGE — LATEST POSTS
// ============================================
function renderLatestPosts() {
  const container = document.getElementById('latestPosts');
  if (!container) return;

  const posts = BlogStore.getPublished().slice(0, 3);

  if (posts.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted);font-family:var(--font-mono);">
        ${I18N.t('blog.noResults')}
      </div>`;
    return;
  }

  container.innerHTML = posts.map(post => `
    <article class="post-card fade-in" onclick="location.href='post.html?id=${post.id}'">
      <div class="post-meta">
        <span class="post-tag">${post.tag || 'General'}</span>
        <span>${formatDate(post.date)}</span>
      </div>
      <h3 class="post-title">${escHtml(post.title)}</h3>
      <p class="post-excerpt">${escHtml(stripHtml(post.content).slice(0, 150))}...</p>
      <div class="post-footer">
        <span>${readingTime(post.content)} min read</span>
        <span class="post-read">→</span>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ============================================
// HOME PAGE — GALLERY PREVIEW
// ============================================
function renderGalleryPreview() {
  const container = document.getElementById('galleryPreview');
  if (!container) return;

  const media = BlogStore.getMedia().slice(0, 4);

  if (media.length === 0) {
    const placeholders = Array.from({length: 4}, (_, i) => `
      <div class="gallery-item fade-in">
        <div class="gallery-placeholder">
          <span class="gallery-placeholder-icon">${['🌄','🎬','📷','🌃'][i]}</span>
          <span>Coming soon</span>
        </div>
      </div>`).join('');
    container.innerHTML = placeholders;
  } else {
    container.innerHTML = media.map(m => `
      <div class="gallery-item fade-in">
        ${m.type === 'video'
          ? `<video src="${m.dataUrl}" muted loop></video>`
          : `<img src="${m.dataUrl}" alt="${escHtml(m.name)}" loading="lazy">`}
        <div class="gallery-overlay">
          <span class="gallery-caption">${escHtml(m.name)}</span>
        </div>
      </div>`).join('');
  }

  container.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ============================================
// UTILITIES
// ============================================
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(I18N.currentLang === 'en' ? 'en-US' : I18N.currentLang === 'ja' ? 'ja-JP' : 'zh-CN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function readingTime(content) {
  const words = stripHtml(content).split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || '';
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  renderLatestPosts();
  renderGalleryPreview();
});
