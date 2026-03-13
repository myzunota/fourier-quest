// renderer.js — Canvas drawing engine (neon/cyber aesthetic)

export class WaveCanvas {
  constructor(canvasEl) {
    this.el = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    // Smooth interpolation for animated values
    this._playerSmooth = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.el.getBoundingClientRect();
    this.w = rect.width  || this.el.clientWidth  || 600;
    this.h = rect.height || this.el.clientHeight || 300;
    this.el.width  = this.w * dpr;
    this.el.height = this.h * dpr;
    this.ctx.scale(dpr, dpr);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  drawGrid() {
    const { ctx, w, h } = this;
    ctx.save();

    // Fine grid
    ctx.strokeStyle = 'rgba(13, 31, 51, 0.9)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 1; i < 8; i++) {
      const y = (i / 8) * h;
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    for (let i = 1; i < 12; i++) {
      const x = (i / 12) * w;
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    ctx.stroke();

    // Zero line
    ctx.strokeStyle = 'rgba(26, 58, 92, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // ±1 amplitude guides (dashed)
    ctx.strokeStyle = 'rgba(13, 42, 68, 0.6)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 10]);
    const margin = h * 0.05;
    ctx.beginPath();
    ctx.moveTo(0, margin);     ctx.lineTo(w, margin);
    ctx.moveTo(0, h - margin); ctx.lineTo(w, h - margin);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis labels
    ctx.fillStyle = 'rgba(42, 58, 80, 0.8)';
    ctx.font = `10px 'Share Tech Mono', 'Courier New', monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('+1.0', 5, margin + 12);
    ctx.fillText(' 0.0', 5, h / 2 + 4);
    ctx.fillText('-1.0', 5, h - margin + 12);

    ctx.restore();
  }

  _buildPath(samples) {
    const { ctx, w, h } = this;
    const N = samples.length;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * w;
      const y = h / 2 - samples[i] * h * 0.43;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
  }

  drawTargetWave(samples) {
    const { ctx } = this;
    ctx.save();

    // Soft outer halo
    this._buildPath(samples);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Main line
    this._buildPath(samples);
    ctx.strokeStyle = 'rgba(255,255,255,0.72)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Subtle inner bright core
    this._buildPath(samples);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  drawPlayerWave(samples) {
    const { ctx } = this;
    ctx.save();

    // Far glow
    this._buildPath(samples);
    ctx.strokeStyle = 'rgba(0,255,136,0.04)';
    ctx.lineWidth = 18;
    ctx.stroke();

    // Mid glow
    this._buildPath(samples);
    ctx.shadowColor = '#00FF88';
    ctx.shadowBlur = 22;
    ctx.strokeStyle = 'rgba(0,255,136,0.35)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Core glow
    this._buildPath(samples);
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#00FF88';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Inner bright core
    this._buildPath(samples);
    ctx.shadowBlur = 4;
    ctx.strokeStyle = 'rgba(140,255,200,0.9)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  render(targetSamples, playerSamples) {
    this.resize(); // handle any layout changes
    this.clear();
    this.drawGrid();
    this.drawTargetWave(targetSamples);
    this.drawPlayerWave(playerSamples);
  }
}

export class SpectrumCanvas {
  constructor(canvasEl) {
    this.el = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this._smoothBins = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.el.getBoundingClientRect();
    this.w = rect.width  || this.el.clientWidth  || 240;
    this.h = rect.height || this.el.clientHeight || 300;
    this.el.width  = this.w * dpr;
    this.el.height = this.h * dpr;
    this.ctx.scale(dpr, dpr);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  render(targetBins, playerBins) {
    const { ctx, w, h } = this;
    this.resize();
    this.clear();

    // Smooth player bins
    if (!this._smoothBins || this._smoothBins.length !== playerBins.length) {
      this._smoothBins = new Float32Array(playerBins);
    }
    for (let i = 0; i < playerBins.length; i++) {
      this._smoothBins[i] += (playerBins[i] - this._smoothBins[i]) * 0.25;
    }

    const N   = targetBins.length;
    const padL = 24, padR = 8, padB = 34, padT = 10;
    const plotW = w - padL - padR;
    const plotH = h - padB - padT;
    const barW  = Math.max(3, (plotW / N) * 0.55);
    const step  = plotW / N;

    // Background grid
    ctx.strokeStyle = 'rgba(13, 31, 51, 0.8)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 1; i <= 4; i++) {
      const y = padT + plotH - (i / 4) * plotH;
      ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y);
    }
    ctx.stroke();

    // Amplitude axis labels
    ctx.fillStyle = 'rgba(42, 66, 100, 0.8)';
    ctx.font = `9px 'Share Tech Mono', monospace`;
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padT + plotH - (i / 4) * plotH;
      ctx.fillText((i * 0.25).toFixed(2), padL - 2, y + 3);
    }

    for (let i = 0; i < N; i++) {
      const cx = padL + step * i + step / 2;
      const tH  = targetBins[i]          * plotH * 0.9;
      const pH  = this._smoothBins[i] * plotH * 0.9;

      // Target bar (white ghost)
      if (tH > 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fillRect(cx - barW / 2, padT + plotH - tH, barW, tH);
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cx - barW / 2, padT + plotH - tH, barW, tH);
      }

      // Player bar (cyan neon)
      if (pH > 0.5) {
        ctx.save();
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#00D4FF';
        ctx.fillRect(cx - barW / 2 + 2, padT + plotH - pH, barW - 4, pH);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Frequency label
      ctx.fillStyle = 'rgba(42, 74, 110, 0.9)';
      ctx.font = `8px 'Share Tech Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(i, cx, h - padB + 14);
    }

    // Baseline
    ctx.strokeStyle = 'rgba(26, 58, 92, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH);
    ctx.stroke();

    // X-axis label
    ctx.fillStyle = 'rgba(42, 74, 110, 0.7)';
    ctx.font = `9px 'Share Tech Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('FREQUENCY  (Hz)', w / 2, h - 4);
  }
}

/**
 * Particle burst effect for stage clear.
 */
export class ParticleEffect {
  constructor(canvasEl) {
    this.el = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.particles = [];
    this.running = false;
  }

  burst(x, y, count = 80, colors = ['#00FF88', '#00D4FF', '#FFD700', '#FF6B9D']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1.0,
        decay: 0.012 + Math.random() * 0.018,
        r: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    if (!this.running) this._loop();
  }

  _loop() {
    this.running = true;
    const { ctx, el } = this;
    const dpr = window.devicePixelRatio || 1;
    const w = el.clientWidth, h = el.clientHeight;
    ctx.clearRect(0, 0, w * dpr, h * dpr);

    this.particles = this.particles.filter(p => p.life > 0);

    for (const p of this.particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.12;  // gravity
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x / dpr, p.y / dpr, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this._loop());
    } else {
      this.running = false;
      ctx.clearRect(0, 0, w * dpr, h * dpr);
    }
  }
}
