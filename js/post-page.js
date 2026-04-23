document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('postDetail');
  if (!container) return;

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const post = id ? BlogStore.getPost(id) : null;

  if (!post) {
    container.innerHTML = `
      <div style="text-align:center;padding:80px 0;">
        <div style="font-size:3rem;margin-bottom:16px;">404</div>
        <p style="color:var(--text-muted);margin-bottom:24px;">文章不存在或已被删除</p>
        <a href="blog.html" class="btn btn-outline">← ${I18N.t('blog.back')}</a>
      </div>`;
    return;
  }

  document.title = `${post.title} — Wang Suhang`;

  container.innerHTML = `
    <div class="post-detail-header">
      <a href="blog.html" style="display:inline-flex;align-items:center;gap:6px;color:var(--text-muted);font-size:0.85rem;font-family:var(--font-mono);margin-bottom:24px;transition:color var(--transition);"
         onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-muted)'">
        ← <span data-i18n="blog.back">${I18N.t('blog.back')}</span>
      </a>
      <div class="post-detail-meta">
        ${post.tag ? `<span class="post-tag">${escHtml(post.tag)}</span>` : ''}
        <span>${formatDate(post.date)}</span>
        <span>${readingTime(post.content)} min read</span>
        <span class="status-badge status-${post.status}">${post.status === 'published' ? '● Published' : '○ Draft'}</span>
      </div>
      <h1 class="post-detail-title">${escHtml(post.title)}</h1>
      ${post.subtitle ? `<p class="post-detail-subtitle">${escHtml(post.subtitle)}</p>` : ''}
      <div class="post-detail-divider"></div>
    </div>

    <div class="prose" id="postContent">
      ${post.content}
    </div>

    <div class="share-section">
      <div class="share-label" data-i18n="blog.share">${I18N.t('blog.share')}</div>
      <div class="share-buttons">
        <button class="share-btn twitter" onclick="shareTwitter()">
          <span>𝕏</span> <span data-i18n="share.twitter">${I18N.t('share.twitter')}</span>
        </button>
        <button class="share-btn weibo" onclick="shareWeibo()">
          <span>微</span> <span data-i18n="share.weibo">${I18N.t('share.weibo')}</span>
        </button>
        <button class="share-btn wechat" onclick="shareWechat()">
          <span>💬</span> <span data-i18n="share.wechat">${I18N.t('share.wechat')}</span>
        </button>
        <button class="share-btn linkedin" onclick="shareLinkedin()">
          <span>in</span> <span data-i18n="share.linkedin">${I18N.t('share.linkedin')}</span>
        </button>
        <button class="share-btn copy" onclick="copyLink(this)">
          <span>🔗</span> <span data-i18n="share.copy">${I18N.t('share.copy')}</span>
        </button>
      </div>
    </div>

    <!-- Related / Back -->
    <div style="margin-top:60px;padding-top:32px;border-top:1px solid var(--border);text-align:center;">
      <a href="blog.html" class="btn btn-outline">← ${I18N.t('blog.back')}</a>
    </div>
  `;

  // ── Multilingual switcher ──────────────────────────────
  renderLangSwitcher(post);

  // ── Giscus comments ───────────────────────────────────
  initGiscus(post);
});

// ── Multilingual post switcher ─────────────────────────
function renderLangSwitcher(post) {
  if (!post.linkedPosts) return;

  const linked = post.linkedPosts; // { zh: id, ja: id, en: id }
  const langs  = { zh: '中文', ja: '日本語', en: 'English' };
  const hasSwitcher = Object.keys(linked).some(l => linked[l]);
  if (!hasSwitcher) return;

  const wrapper  = document.getElementById('langSwitcherPost');
  const btnsEl   = document.getElementById('langPostBtns');
  if (!wrapper || !btnsEl) return;

  // Determine current lang from post
  const currentLang = post.lang || 'zh';

  const btns = Object.entries(langs).map(([code, label]) => {
    const targetId = linked[code];
    if (!targetId && code !== currentLang) return '';
    const isCurrent = code === currentLang;
    return isCurrent
      ? `<button class="lang-post-btn current" disabled>${label}</button>`
      : `<a class="lang-post-btn" href="post.html?id=${targetId}">${label}</a>`;
  }).filter(Boolean).join('');

  btnsEl.innerHTML   = btns;
  wrapper.style.display = 'block';
}

// ── Giscus comment injection ───────────────────────────
function initGiscus(post) {
  const section   = document.getElementById('commentsSection');
  const container = document.getElementById('giscusContainer');
  const note      = document.getElementById('giscusNote');
  if (!section || !container) return;

  // Read config from localStorage (set in admin settings)
  let cfg = {};
  try { cfg = JSON.parse(localStorage.getItem('wsh-giscus') || '{}'); } catch (_) {}

  section.style.display = 'block';

  if (!cfg.repo || !cfg.repoId || !cfg.category || !cfg.categoryId) {
    // Show setup note instead
    if (note) note.style.display = 'block';
    return;
  }

  // Build giscus script
  const script = document.createElement('script');
  script.src              = 'https://giscus.app/client.js';
  script.setAttribute('data-repo',              cfg.repo);
  script.setAttribute('data-repo-id',           cfg.repoId);
  script.setAttribute('data-category',          cfg.category);
  script.setAttribute('data-category-id',       cfg.categoryId);
  script.setAttribute('data-mapping',           'pathname');
  script.setAttribute('data-strict',            '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata',     '0');
  script.setAttribute('data-input-position',    'top');
  script.setAttribute('data-theme',             document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  script.setAttribute('data-lang',              'zh-CN');
  script.setAttribute('crossorigin',            'anonymous');
  script.async = true;
  container.appendChild(script);

  // Sync theme changes
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    setTimeout(() => {
      const iframe = document.querySelector('iframe.giscus-frame');
      if (iframe) {
        const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme } } },
          'https://giscus.app'
        );
      }
    }, 100);
  });
}

// ── Share functions ────────────────────────────────────
function getPageUrl() {
  return encodeURIComponent(location.href);
}

function getPageTitle() {
  const params = new URLSearchParams(location.search);
  const post = BlogStore.getPost(params.get('id'));
  return encodeURIComponent(post?.title || document.title);
}

function shareTwitter() {
  window.open(`https://twitter.com/intent/tweet?url=${getPageUrl()}&text=${getPageTitle()}`, '_blank');
}

function shareWeibo() {
  window.open(`https://service.weibo.com/share/share.php?url=${getPageUrl()}&title=${getPageTitle()}`, '_blank');
}

function shareLinkedin() {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${getPageUrl()}`, '_blank');
}

function shareWechat() {
  const popup = document.getElementById('wechatPopup');
  const qrDiv = document.getElementById('wechatQr');
  if (!popup || !qrDiv) return;

  qrDiv.innerHTML = `
    <div style="text-align:center;padding:16px;font-size:0.75rem;color:#333;word-break:break-all;">
      <div style="font-size:0.7rem;margin-bottom:8px;color:#666;">扫码或复制链接：</div>
      <div style="font-weight:600;">${location.href}</div>
    </div>`;
  popup.classList.remove('hidden');
  popup.addEventListener('click', e => {
    if (e.target === popup) popup.classList.add('hidden');
  });
}

function copyLink(btn) {
  navigator.clipboard.writeText(location.href).then(() => {
    const span = btn.querySelector('[data-i18n="share.copy"]');
    if (span) {
      span.textContent = I18N.t('share.copied');
      setTimeout(() => { span.textContent = I18N.t('share.copy'); }, 2000);
    }
    showToast(I18N.t('share.copied'));
  });
}
