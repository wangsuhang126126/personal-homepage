const THEME = {
  current: localStorage.getItem('wsh-theme') || 'dark',

  init() {
    this.apply(this.current);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.current = theme;
    localStorage.setItem('wsh-theme', theme);
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '◐' : '◑';
  },

  toggle() {
    this.apply(this.current === 'dark' ? 'light' : 'dark');
  }
};

document.addEventListener('DOMContentLoaded', () => THEME.init());
