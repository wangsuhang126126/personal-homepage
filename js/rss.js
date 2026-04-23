/**
 * RSS Feed Generator
 * Generates RSS 2.0 XML from localStorage posts and renders it on feed.html
 */

const RSSGen = (() => {
  const SITE_URL  = 'https://wangsuhang.com';
  const SITE_NAME = 'Wang Suhang\'s Blog';
  const SITE_DESC = '王苏杭的个人博客 — 科技、生活与思考';
  const AUTHOR    = 'Wang Suhang';

  function xmlEsc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function stripTags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function buildXML(posts) {
    const buildDate = new Date().toUTCString();

    const items = posts.slice(0, 20).map(post => {
      const pubDate = new Date(post.date || post.createdAt || Date.now()).toUTCString();
      const desc    = xmlEsc(stripTags(post.content || '').slice(0, 300));
      const tags    = (post.tags || []).map(t => `      <category>${xmlEsc(t)}</category>`).join('\n');
      const link    = `${SITE_URL}/post.html?id=${post.id}`;

      return `    <item>
      <title>${xmlEsc(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${desc}...</description>
      <pubDate>${pubDate}</pubDate>
      <author>${xmlEsc(AUTHOR)}</author>
${tags}
    </item>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xmlEsc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${xmlEsc(SITE_DESC)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>${xmlEsc(AUTHOR)}</managingEditor>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>${xmlEsc(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;
  }

  function getXML() {
    let posts = [];
    try {
      const raw = localStorage.getItem('wsh-posts');
      if (raw) posts = JSON.parse(raw);
    } catch (_) {}
    // Sort newest first
    posts.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    return buildXML(posts);
  }

  return { getXML, xmlEsc };
})();

// ── Render on feed.html ───────────────────────────────────
function renderRSSPage() {
  const container = document.getElementById('rssXmlContent');
  if (!container) return;

  const xml = RSSGen.getXML();

  // Syntax-highlight the XML for display
  const highlighted = xml
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')  // escape first
    .replace(/(&lt;\/?[\w:]+)([\s&])/g, '<span class="xml-tag">$1</span>$2')
    .replace(/(&lt;\/?[\w:]+)(&gt;)/g, '<span class="xml-tag">$1</span>&gt;')
    .replace(/([\w:]+)=&quot;/g, '<span class="xml-attr">$1</span>=&quot;')
    .replace(/&quot;([^&]*)&quot;/g, '&quot;<span class="xml-value">$1</span>&quot;');

  container.innerHTML = highlighted;

  // Copy button
  const copyBtn = document.getElementById('rssCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(xml).then(() => {
        copyBtn.textContent = '已复制 ✓';
        setTimeout(() => { copyBtn.textContent = '复制 XML'; }, 2000);
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = xml;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = '已复制 ✓';
        setTimeout(() => { copyBtn.textContent = '复制 XML'; }, 2000);
      });
    });
  }

  // Download button
  const dlBtn = document.getElementById('rssDownload');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const blob = new Blob([xml], { type: 'application/rss+xml;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'feed.xml';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Post count
  const countEl = document.getElementById('rssPostCount');
  if (countEl) {
    let posts = [];
    try { posts = JSON.parse(localStorage.getItem('wsh-posts') || '[]'); } catch (_) {}
    countEl.textContent = Math.min(posts.length, 20);
  }
}

document.addEventListener('DOMContentLoaded', renderRSSPage);
