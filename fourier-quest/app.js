// app.js — Main game logic for FOURIER QUEST

import {
  generateWaveform,
  calcRMSE,
  calcStars,
  calcSpectrumBins,
  calcMatchPct,
} from './fourier.js';
import { WaveCanvas, SpectrumCanvas, ParticleEffect } from './renderer.js';
import { STAGES } from './stages.js';

// ─── State ───────────────────────────────────────────────
const state = {
  stage:       null,
  params:      [],      // [{amplitude, frequency, phase}]
  submitted:   false,
  hintVisible: false,
  audioCtx:    null,
  oscillators: [],
  animId:      null,
};

// ─── DOM helpers ─────────────────────────────────────────
const $  = id => document.getElementById(id);
const show = (el, visible = true) => el.classList.toggle('hidden', !visible);

// ─── Canvas instances ─────────────────────────────────────
let waveRenderer, spectrumRenderer, particles;

// ─── Entry point ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const params  = new URLSearchParams(location.search);
  const stageId = params.get('stage') || 'tutorial-1';
  const stage   = STAGES[stageId];

  if (!stage) {
    document.body.innerHTML = `<p style="color:#f66;padding:2rem">Stage not found: ${stageId}</p>`;
    return;
  }

  state.stage = stage;
  initGame();
});

// ─── Init ────────────────────────────────────────────────
function initGame() {
  const { stage } = state;

  // Header
  $('world-name').textContent   = stage.world;
  $('stage-index').textContent  = stage.indexLabel;
  $('stage-title').textContent  = stage.title;
  $('hint-text').textContent    = stage.hint;

  // Init player param objects from stage definition
  state.params = stage.playerInit.map(def => ({
    amplitude: def.amplitude.value,
    frequency: def.frequency.value,
    phase:     def.phase.value,
    _def: def,
  }));

  // Build slider UI
  buildSliders();

  // Init renderers (after a small delay to let CSS layout settle)
  setTimeout(() => {
    waveRenderer     = new WaveCanvas($('wave-canvas'));
    spectrumRenderer = new SpectrumCanvas($('spectrum-canvas'));
    particles        = new ParticleEffect($('fx-canvas'));

    startLoop();
  }, 60);

  // Story overlay
  $('story-world').textContent  = `${stage.world} · ${stage.indexLabel}`;
  $('story-htitle').textContent = stage.storyTitle;
  $('story-title').textContent  = stage.title;
  $('story-text').textContent   = stage.story;
  show($('story-overlay'), true);

  // Events
  $('story-start').addEventListener('click', () => {
    show($('story-overlay'), false);
  });
  $('hint-btn').addEventListener('click', toggleHint);
  $('reset-btn').addEventListener('click', resetSliders);
  $('submit-btn').addEventListener('click', submitAnswer);
  $('retry-btn').addEventListener('click', () => {
    state.submitted = false;
    show($('result-overlay'), false);
    resetSliders();
    $('submit-btn').disabled = false;
    $('submit-btn').textContent = 'SUBMIT';
  });
  $('next-btn').addEventListener('click', goNext);
  $('play-btn').addEventListener('click', playAudio);

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !state.submitted) submitAnswer();
    if (e.key === 'h' || e.key === 'H') toggleHint();
  });
}

// ─── Sliders ─────────────────────────────────────────────
function buildSliders() {
  const container = $('sliders-container');
  container.innerHTML = '';

  state.stage.playerInit.forEach((def, idx) => {
    const params = ['amplitude', 'frequency', 'phase'];
    params.forEach(param => {
      const p = def[param];
      if (p.fixed) return;

      const group = document.createElement('div');
      group.className = 'slider-group';
      group.dataset.idx   = idx;
      group.dataset.param = param;

      const valueId = `sv-${idx}-${param}`;
      group.innerHTML = `
        <div class="slider-header">
          <span class="slider-label">${p.label || param}</span>
          <span class="slider-val" id="${valueId}">${fmt(p.value, param)}</span>
        </div>
        <input type="range" class="slider-input"
          id="si-${idx}-${param}"
          min="${p.min}" max="${p.max}" step="${p.step}"
          value="${p.value}">
        <div class="slider-range-labels">
          <span>${fmt(p.min, param)}</span>
          <span>${fmt(p.max, param)}</span>
        </div>
      `;
      container.appendChild(group);

      const input = group.querySelector('input');
      input.addEventListener('input', () => {
        const val = parseFloat(input.value);
        state.params[idx][param] = val;
        $(`sv-${idx}-${param}`).textContent = fmt(val, param);
        updateScoreBar();
      });
    });
  });
}

function fmt(val, param) {
  if (param === 'phase')     return (val >= 0 ? '+' : '') + val.toFixed(2) + ' rad';
  if (param === 'frequency') return val.toFixed(1) + ' Hz';
  return val.toFixed(2);
}

function resetSliders() {
  state.stage.playerInit.forEach((def, idx) => {
    ['amplitude', 'frequency', 'phase'].forEach(param => {
      const p = def[param];
      if (p.fixed) return;
      state.params[idx][param] = p.value;
      const input = $(`si-${idx}-${param}`);
      const val   = $(`sv-${idx}-${param}`);
      if (input) { input.value = p.value; }
      if (val)   { val.textContent = fmt(p.value, param); }
    });
  });
  updateScoreBar();
}

