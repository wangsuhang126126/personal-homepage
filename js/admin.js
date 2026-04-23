document.addEventListener('DOMContentLoaded', () => {
  // ── Panel Navigation ────────────────────────────────
  const panels = {
    'new-post':      document.getElementById('panelNewPost'),
    'posts-list':    document.getElementById('panelPostsList'),
    'media':         document.getElementById('panelMedia'),
    'friends-admin': document.getElementById('panelFriendsAdmin'),
    'settings':      document.getElementById('panelSettings'),
  };

  const navLinks = document.querySelectorAll('.admin-nav-link[data-panel]');

  function showPanel(name) {
    Object.values(panels).forEach(p => p && (p.style.display = 'none'));
    if (panels[name]) panels[name].style.display = '';
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.panel === name));

    if (name === 'posts-list')    renderPostsList();
    if (name === 'media')         renderMediaGrid();
    if (name === 'friends-admin') renderFriendsAdmin();
    if (name === 'settings')      loadSettings();
  }

  navLinks.forEach(link => link.addEventListener('click', () => showPanel(link.dataset.panel)));
  document.getElementById('btnNewPost2')?.addEventListener('click', () => showPanel('new-post'));

  // Check URL hash
  const hash = location.hash.replace('#', '');
  if (hash === 'gallery') showPanel('media');
  else if (hash === 'friends') showPanel('friends-admin');

  // ── Editor ──────────────────────────────────────────
  const editorContent = document.getElementById('editorContent');
  const postTitle     = document.getElementById('postTitle');
  const postSubtitle  = document.getElementById('postSubtitle');
  const postTag       = document.getElementById('postTag');
  const postLang      = document.getElementById('postLang');
  const postExcerpt   = document.getElementById('postExcerpt');
  const editingId     = document.getElementById('editingId');
  const editorStatus  = document.getElementById('editorStatus');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const linkedZh      = document.getElementById('linkedZh');
  const linkedJa      = document.getElementById('linkedJa');
  const linkedEn      = document.getElementById('linkedEn');

  // Toolbar
  document.querySelectorAll('.toolbar-btn[data-cmd]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const cmd = btn.dataset.cmd;
      editorContent.focus();

      if (cmd === 'h2') {
        document.execCommand('formatBlock', false, '<h2>');
      } else if (cmd === 'h3') {
        document.execCommand('formatBlock', false, '<h3>');
      } else if (cmd === 'blockquote') {
        document.execCommand('formatBlock', false, '<blockquote>');
      } else if (cmd === 'code') {
        const sel = window.getSelection();
        if (sel && sel.toString()) {
          document.execCommand('insertHTML', false, `<code>${sel.toString()}</code>`);
        }
      } else if (cmd === 'link') {
        const url = prompt('Enter URL:');
        if (url) document.execCommand('createLink', false, url);
      } else if (cmd === 'image') {
        const url = prompt('Enter image URL:');
        if (url) document.execCommand('insertImage', false, url);
      } else {
        document.execCommand(cmd, false, null);
      }
    });
  });

  // Auto-save draft every 30s
  let autoSaveTimer = null;
  editorContent?.addEventListener('input', () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      if (postTitle.value.trim()) savePost('draft', true);
    }, 30000);
  });

  function clearEditor() {
    postTitle.value    = '';
    postSubtitle.value = '';
    postTag.value      = '';
    postExcerpt.value  = '';
    postLang.value     = 'zh';
    editorContent.innerHTML = '';
    editingId.value    = '';
    editorStatus.textContent = '';
    if (linkedZh) linkedZh.value = '';
    if (linkedJa) linkedJa.value = '';
    if (linkedEn) linkedEn.value = '';
    document.getElementById('editorTitle').setAttribute('data-i18n', 'admin.newPost');
    I18N.applyTranslations();
    btnCancelEdit.style.display = 'none';
  }

  function savePost(status, silent = false) {
    const title = postTitle.value.trim();
    if (!title) {
      if (!silent) showToast('请输入文章标题', 'error');
      return;
    }

    // Build linkedPosts object
    const linkedPosts = {};
    if (linkedZh?.value.trim()) linkedPosts.zh = linkedZh.value.trim();
    if (linkedJa?.value.trim()) linkedPosts.ja = linkedJa.value.trim();
    if (linkedEn?.value.trim()) linkedPosts.en = linkedEn.value.trim();

    const id = editingId.value || genId();
    const post = {
      id,
      title,
      subtitle:    postSubtitle.value.trim(),
      tag:         postTag.value.trim(),
      lang:        postLang.value,
      excerpt:     postExcerpt.value.trim(),
      content:     editorContent.innerHTML,
      status,
      date:        new Date().toISOString(),
      linkedPosts: Object.keys(linkedPosts).length ? linkedPosts : undefined,
    };

    BlogStore.savePost(post);
    editingId.value = id;

    if (!silent) {
      const msg = status === 'published' ? '文章已发布！' : '草稿已保存！';
      showToast(msg, 'success');
      editorStatus.textContent = `已${status === 'published' ? '发布' : '保存'} ${new Date().toLocaleTimeString()}`;
    }
  }

  document.getElementById('btnSaveDraft')?.addEventListener('click', () => savePost('draft'));
  document.getElementById('btnPublish')?.addEventListener('click', () => {
    savePost('published');
    setTimeout(() => showPanel('posts-list'), 800);
  });

  btnCancelEdit?.addEventListener('click', () => {
    clearEditor();
    showPanel('posts-list');
  });

  // ── Posts List ──────────────────────────────────────
  function renderPostsList() {
    const list = document.getElementById('adminPostsList');
    if (!list) return;
    const posts = BlogStore.getPosts().sort((a, b) => new Date(b.date) - new Date(a.date));

    if (posts.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:60px 0;color:var(--text-muted);font-family:var(--font-mono);">暂无文章，写第一篇吧！</div>`;
      return;
    }

    list.innerHTML = posts.map(post => `
      <div class="admin-post-item">
        <div class="admin-post-info">
          <div class="admin-post-title">${escHtml(post.title)}</div>
          <div class="admin-post-meta">
            ${post.tag ? `<span class="post-tag" style="font-size:0.7rem;">${escHtml(post.tag)}</span> ` : ''}
            ${post.lang ? `<span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent);">[${post.lang}]</span> ` : ''}
            ${formatDate(post.date)} · ${readingTime(post.content)} min
          </div>
        </div>
        <span class="status-badge status-${post.status}">${post.status === 'published' ? '已发布' : '草稿'}</span>
        <div class="admin-post-actions">
          <a href="post.html?id=${post.id}" class="btn btn-ghost btn-sm" target="_blank" title="预览">👁</a>
          <button class="btn btn-ghost btn-sm" onclick="editPost('${post.id}')">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deletePost('${post.id}')">✕</button>
        </div>
      </div>
    `).join('');
  }

  window.editPost = (id) => {
    const post = BlogStore.getPost(id);
    if (!post) return;
    postTitle.value    = post.title;
    postSubtitle.value = post.subtitle || '';
    postTag.value      = post.tag || '';
    postLang.value     = post.lang || 'zh';
    postExcerpt.value  = post.excerpt || '';
    editorContent.innerHTML = post.content;
    editingId.value    = post.id;
    // Multilingual links
    if (linkedZh) linkedZh.value = post.linkedPosts?.zh || '';
    if (linkedJa) linkedJa.value = post.linkedPosts?.ja || '';
    if (linkedEn) linkedEn.value = post.linkedPosts?.en || '';
    btnCancelEdit.style.display = '';
    document.getElementById('editorTitle').textContent = '编辑文章';
    showPanel('new-post');
    window.scrollTo(0, 0);
  };

  window.deletePost = (id) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    BlogStore.deletePost(id);
    renderPostsList();
    showToast('文章已删除');
  };

  // ── Video Link Add ──────────────────────────────────
  const videoUrlInput   = document.getElementById('videoUrlInput');
  const videoTitleInput = document.getElementById('videoTitleInput');
  const btnAddVideo     = document.getElementById('btnAddVideo');
  const videoParseMsg   = document.getElementById('videoParseMsg');

  videoUrlInput?.addEventListener('input', () => {
    const parsed = VideoUtils.parse(videoUrlInput.value);
    if (videoParseMsg) {
      if (parsed) {
        videoParseMsg.style.color = 'var(--accent)';
        videoParseMsg.textContent = `✓ 识别为 ${VideoUtils.platformLabel(parsed.platform)}，ID: ${parsed.id}`;
      } else if (videoUrlInput.value.trim()) {
        videoParseMsg.style.color = 'var(--text-muted)';
        videoParseMsg.textContent = '⚠ 无法识别，请粘贴完整链接';
      } else {
        videoParseMsg.textContent = '';
      }
    }
  });

  btnAddVideo?.addEventListener('click', () => {
    const parsed = VideoUtils.parse(videoUrlInput.value);
    if (!parsed) { showToast('请输入有效的 YouTube 或 Bilibili 链接', 'error'); return; }
    const title = videoTitleInput.value.trim() || `${VideoUtils.platformLabel(parsed.platform)} Video`;
    const item = {
      id:       genId(),
      name:     title,
      type:     'embed',
      platform: parsed.platform,
      videoId:  parsed.id,
      embedUrl: VideoUtils.embedUrl(parsed.platform, parsed.id),
      date:     new Date().toISOString(),
    };
    BlogStore.addMedia(item);
    renderMediaGrid();
    videoUrlInput.value = '';
    videoTitleInput.value = '';
    if (videoParseMsg) videoParseMsg.textContent = '';
    showToast('视频已添加！', 'success');
  });

  // ── Media Upload ────────────────────────────────────
  const uploadArea = document.getElementById('uploadArea');
  const fileInput  = document.getElementById('fileInput');

  uploadArea?.addEventListener('click', () => fileInput.click());

  uploadArea?.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent)';
    uploadArea.style.background  = 'var(--accent-dim)';
  });

  uploadArea?.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.background  = '';
  });

  uploadArea?.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background  = '';
    handleFiles(e.dataTransfer.files);
  });

  fileInput?.addEventListener('change', () => handleFiles(fileInput.files));

  function handleFiles(files) {
    [...files].forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) return;

      const reader = new FileReader();
      reader.onload = e => {
        const item = {
          id:      genId(),
          name:    file.name.replace(/\.[^.]+$/, ''),
          type:    isVideo ? 'video' : 'photo',
          dataUrl: e.target.result,
          date:    new Date().toISOString(),
          size:    file.size,
        };
        BlogStore.addMedia(item);
        renderMediaGrid();
        showToast('上传成功！', 'success');
      };
      reader.readAsDataURL(file);
    });
    fileInput.value = '';
  }

  function renderMediaGrid() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;
    const media = BlogStore.getMedia();

    if (media.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);font-family:var(--font-mono);">暂无媒体文件</div>`;
      return;
    }

    grid.innerHTML = media.map(item => `
      <div class="${item.type === 'embed' ? 'video-card' : 'gallery-item'}" style="position:relative;">
        ${item.type === 'embed'
          ? `<iframe src="${item.embedUrl}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe>
             <span class="video-platform-badge ${VideoUtils.platformColor(item.platform)}">${VideoUtils.platformLabel(item.platform)}</span>`
          : item.type === 'video'
            ? `<video src="${item.dataUrl}" muted preload="metadata"></video>`
            : `<img src="${item.dataUrl}" alt="${escHtml(item.name)}" loading="lazy">`}
        <div class="gallery-overlay" style="opacity:1;background:linear-gradient(to top,rgba(5,10,15,0.85) 0%,transparent 50%);">
          <div style="width:100%;display:flex;justify-content:space-between;align-items:flex-end;">
            <span class="gallery-caption" style="font-size:0.75rem;">${escHtml(item.name)}</span>
            <button onclick="deleteMedia('${item.id}')" style="width:24px;height:24px;border-radius:50%;background:rgba(239,68,68,0.8);color:#fff;border:none;cursor:pointer;font-size:0.75rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>
          </div>
        </div>
        ${item.type === 'video' ? `<div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.6);color:#fff;border-radius:4px;padding:2px 6px;font-size:0.7rem;">VIDEO</div>` : ''}
      </div>
    `).join('');
  }

  window.deleteMedia = (id) => {
    if (!confirm('确定删除这个媒体文件吗？')) return;
    BlogStore.deleteMedia(id);
    renderMediaGrid();
    showToast('已删除');
  };

  // ── Friends Admin ───────────────────────────────────
  function renderFriendsAdmin() {
    const list = document.getElementById('friendsAdminList');
    if (!list) return;
    const friends = FriendsStore.getAll();

    if (friends.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);font-family:var(--font-mono);">暂无友链，添加第一个吧！</div>`;
      return;
    }

    list.innerHTML = friends.map(f => `
      <div class="friend-admin-item">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-secondary);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">
          ${f.avatar?.startsWith('http') ? `<img src="${f.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : (f.avatar || '🌐')}
        </div>
        <div class="friend-admin-info">
          <div class="friend-admin-name">${escHtml(f.name)}</div>
          <div class="friend-admin-url">${escHtml(f.url)}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">${escHtml(f.desc)}</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteFriendLink('${f.id}')">✕ 删除</button>
      </div>
    `).join('');
  }

  document.getElementById('btnAddFriend')?.addEventListener('click', () => {
    const name   = document.getElementById('friendName').value.trim();
    const url    = document.getElementById('friendUrl').value.trim();
    const desc   = document.getElementById('friendDesc').value.trim();
    const avatar = document.getElementById('friendAvatar').value.trim();

    if (!name) { showToast('请填写网站名称', 'error'); return; }
    if (!url || !url.match(/^https?:\/\/.+/)) { showToast('请填写有效的网站地址', 'error'); return; }
    if (!desc) { showToast('请填写网站描述', 'error'); return; }

    FriendsStore.add({ name, url, desc, avatar: avatar || '🌐' });
    renderFriendsAdmin();
    document.getElementById('friendName').value   = '';
    document.getElementById('friendUrl').value    = '';
    document.getElementById('friendDesc').value   = '';
    document.getElementById('friendAvatar').value = '';
    showToast('友链已添加！', 'success');
  });

  window.deleteFriendLink = (id) => {
    if (!confirm('确定要删除这个友链吗？')) return;
    FriendsStore.remove(id);
    renderFriendsAdmin();
    showToast('友链已删除');
  };

  // ── Settings ────────────────────────────────────────
  const SETTINGS_KEY = 'wsh-settings';
  const GISCUS_KEY   = 'wsh-giscus';

  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      if (s.siteName) document.getElementById('settingSiteName').value = s.siteName;
      if (s.bio)      document.getElementById('settingBio').value = s.bio;
      if (s.twitter)  document.getElementById('settingTwitter').value = s.twitter;
      if (s.weibo)    document.getElementById('settingWeibo').value = s.weibo;
      if (s.youtube)  document.getElementById('settingYoutube').value = s.youtube;
      if (s.bilibili) document.getElementById('settingBilibili').value = s.bilibili;
      if (s.linkedin) document.getElementById('settingLinkedin').value = s.linkedin;
    } catch {}

    try {
      const g = JSON.parse(localStorage.getItem(GISCUS_KEY) || '{}');
      if (g.repo)       document.getElementById('settingGiscusRepo').value = g.repo;
      if (g.repoId)     document.getElementById('settingGiscusRepoId').value = g.repoId;
      if (g.category)   document.getElementById('settingGiscusCategory').value = g.category;
      if (g.categoryId) document.getElementById('settingGiscusCategoryId').value = g.categoryId;
    } catch {}
  }

  document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
    const settings = {
      siteName: document.getElementById('settingSiteName').value,
      bio:      document.getElementById('settingBio').value,
      twitter:  document.getElementById('settingTwitter').value,
      weibo:    document.getElementById('settingWeibo').value,
      youtube:  document.getElementById('settingYoutube').value,
      bilibili: document.getElementById('settingBilibili').value,
      linkedin: document.getElementById('settingLinkedin').value,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    const giscus = {
      repo:       document.getElementById('settingGiscusRepo').value.trim(),
      repoId:     document.getElementById('settingGiscusRepoId').value.trim(),
      category:   document.getElementById('settingGiscusCategory').value.trim(),
      categoryId: document.getElementById('settingGiscusCategoryId').value.trim(),
    };
    localStorage.setItem(GISCUS_KEY, JSON.stringify(giscus));

    showToast('设置已保存！', 'success');
  });
});
