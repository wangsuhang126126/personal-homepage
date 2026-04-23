// Inject SVG logo into all .nav-logo elements
const LOGO_SVG = `<svg class="logo-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Wang Suhang Logo">
  <defs>
    <linearGradient id="logoGrad" x1="5" y1="5" x2="75" y2="75" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00d4ff"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <filter id="logoGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Outer hex ring (double line for depth) -->
  <polygon points="40,3 74,22 74,58 40,77 6,58 6,22"
           stroke="url(#logoGrad)" stroke-width="2" filter="url(#logoGlow)" opacity="0.9"/>
  <polygon points="40,8 69,25 69,55 40,72 11,55 11,25"
           stroke="url(#logoGrad)" stroke-width="0.5" opacity="0.25"/>

  <!-- 6 corner solder-joint dots -->
  <circle cx="40" cy="3"  r="2.8" fill="url(#logoGrad)" filter="url(#dotGlow)"/>
  <circle cx="74" cy="22" r="2.8" fill="url(#logoGrad)" filter="url(#dotGlow)"/>
  <circle cx="74" cy="58" r="2.8" fill="url(#logoGrad)" filter="url(#dotGlow)"/>
  <circle cx="40" cy="77" r="2.8" fill="url(#logoGrad)" filter="url(#dotGlow)"/>
  <circle cx="6"  cy="58" r="2.8" fill="url(#logoGrad)" filter="url(#dotGlow)"/>
  <circle cx="6"  cy="22" r="2.8" fill="url(#logoGrad)" filter="url(#dotGlow)"/>

  <!-- Side circuit-board trace pins -->
  <rect x="1"  y="35" width="7" height="2" rx="1" fill="#00d4ff" opacity="0.55"/>
  <rect x="1"  y="43" width="7" height="2" rx="1" fill="#00d4ff" opacity="0.35"/>
  <rect x="72" y="35" width="7" height="2" rx="1" fill="#7c3aed" opacity="0.55"/>
  <rect x="72" y="43" width="7" height="2" rx="1" fill="#7c3aed" opacity="0.35"/>

  <!-- W letterform — bold, angular (represents Wang + photovoltaic wave) -->
  <polyline
    points="19,28 27,54 34.5,36 40,48 45.5,36 53,54 61,28"
    stroke="url(#logoGrad)" stroke-width="4.5"
    stroke-linecap="square" stroke-linejoin="miter"
    filter="url(#logoGlow)"/>

  <!-- Solar cell cross at left W-peak (photovoltaic reference) -->
  <line x1="34.5" y1="29" x2="34.5" y2="36" stroke="#00d4ff" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
  <line x1="30"   y1="32" x2="39"   y2="32" stroke="#00d4ff" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>

  <!-- Solar cell cross at right W-peak -->
  <line x1="45.5" y1="29" x2="45.5" y2="36" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
  <line x1="41"   y1="32" x2="50"   y2="32" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
</svg>`;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-logo').forEach(el => {
    // Replace the hex emoji with SVG
    el.innerHTML = LOGO_SVG + `<span class="logo-text">WSH</span>`;
  });
  document.querySelectorAll('.footer-brand').forEach(el => {
    const svg = LOGO_SVG.replace('class="logo-svg"', 'class="logo-svg" style="width:28px;height:28px;"');
    el.innerHTML = svg + `<span class="footer-name">Wang Suhang</span>`;
  });
});