// ─── Game Loop ───────────────────────────────────────────
function startLoop() {
  function loop() {
    if (!waveRenderer || !spectrumRenderer) { state.animId = requestAnimationFrame(loop); return; }

    const { stage, params } = state;
    const targetSamples = generateWaveform(stage.targetComponents);
    const playerSamples = generateWaveform(params);
    const targetBins    = calcSpectrumBins(stage.targetComponents, stage.spectrumMaxBin);
    const playerBins    = calcSpectrumBins(params, stage.spectrumMaxBin);

    waveRenderer.render(targetSamples, playerSamples);
    spectrumRenderer.render(targetBins, playerBins);

    state.animId = requestAnimationFrame(loop);
  }
  state.animId = requestAnimationFrame(loop);
}

// ─── Score bar (live) ─────────────────────────────────────
function updateScoreBar() {
  const { stage, params } = state;
  const target = generateWaveform(stage.targetComponents, 256);
  const player = generateWaveform(params, 256);
  const rmse   = calcRMSE(target, player);
  const pct    = calcMatchPct(rmse);

  $('score-fill').style.width = pct + '%';
  $('score-value').textContent = pct + '%';

  // Color shift: red → yellow → green
  const hue = Math.round(pct * 1.2);   // 0 → 0 (red), 100 → 120 (green)
  $('score-fill').style.background =
    `linear-gradient(90deg, hsl(${hue},100%,45%), hsl(${hue + 20},100%,60%))`;
  $('score-fill').style.boxShadow =
    `0 0 12px hsl(${hue},100%,45%), 0 0 4px hsl(${hue},100%,60%)`;
}

// ─── Submit ──────────────────────────────────────────────
function submitAnswer() {
  if (state.submitted) return;
  state.submitted = true;

  const { stage, params } = state;
  const target = generateWaveform(stage.targetComponents);
  const player = generateWaveform(params);
  const rmse   = calcRMSE(target, player);
  const stars  = calcStars(rmse, stage.thresholds);
  const pct    = calcMatchPct(rmse);

  // Save
  saveResult(stage.id, stars);

  // Particle burst on 2★ or better
  if (stars >= 2) {
    const fxCanvas = $('fx-canvas');
    const rect = fxCanvas.getBoundingClientRect();
    const cx = (rect.width / 2)  * (window.devicePixelRatio || 1);
    const cy = (rect.height / 2) * (window.devicePixelRatio || 1);
    particles.burst(cx, cy, 80 + stars * 20);
  }

  // Show result
  const starHTML = '★'.repeat(stars) + '<span class="empty-stars">' + '☆'.repeat(3 - stars) + '</span>';
  $('result-stars').innerHTML = starHTML;
  $('result-stars').dataset.stars = stars;
  $('result-pct').textContent  = `マッチ率 ${pct}%   RMSE ${rmse.toFixed(4)}`;
  $('result-flavor').textContent = stars >= 2
    ? stage.successText
    : (stars === 1 ? '「惜しい。もう少しだ。再挑戦してみろ。」' : '「まだ遠い。波を感じろ。」');

  // Hide next button if no next stage
  show($('next-btn'), !!stage.unlockNext);

  show($('result-overlay'), true);
  $('submit-btn').disabled = true;
}

// ─── Navigation ──────────────────────────────────────────
function goNext() {
  const next = state.stage.unlockNext;
  if (next) {
    location.href = `game.html?stage=${next}`;
  } else {
    location.href = 'index.html';
  }
}

// ─── Hint ────────────────────────────────────────────────
function toggleHint() {
  state.hintVisible = !state.hintVisible;
  show($('hint-panel'), state.hintVisible);
  $('hint-btn').classList.toggle('active', state.hintVisible);
}

// ─── Audio Preview ────────────────────────────────────────
function playAudio() {
  // Stop any running preview
  stopAudio();

  try {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = state.audioCtx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.25;
    masterGain.connect(ctx.destination);

    state.oscillators = state.params.map(p => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = p.frequency * 55;   // map to audible range ~55–440 Hz
      gain.gain.value = p.amplitude;
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      // Fade out
      gain.gain.setValueAtTime(p.amplitude, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
      osc.stop(ctx.currentTime + 2.1);
      return osc;
    });

    $('play-btn').textContent = '▶ PLAYING…';
    setTimeout(() => { $('play-btn').textContent = '▶ PLAY'; }, 2200);
  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

function stopAudio() {
  if (state.oscillators) state.oscillators.forEach(o => { try { o.stop(); } catch (_) {} });
  if (state.audioCtx)    { try { state.audioCtx.close(); } catch (_) {} }
  state.oscillators = [];
  state.audioCtx    = null;
}

// ─── Save / Load ──────────────────────────────────────────
function saveResult(stageId, stars) {
  try {
    const key  = 'fq-save';
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    if (!data.stages) data.stages = {};
    const prev = data.stages[stageId]?.stars || 0;
    data.stages[stageId] = { stars: Math.max(prev, stars), cleared: stars > 0 };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}
