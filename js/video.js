// ── Video URL parser ──────────────────────────────────────
const VideoUtils = {
  parse(url) {
    url = url.trim();
    // YouTube: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (yt) return { platform: 'youtube', id: yt[1] };

    // Bilibili: bilibili.com/video/BVxxx or av123
    const bili = url.match(/bilibili\.com\/video\/(BV[A-Za-z0-9]+|av\d+)/i);
    if (bili) return { platform: 'bilibili', id: bili[1] };

    // Plain video ID fallback (user just typed the ID)
    if (/^BV[A-Za-z0-9]+$/i.test(url)) return { platform: 'bilibili', id: url };
    if (/^[A-Za-z0-9_-]{11}$/.test(url)) return { platform: 'youtube', id: url };

    return null;
  },

  embedUrl(platform, id) {
    if (platform === 'youtube') return `https://www.youtube.com/embed/${id}?rel=0`;
    if (platform === 'bilibili') return `//player.bilibili.com/player.html?bvid=${id}&page=1&high_quality=1&danmaku=0`;
    return null;
  },

  thumbnailUrl(platform, id) {
    if (platform === 'youtube') return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    return null; // Bilibili doesn't allow direct thumb hotlinking easily
  },

  platformLabel(platform) {
    return platform === 'youtube' ? 'YouTube' : 'Bilibili';
  },

  platformColor(platform) {
    return platform === 'youtube' ? 'badge-youtube' : 'badge-bilibili';
  }
};

// Make available globally
window.VideoUtils = VideoUtils;
