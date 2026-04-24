/**
 * Visual Effects Control Panel
 * Injected into every page via script tag.
 * Controls: neural network on/off, pulse on/off + opacity,
 *           node opacity, edge opacity, particle on/off.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Disabled — fx panel removed along with neural net / particles
  return;

  // ── Inject button + panel into nav ──────────────────────
  const navControls = document.querySelector('.nav-controls');
  if (!navControls) return;

  // Button
  const btn = document.createElement('button');
  btn.id = 'fxToggle';
  btn.className = 'fx-toggle';
  btn.title = '视觉效果设置';
  btn.innerHTML = '⚙';
  btn.setAttribute('aria-label', 'Visual effects settings');

  // Panel HTML
  const panel = document.createElement('div');
  panel.id = 'fxPanel';
  panel.className = 'fx-panel';
  panel.innerHTML = `
    <div class="fx-panel-title">视觉效果 / Visual FX</div>

    <div class="fx-row">
      <div>
        <div class="fx-label">神经网络</div>
        <div class="fx-sublabel">Neural Network</div>
      </div>
      <label class="fx-switch">
        <input type="checkbox" id="fxNeural" ${NeuralNet.settings.enabled ? 'checked' : ''}>
        <span class="fx-switch-track"></span>
      </label>
    </div>

    <div class="fx-row" id="rowPulseToggle">
      <div>
        <div class="fx-label">能量脉冲</div>
        <div class="fx-sublabel">Energy Pulse</div>
      </div>
      <label class="fx-switch">
        <input type="checkbox" id="fxPulse" ${NeuralNet.settings.pulseEnabled ? 'checked' : ''}>
        <span class="fx-switch-track"></span>
      </label>
    </div>

    <div class="fx-row" id="rowPulseOpacity">
      <div class="fx-label" style="flex-shrink:0;width:60px;">脉冲强度</div>
      <div class="fx-slider-wrap">
        <input type="range" class="fx-slider" id="fxPulseOp"
          min="0" max="100" value="${Math.round(NeuralNet.settings.pulseOpacity * 100)}">
        <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);font-family:var(--font-mono);">
          <span>0</span>
          <span class="fx-slider-val" id="fxPulseOpVal">${Math.round(NeuralNet.settings.pulseOpacity * 100)}%</span>
          <span>100</span>
        </div>
      </div>
    </div>

    <div class="fx-row">
      <div class="fx-label" style="flex-shrink:0;width:60px;">节点亮度</div>
      <div class="fx-slider-wrap">
        <input type="range" class="fx-slider" id="fxNodeOp"
          min="10" max="100" value="${Math.round(NeuralNet.settings.nodeOpacity * 100)}">
        <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);font-family:var(--font-mono);">
          <span>10</span>
          <span class="fx-slider-val" id="fxNodeOpVal">${Math.round(NeuralNet.settings.nodeOpacity * 100)}%</span>
          <span>100</span>
        </div>
      </div>
    </div>

    <div class="fx-row">
      <div class="fx-label" style="flex-shrink:0;width:60px;">连线亮度</div>
      <div class="fx-slider-wrap">
        <input type="range" class="fx-slider" id="fxEdgeOp"
          min="0" max="100" value="${Math.round(NeuralNet.settings.edgeOpacity * 100)}">
        <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);font-family:var(--font-mono);">
          <span>0</span>
          <span class="fx-slider-val" id="fxEdgeOpVal">${Math.round(NeuralNet.settings.edgeOpacity * 100)}%</span>
          <span>100</span>
        </div>
      </div>
    </div>

    <div class="fx-row">
      <div>
        <div class="fx-label">粒子效果</div>
        <div class="fx-sublabel">Particles</div>
      </div>
      <label class="fx-switch">
        <input type="checkbox" id="fxParticles" checked>
        <span class="fx-switch-track"></span>
      </label>
    </div>
  `;

  // Insert button before theme toggle
  const themeBtn = document.getElementById('themeToggle');
  navControls.insertBefore(btn, themeBtn);

  // Append panel to body (avoids nav overflow clipping)
  document.body.appendChild(panel);

  // ── Toggle panel open/close ──────────────────────────────
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = panel.classList.toggle('open');
    btn.classList.toggle('active', open);
  });

  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove('open');
      btn.classList.remove('active');
    }
  });

  // ── Wire controls ────────────────────────────────────────
  const canvas = document.getElementById('matrix');
  const particlesCanvas = document.getElementById('particles');

  // Neural network on/off
  document.getElementById('fxNeural').addEventListener('change', e => {
    NeuralNet.settings.enabled = e.target.checked;
    if (canvas) canvas.style.transition = 'opacity 0.4s';
    if (canvas) canvas.style.opacity = e.target.checked ? '1' : '0';
    NeuralNet.saveSettings();
  });

  // Pulse on/off
  document.getElementById('fxPulse').addEventListener('change', e => {
    NeuralNet.settings.pulseEnabled = e.target.checked;
    const row = document.getElementById('rowPulseOpacity');
    if (row) row.style.opacity = e.target.checked ? '1' : '0.4';
    NeuralNet.saveSettings();
  });

  // Pulse opacity slider
  const pulseSlider = document.getElementById('fxPulseOp');
  const pulseVal    = document.getElementById('fxPulseOpVal');
  pulseSlider.addEventListener('input', () => {
    const v = parseInt(pulseSlider.value) / 100;
    NeuralNet.settings.pulseOpacity = v;
    pulseVal.textContent = pulseSlider.value + '%';
    NeuralNet.saveSettings();
  });

  // Node opacity slider
  const nodeSlider = document.getElementById('fxNodeOp');
  const nodeVal    = document.getElementById('fxNodeOpVal');
  nodeSlider.addEventListener('input', () => {
    const v = parseInt(nodeSlider.value) / 100;
    NeuralNet.settings.nodeOpacity = v;
    nodeVal.textContent = nodeSlider.value + '%';
    NeuralNet.saveSettings();
  });

  // Edge opacity slider
  const edgeSlider = document.getElementById('fxEdgeOp');
  const edgeVal    = document.getElementById('fxEdgeOpVal');
  edgeSlider.addEventListener('input', () => {
    const v = parseInt(edgeSlider.value) / 100;
    NeuralNet.settings.edgeOpacity = v;
    edgeVal.textContent = edgeSlider.value + '%';
    NeuralNet.saveSettings();
  });

  // Particles on/off
  document.getElementById('fxParticles').addEventListener('change', e => {
    if (!particlesCanvas) return;
    particlesCanvas.style.transition = 'opacity 0.4s';
    particlesCanvas.style.opacity = e.target.checked ? '1' : '0';
    // Also pause/resume animation
    if (typeof ParticleSystem !== 'undefined') {
      if (!e.target.checked && ParticleSystem.animFrame) {
        cancelAnimationFrame(ParticleSystem.animFrame);
        ParticleSystem.animFrame = null;
      } else if (e.target.checked && !ParticleSystem.animFrame) {
        ParticleSystem.animate();
      }
    }
  });

  // Init pulse row state
  if (!NeuralNet.settings.pulseEnabled) {
    const row = document.getElementById('rowPulseOpacity');
    if (row) row.style.opacity = '0.4';
  }
});
