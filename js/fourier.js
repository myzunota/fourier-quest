// fourier.js — Core math engine (no DOM dependencies)

/**
 * Synthesize N sine waves at normalized time t ∈ [0, 1)
 * y(t) = Σ Aₙ sin(2π fₙ t + φₙ)
 */
export function synthesize(components, t) {
  let sum = 0;
  for (const c of components) {
    sum += c.amplitude * Math.sin(2 * Math.PI * c.frequency * t + c.phase);
  }
  return sum;
}

/**
 * Generate N discrete samples of a waveform over one period.
 */
export function generateWaveform(components, N = 512) {
  const samples = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    samples[i] = synthesize(components, i / N);
  }
  return samples;
}

/**
 * Root Mean Square Error between two waveforms.
 */
export function calcRMSE(target, player) {
  const N = Math.min(target.length, player.length);
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const d = target[i] - player[i];
    sum += d * d;
  }
  return Math.sqrt(sum / N);
}

/**
 * Convert RMSE to star count using per-stage thresholds.
 */
export function calcStars(rmse, thresholds) {
  if (rmse <= thresholds.s3) return 3;
  if (rmse <= thresholds.s2) return 2;
  if (rmse <= thresholds.s1) return 1;
  return 0;
}

/**
 * Map components to discrete frequency bins (for spectrum display).
 * Returns Float32Array of length maxBin+1, indexed by integer Hz.
 */
export function calcSpectrumBins(components, maxBin = 10) {
  const bins = new Float32Array(maxBin + 1);
  for (const c of components) {
    const k = Math.round(Math.abs(c.frequency));
    if (k >= 0 && k <= maxBin) {
      bins[k] = Math.max(bins[k], c.amplitude);
    }
  }
  return bins;
}

/**
 * Convert RMSE → match percentage 0–100.
 */
export function calcMatchPct(rmse) {
  return Math.max(0, Math.min(100, Math.round((1 - rmse / 0.5) * 100)));
}
