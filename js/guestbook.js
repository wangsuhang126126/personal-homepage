/**
 * Guestbook — powered by Cloudflare Workers + D1
 */

const API_URL = 'https://wsh-guestbook-api.wangsuhang.workers.dev';

// ── Helpers ───────────────────────────────────────────────
function gbEsc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gbFormatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Render messages ───────────────────────────────────────
function renderMessages(messages) {
  const list = document.getElementById('messagesList');
  const total = document.getElementById('gbTotal');
  if (!list) return;

  if (total) total.textContent = messages.length;

  if (messages.length === 0) {
    list.innerHTML = `
      <div class="message-empty">
        // 还没有留言，成为第一个留言的人吧 ✨
      </div>`;
    return;
  }

  list.innerHTML = messages.map((msg, i) => {
    const siteLink = msg.site
      ? `<a href="${gbEsc(msg.site)}" target="_blank" rel="noopener"
            style="color:var(--accent);font-size:0.72rem;font-family:var(--font-mono);margin-left:6px;"
         >${gbEsc(msg.site.replace(/^https?:\/\//, ''))}</a>`
      : '';

    return `
      <div class="message-card fade-in" style="animation-delay:${i * 0.06}s">
        <div class="message-header">
          <div class="message-avatar">${gbEsc(msg.avatar || '😊')}</div>
          <div>
            <span class="message-name">${gbEsc(msg.name)}</span>
            ${siteLink}
          </div>
          <div class="message-date">${gbFormatDate(msg.created_at)}</div>
        </div>
        <div class="message-body">${gbEsc(msg.content)}</div>
      </div>`;
  }).join('');
}

// ── Load messages from API ────────────────────────────────
async function loadMessages() {
  const list = document.getElementById('messagesList');
  if (!list) return;

  list.innerHTML = `<div class="message-empty">// 加载中...</div>`;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('请求失败');
    const messages = await res.json();
    renderMessages(messages);
  } catch (err) {
    list.innerHTML = `<div class="message-empty">// 加载失败，请刷新重试 😢</div>`;
    console.error('Guestbook load error:', err);
  }
}

// ── Form handling ─────────────────────────────────────────
function initGuestbookForm() {
  const nameEl    = document.getElementById('gbName');
  const siteEl    = document.getElementById('gbSite');
  const contentEl = document.getElementById('gbContent');
  const countEl   = document.getElementById('gbCount');
  const submitBtn = document.getElementById('gbSubmit');

  if (!nameEl || !contentEl || !submitBtn) return;

  // Character counter
  contentEl.addEventListener('input', () => {
    countEl.textContent = contentEl.value.length;
  });

  // Submit
  submitBtn.addEventListener('click', async () => {
    const name    = nameEl.value.trim();
    const site    = siteEl.value.trim();
    const content = contentEl.value.trim();

    if (!name) {
      showGbToast('请填写你的昵称', 'error');
      nameEl.focus();
      return;
    }
    if (!content) {
      showGbToast('请写下你的留言内容', 'error');
      contentEl.focus();
      return;
    }
    if (content.length < 2) {
      showGbToast('留言内容太短啦～', 'error');
      return;
    }
    if (site && !site.match(/^https?:\/\/.+/)) {
      showGbToast('网站地址需以 http:// 或 https:// 开头', 'error');
      siteEl.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '发送中...';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, site, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');

      // Reset form
      nameEl.value    = '';
      siteEl.value    = '';
      contentEl.value = '';
      if (countEl) countEl.textContent = '0';

      showGbToast('留言成功！感谢你的留言 ✨');

      // Reload messages from server
      await loadMessages();
      document.getElementById('messagesList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      showGbToast(err.message || '提交失败，请稍后重试', 'error');
    } finally {
      submitBtn.disabled  = false;
      submitBtn.textContent = '发送留言 →';
    }
  });
}

function showGbToast(msg, type) {
  if (typeof showToast === 'function') {
    showToast(msg, type);
    return;
  }
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className   = 'toast show' + (type === 'error' ? ' toast-error' : '');
  setTimeout(() => { toast.className = 'toast'; }, 2800);
}

document.addEventListener('DOMContentLoaded', () => {
  loadMessages();
  initGuestbookForm();
});
