/**
 * Friends Page — FriendsStore + render grid
 */

const FriendsStore = (() => {
  const KEY = 'wsh-friends';

  const defaults = [
    {
      id: 'f1',
      name: 'Aoi Tanaka',
      url: 'https://aoi.dev',
      desc: '前端工程师，喜欢探索新技术与简约设计。',
      avatar: '🌸',
      addedAt: '2025-12-01',
    },
    {
      id: 'f2',
      name: 'Solar Chronicle',
      url: 'https://solarchronicle.net',
      desc: '光伏行业观察者，记录清洁能源领域的每一个脚步。',
      avatar: '☀️',
      addedAt: '2025-11-15',
    },
    {
      id: 'f3',
      name: 'ByteWanderer',
      url: 'https://bytewanderer.io',
      desc: 'ByteDance工程师，东京漂流者，喜欢写代码和跑步。',
      avatar: '🤖',
      addedAt: '2025-10-20',
    },
    {
      id: 'f4',
      name: 'Yuki Photo',
      url: 'https://yukiphoto.jp',
      desc: '旅行摄影师，用镜头记录日本四季之美。',
      avatar: '📷',
      addedAt: '2025-09-05',
    },
    {
      id: 'f5',
      name: 'Tech in Tokyo',
      url: 'https://techintokyo.blog',
      desc: '外籍工程师在东京的生活与技术随笔。',
      avatar: '🗼',
      addedAt: '2025-08-18',
    },
    {
      id: 'f6',
      name: 'Kenji Codes',
      url: 'https://kenjicodes.me',
      desc: 'Full-stack dev, open source enthusiast, coffee addict.',
      avatar: '☕',
      addedAt: '2025-07-30',
    },
  ];

  function getAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    // Seed defaults
    localStorage.setItem(KEY, JSON.stringify(defaults));
    return defaults;
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function add(friend) {
    const list = getAll();
    friend.id = 'f' + Date.now();
    friend.addedAt = new Date().toISOString().slice(0, 10);
    list.push(friend);
    save(list);
    return friend;
  }

  function remove(id) {
    save(getAll().filter(f => f.id !== id));
  }

  return { getAll, save, add, remove };
})();

// ── Render friends grid ───────────────────────────────────
function renderFriends() {
  const grid = document.getElementById('friendsGrid');
  if (!grid) return;

  const friends = FriendsStore.getAll();

  if (friends.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;
                  color:var(--text-muted);font-family:var(--font-mono);font-size:0.85rem;">
        // 暂无友情链接
      </div>`;
    return;
  }

  grid.innerHTML = friends.map((f, i) => {
    const avatarHtml = f.avatar && f.avatar.startsWith('http')
      ? `<img src="${f.avatar}" alt="${f.name}" loading="lazy">`
      : `<span>${f.avatar || '🌐'}</span>`;

    const displayUrl = f.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    return `
      <a class="friend-card fade-in" href="${escHtml(f.url)}"
         target="_blank" rel="noopener noreferrer"
         style="animation-delay:${i * 0.07}s">
        <div class="friend-avatar">${avatarHtml}</div>
        <div class="friend-info">
          <div class="friend-name">${escHtml(f.name)}</div>
          <div class="friend-url">${escHtml(displayUrl)}</div>
          <div class="friend-desc">${escHtml(f.desc)}</div>
        </div>
      </a>`;
  }).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', renderFriends);
