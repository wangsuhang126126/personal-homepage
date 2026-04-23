// Seed demo posts on first load
(function seedDemoData() {
  const SEEDED_KEY = 'wsh-seeded-v1';
  if (localStorage.getItem(SEEDED_KEY)) return;

  const demoPosts = [
    {
      id: 'demo-1',
      title: '你好，世界',
      subtitle: '这是我个人网站的第一篇文章',
      tag: '随笔',
      lang: 'zh',
      excerpt: '每一段旅程都从第一步开始。今天，我搭建了自己的个人网站，用来记录生活、分享想法。',
      content: `<h2>开始</h2>
<p>每一段旅程都从第一步开始。今天，我搭建了自己的个人网站，用来记录生活、分享想法。</p>
<p>这个网站将是我的个人空间，没有算法推荐，没有信息茧房，只有真实的记录。</p>
<h2>为什么要有个人网站？</h2>
<p>在这个社交媒体主导的时代，拥有一个独立的个人网站变得越来越珍贵。它是完全属于自己的角落，可以自由地表达和记录。</p>
<blockquote>「互联网的意义在于连接，而个人网站则是最纯粹的连接方式。」</blockquote>
<p>接下来，我会在这里写博客、分享照片、记录旅行，希望这里能成为一个有温度的地方。</p>`,
      status: 'published',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'demo-2',
      title: '关于摄影这件事',
      subtitle: '用镜头看世界',
      tag: '摄影',
      lang: 'zh',
      excerpt: '摄影不只是按下快门，更是一种观察世界的方式。每一张照片背后，都有一个被定格的瞬间。',
      content: `<h2>摄影改变了我看世界的方式</h2>
<p>拿起相机的那一刻，你开始以不同的眼光看待身边的一切。光线、构图、色彩……这些原本被忽视的细节，突然变得无比重要。</p>
<h2>器材不是最重要的</h2>
<p>很多人刚开始摄影时，都会陷入「器材焦虑」。但我越来越觉得，最重要的是你的眼睛，和你对世界的感知。</p>
<p>一部手机，在对的光线、对的时机，也能拍出令人动容的照片。</p>
<h2>我最喜欢的拍摄主题</h2>
<ul>
<li>城市街拍：记录人与城市的关系</li>
<li>风光摄影：自然的壮美永远令人敬畏</li>
<li>人像：定格真实的情感瞬间</li>
</ul>
<p>未来，我会在相册里分享更多作品。期待与你们交流。</p>`,
      status: 'published',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'demo-3',
      title: 'Hello World',
      subtitle: 'First post in English',
      tag: 'Life',
      lang: 'en',
      excerpt: 'Every journey begins with a single step. Welcome to my little corner of the internet.',
      content: `<h2>Welcome</h2>
<p>This is my personal website — a place to write, share photos, and document life.</p>
<p>I'll be posting in Chinese, Japanese, and English. Feel free to switch languages using the selector in the nav bar.</p>
<h2>What to expect</h2>
<ul>
<li>Blog posts about photography, technology, and life</li>
<li>A photo gallery of places I've been</li>
<li>Random thoughts and discoveries</li>
</ul>
<p>Thanks for stopping by!</p>`,
      status: 'published',
      date: new Date().toISOString(),
    },
  ];

  const existing = JSON.parse(localStorage.getItem('wsh-posts') || '[]');
  if (existing.length === 0) {
    localStorage.setItem('wsh-posts', JSON.stringify(demoPosts));
  }

  localStorage.setItem(SEEDED_KEY, '1');
})();
