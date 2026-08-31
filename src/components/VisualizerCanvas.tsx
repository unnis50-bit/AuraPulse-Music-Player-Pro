import React, { useEffect, useRef } from 'react';
import { VisualizerMode } from '../types';
import { audioEngine } from '../services/audioEngine';

interface VisualizerCanvasProps {
  mode: VisualizerMode;
  isPlaying: boolean;
  accentColor?: string;
  className?: string;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  mode,
  isPlaying,
  accentColor = '#10b981',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const peakHold = useRef<number[]>([]);
  const peakHoldTime = useRef<number[]>([]);
  const peakSpeed = useRef<number[]>([]);
  const smoothedData = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(Date.now());
  const bassEnergyRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let displayWidth = canvas.parentElement?.clientWidth || 340;
    let displayHeight = canvas.parentElement?.clientHeight || 240;

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      displayWidth = canvas.parentElement?.clientWidth || 340;
      displayHeight = canvas.parentElement?.clientHeight || 240;

      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          updateCanvasSize();
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Dynamic Logarithmic Frequency Binning with Acoustic Equal-Energy Compensation
    const sampleLogFrequencies = (raw: Uint8Array, numBands: number): { bands: number[]; bassEnergy: number } => {
      const result: number[] = new Array(numBands).fill(0);
      const totalBins = raw.length;
      if (totalBins === 0) return { bands: result, bassEnergy: 0 };

      // Calculate instantaneous bass energy (bins 1 to 6 = 40Hz to 160Hz kick region)
      let bassSum = 0;
      for (let b = 1; b <= Math.min(6, totalBins - 1); b++) {
        bassSum += raw[b] || 0;
      }
      const bassEnergy = bassSum / (6 * 255);

      const minLog = Math.log10(1);
      const maxLog = Math.log10(totalBins * 0.92);

      for (let i = 0; i < numBands; i++) {
        const startNorm = i / numBands;
        const endNorm = (i + 1) / numBands;

        const startBin = Math.min(
          totalBins - 1,
          Math.max(1, Math.floor(Math.pow(10, minLog + startNorm * (maxLog - minLog))))
        );
        const endBin = Math.max(
          startBin + 1,
          Math.min(totalBins, Math.ceil(Math.pow(10, minLog + endNorm * (maxLog - minLog))))
        );

        let sum = 0;
        let count = 0;
        for (let b = startBin; b < endBin; b++) {
          sum += raw[b] || 0;
          count++;
        }

        const avg = count > 0 ? sum / count : 0;

        // Acoustic Equal-Loudness Compensation Curve:
        // Boosts treble & mid-high frequencies so hi-hats, snares and vocals dance with high visual energy
        const bandRatio = i / numBands;
        const trebleBoost = 1.0 + Math.pow(bandRatio, 0.5) * 1.65;
        const bassContour = bandRatio < 0.15 ? 1.15 : 1.0;
        const weight = trebleBoost * bassContour;

        // Dynamic Expander: Accentuates kicks and beat attacks
        const valNorm = avg / 255;
        const expanded = Math.pow(valNorm, 1.28) * weight * 0.95;

        // Headroom clamp: dynamic response ranges 0.05 to ~0.85 on huge drops
        result[i] = Math.max(0, Math.min(0.92, expanded));
      }

      return { bands: result, bassEnergy };
    };

    const render = () => {
      animFrameId.current = requestAnimationFrame(render);
      const now = Date.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.08);
      lastTimeRef.current = now;

      const maxBands = 64;
      const rawFreqData = audioEngine.getFrequencyData();
      const { bands: targetData, bassEnergy } = sampleLogFrequencies(rawFreqData, maxBands);

      // Smooth bass energy tracking for global rhythmic glow
      bassEnergyRef.current += (bassEnergy - bassEnergyRef.current) * 0.25;

      if (smoothedData.current.length !== maxBands) {
        smoothedData.current = new Array(maxBands).fill(0);
        peakHold.current = new Array(maxBands).fill(0);
        peakHoldTime.current = new Array(maxBands).fill(0);
        peakSpeed.current = new Array(maxBands).fill(0);
      }

      // Fast responsive attack (0 lag) + Snappy rhythmic gravitational decay
      for (let i = 0; i < maxBands; i++) {
        let raw = targetData[i] || 0;
        if (!isPlaying) {
          // Minimal resting idle wave when paused
          raw = 0.02 + Math.sin(now * 0.002 + i * 0.3) * 0.015;
        }

        if (raw >= smoothedData.current[i]) {
          // Instant attack on beat hit
          smoothedData.current[i] = raw;
        } else {
          // Snappy decay with bounce physics
          const decayRate = 1.6 + smoothedData.current[i] * 2.8;
          smoothedData.current[i] = Math.max(0, smoothedData.current[i] - decayRate * dt);
        }
      }

      const freqData = smoothedData.current;
      const width = displayWidth;
      const height = displayHeight;

      ctx.clearRect(0, 0, width, height);

      // =========================================================================
      // STYLE 1: CLASSIC WINAMP SPECTRUM ANALYZER (IMAGE 1)
      // =========================================================================
      if (mode === 'winamp-classic') {
        const framePadX = 6;
        const framePadY = 6;
        const innerW = width - framePadX * 2;
        const innerH = height - framePadY * 2;
        const headerH = 18;
        const footerH = 14;

        // Outer Winamp Chiseled Bezel
        ctx.fillStyle = '#2d2d3e';
        ctx.fillRect(framePadX, framePadY, innerW, innerH);

        // 3D Bezel Highlights & Shadows
        ctx.strokeStyle = '#4e4e6b';
        ctx.lineWidth = 1;
        ctx.strokeRect(framePadX + 0.5, framePadY + 0.5, innerW - 1, innerH - 1);
        ctx.fillStyle = '#161622';
        ctx.fillRect(framePadX + 1, framePadY + innerH - 1, innerW - 1, 1);

        // Header Title Bar
        ctx.fillStyle = '#1f1f2e';
        ctx.fillRect(framePadX + 2, framePadY + 2, innerW - 4, headerH);
        ctx.fillStyle = '#a5a5c7';
        ctx.font = 'bold 9px monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CLASSIC SPECTRUM ANALYZER', framePadX + innerW / 2, framePadY + 12);

        // Window buttons (minimize/close)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(framePadX + innerW - 12, framePadY + 6, 6, 6);

        // Footer Bar
        ctx.fillStyle = '#1a1a24';
        ctx.fillRect(framePadX + 2, framePadY + innerH - footerH, innerW - 4, footerH - 2);
        ctx.fillStyle = '#8e8ea8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WINAMP SPECTRUM', framePadX + innerW / 2, framePadY + innerH - 5);

        // Inner Pitch Black CRT Screen
        const screenX = framePadX + 4;
        const screenY = framePadY + headerH + 3;
        const screenW = innerW - 8;
        const screenH = innerH - headerH - footerH - 5;

        ctx.fillStyle = '#050508';
        ctx.fillRect(screenX, screenY, screenW, screenH);
        ctx.strokeStyle = '#0f0f18';
        ctx.strokeRect(screenX, screenY, screenW, screenH);

        // Render Winamp Segmented Bars
        const barCount = 28;
        const barGap = 2;
        const barWidth = Math.max(2.5, (screenW - (barCount - 1) * barGap) / barCount);
        const segHeight = 3;
        const segGap = 1.5;
        const unit = segHeight + segGap;
        const totalSegs = Math.max(8, Math.floor((screenH - 6) / unit));
        const baseline = screenY + screenH - 3;

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 48);
          const normVal = freqData[sampleIdx] || 0;
          const activeSegs = Math.min(totalSegs - 1, Math.max(0, Math.round(normVal * (totalSegs - 1))));
          const x = screenX + i * (barWidth + barGap);

          // Peak physics
          if (activeSegs >= peakHold.current[i]) {
            peakHold.current[i] = activeSegs;
            peakHoldTime.current[i] = now + 260; // 260ms hover at peak
            peakSpeed.current[i] = 0;
          } else if (now > peakHoldTime.current[i]) {
            peakSpeed.current[i] = (peakSpeed.current[i] || 0) + 32 * dt;
            peakHold.current[i] = Math.max(0, peakHold.current[i] - peakSpeed.current[i] * dt);
          }

          const currentPeakSeg = Math.floor(peakHold.current[i]);

          // Draw Winamp LED segments from bottom to top
          for (let s = 0; s < totalSegs; s++) {
            const segY = baseline - (s + 1) * unit;
            const ratio = s / totalSegs;

            // Authentic Winamp Color Spectrum:
            // Lows (0 - 28%): Deep Crimson Red
            // Low-Mid (28 - 52%): Blaze Orange
            // Mid-High (52 - 76%): Bright Amber Gold
            // Highs (76 - 100%): Electric Lime Green
            let segColor = '#dc2626';
            if (ratio >= 0.76) {
              segColor = '#84cc16';
            } else if (ratio >= 0.52) {
              segColor = '#eab308';
            } else if (ratio >= 0.28) {
              segColor = '#f97316';
            }

            if (s < activeSegs) {
              ctx.fillStyle = segColor;
              ctx.fillRect(x, segY, barWidth, segHeight);

              // Specular shine on active LED segment
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fillRect(x, segY, barWidth, 1);
            }
          }

          // Floating Winamp Peak Cap (Bright White LED Cap)
          if (currentPeakSeg > 0 && currentPeakSeg < totalSegs) {
            const peakY = baseline - currentPeakSeg * unit;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, peakY, barWidth, segHeight);
            // Peak cap glow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(x - 0.5, peakY - 0.5, barWidth + 1, segHeight + 1);
          }
        }
      }

      // =========================================================================
      // STYLE 2: PIONEER / CAR HI-FI 3-ZONE LCD VU ANALYZER (IMAGE 2)
      // =========================================================================
      else if (mode === 'hifi-vumeter') {
        const frameX = 8;
        const frameY = 8;
        const frameW = width - 16;
        const frameH = height - 16;

        // Dark Hi-Fi LCD Screen
        ctx.fillStyle = '#060a0f';
        ctx.fillRect(frameX, frameY, frameW, frameH);

        // Hi-Fi Metallic Screen Border
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(frameX, frameY, frameW, frameH);

        // Left Channel Stereo Badge ("L" / "D" / "R")
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('L', frameX + 8, frameY + 26);
        ctx.fillStyle = '#64748b';
        ctx.fillText('D', frameX + 8, frameY + 44);

        // Top Right Hi-Fi Level Text
        ctx.font = '10px monospace';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'right';
        ctx.fillText('VU 32', frameX + frameW - 8, frameY + 18);

        const startX = frameX + 26;
        const availW = frameW - 36;
        const baseline = frameY + frameH - 18;

        // Blue Dotted Baseline Grid (as seen in Image 2)
        const dotCount = Math.floor(availW / 5);
        for (let d = 0; d < dotCount; d++) {
          const isPulse = d % 3 === 0 && bassEnergyRef.current > 0.35;
          ctx.fillStyle = isPulse ? '#7dd3fc' : d % 2 === 0 ? '#38bdf8' : '#0284c7';
          ctx.fillRect(startX + d * 5, baseline + 4, 3, 2);
        }

        const barCount = 18;
        const barGap = 4;
        const barWidth = Math.max(4, (availW - (barCount - 1) * barGap) / barCount);
        const segHeight = 5;
        const segGap = 1.5;
        const unit = segHeight + segGap;
        const totalSegs = Math.max(8, Math.floor((frameH - 46) / unit));

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 36);
          const normVal = freqData[sampleIdx] || 0;
          const activeSegs = Math.min(totalSegs - 1, Math.max(0, Math.round(normVal * (totalSegs - 1))));
          const x = startX + i * (barWidth + barGap);

          // Peak physics
          if (activeSegs >= peakHold.current[i]) {
            peakHold.current[i] = activeSegs;
            peakHoldTime.current[i] = now + 280;
            peakSpeed.current[i] = 0;
          } else if (now > peakHoldTime.current[i]) {
            peakSpeed.current[i] = (peakSpeed.current[i] || 0) + 26 * dt;
            peakHold.current[i] = Math.max(0, peakHold.current[i] - peakSpeed.current[i] * dt);
          }

          const currentPeak = Math.floor(peakHold.current[i]);

          // Draw 3-Zone Segmented Blocks
          for (let s = 0; s < totalSegs; s++) {
            const segY = baseline - (s + 1) * unit;
            const ratio = s / totalSegs;

            // Image 2 3-Zone Color Scheme:
            // Green (Bottom 0 - 52%) -> Amber/Yellow (52 - 76%) -> Bright Red/Orange (76 - 100%)
            let color = '#22c55e';
            if (ratio >= 0.76) {
              color = '#ef4444';
            } else if (ratio >= 0.52) {
              color = '#f59e0b';
            }

            if (s < activeSegs) {
              ctx.fillStyle = color;
              ctx.fillRect(x, segY, barWidth, segHeight);
              // Glass shine
              ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.fillRect(x, segY, barWidth, 1);
            }
          }

          // Broad Horizontal Floating Peak Cap (White/Silver)
          if (currentPeak > 0 && currentPeak < totalSegs) {
            const peakY = baseline - currentPeak * unit;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, peakY, barWidth, 2.5);
          }
        }
      }

      // =========================================================================
      // STYLE 3: DENSE WINAMP FIERY FLAME VISUALIZER (IMAGE 3)
      // =========================================================================
      else if (mode === 'dense-fire') {
        const framePadX = 6;
        const framePadY = 6;
        const innerW = width - framePadX * 2;
        const innerH = height - framePadY * 2;
        const headerH = 18;
        const footerH = 22;

        // Vintage Window Container
        ctx.fillStyle = '#23232c';
        ctx.fillRect(framePadX, framePadY, innerW, innerH);
        ctx.strokeStyle = '#4a4a58';
        ctx.strokeRect(framePadX + 0.5, framePadY + 0.5, innerW - 1, innerH - 1);

        // Header Title
        ctx.fillStyle = '#181820';
        ctx.fillRect(framePadX + 2, framePadY + 2, innerW - 4, headerH);
        ctx.fillStyle = '#d1d5db';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VISUALIZER', framePadX + innerW / 2, framePadY + 12);

        // Footer Player Controls Area (Prev / Next / Random / Attach)
        ctx.fillStyle = '#1a1a24';
        ctx.fillRect(framePadX + 2, framePadY + innerH - footerH, innerW - 4, footerH - 2);

        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('◄◄ Prev   Next ►►   🎲 Random   ⛶ Visualizer', framePadX + innerW / 2, framePadY + innerH - 8);

        // Inner Pitch Black Canvas
        const screenX = framePadX + 4;
        const screenY = framePadY + headerH + 3;
        const screenW = innerW - 8;
        const screenH = innerH - headerH - footerH - 5;

        ctx.fillStyle = '#050508';
        ctx.fillRect(screenX, screenY, screenW, screenH);

        // Dense Fire Flame Bars (52 slim flame rods)
        const barCount = 52;
        const barGap = 1.5;
        const barWidth = Math.max(2, (screenW - (barCount - 1) * barGap) / barCount);
        const baseline = screenY + screenH - 2;
        const maxBarH = screenH - 10;

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 56);
          const normVal = freqData[sampleIdx] || 0;
          const barHeight = Math.max(2, normVal * maxBarH);
          const x = screenX + i * (barWidth + barGap);
          const y = baseline - barHeight;

          // Peak physics
          if (barHeight >= (peakHold.current[i] || 0)) {
            peakHold.current[i] = barHeight;
            peakHoldTime.current[i] = now + 240;
            peakSpeed.current[i] = 0;
          } else if (now > (peakHoldTime.current[i] || 0)) {
            peakSpeed.current[i] = (peakSpeed.current[i] || 0) + 140 * dt;
            peakHold.current[i] = Math.max(2, (peakHold.current[i] || 0) - peakSpeed.current[i] * dt);
          }

          // Rich Flame Gradient: Red Base -> Fire Orange -> Hot Yellow -> Pale White
          const flameGrad = ctx.createLinearGradient(0, baseline, 0, y);
          flameGrad.addColorStop(0, '#b91c1c');
          flameGrad.addColorStop(0.35, '#ea580c');
          flameGrad.addColorStop(0.75, '#facc15');
          flameGrad.addColorStop(1, '#ffffff');

          ctx.fillStyle = flameGrad;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Mid-air Floating White Ember / Peak Dot
          const peakH = peakHold.current[i] || 0;
          const peakY = baseline - peakH - 3;
          if (peakY < baseline - 5 && peakY >= screenY + 2) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, peakY, barWidth, 1.5);
          }
        }
      }

      // =========================================================================
      // STYLE 4: RAINBOW LED MATRIX WITH WATER/MIRROR FLOOR REFLECTION (IMAGE 4)
      // =========================================================================
      else if (mode === 'rainbow-matrix') {
        const sidePad = 8;
        const totalW = width - sidePad * 2;
        // Baseline divides upper LED matrix from floor reflection (~66% upper, 34% reflection)
        const baseline = Math.floor(height * 0.67);
        const matrixTop = 10;
        const matrixH = baseline - matrixTop;

        const barCount = 28;
        const barGap = 3.5;
        const barWidth = Math.max(3, (totalW - (barCount - 1) * barGap) / barCount);
        const segHeight = 4;
        const segGap = 1.5;
        const unit = segHeight + segGap;
        const totalSegs = Math.max(10, Math.floor(matrixH / unit));

        // Background dark grid matrix
        ctx.fillStyle = '#07070c';
        ctx.fillRect(0, 0, width, height);

        // Rainbow Hue Palette for each column
        const getRainbowColor = (colIdx: number, brightness = 1): string => {
          const hue = (130 + (colIdx / barCount) * 340) % 360;
          return `hsl(${hue}, 100%, ${Math.floor(55 * brightness)}%)`;
        };

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 44);
          const normVal = freqData[sampleIdx] || 0;
          const activeSegs = Math.min(totalSegs - 1, Math.max(0, Math.round(normVal * (totalSegs - 1))));
          const x = sidePad + i * (barWidth + barGap);

          // Peak physics
          if (activeSegs >= peakHold.current[i]) {
            peakHold.current[i] = activeSegs;
            peakHoldTime.current[i] = now + 280;
            peakSpeed.current[i] = 0;
          } else if (now > peakHoldTime.current[i]) {
            peakSpeed.current[i] = (peakSpeed.current[i] || 0) + 26 * dt;
            peakHold.current[i] = Math.max(0, peakHold.current[i] - peakSpeed.current[i] * dt);
          }

          const currentPeak = Math.floor(peakHold.current[i]);
          const colColor = getRainbowColor(i);

          // 1. Draw Upper LED Column (Lit segments + Unlit dark matrix sockets)
          for (let s = 0; s < totalSegs; s++) {
            const segY = baseline - (s + 1) * unit;

            if (s < activeSegs) {
              // Active glowing rainbow segment
              ctx.fillStyle = colColor;
              ctx.fillRect(x, segY, barWidth, segHeight);

              // Specular shine on top edge
              ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.fillRect(x, segY, barWidth, 1);
            } else {
              // Unlit dark matrix socket grid (clear unlit dots at top)
              ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
              ctx.fillRect(x, segY, barWidth, segHeight);
            }
          }

          // Floating Peak Cap (Bright White / Tinted LED)
          if (currentPeak > 0 && currentPeak < totalSegs) {
            const peakY = baseline - currentPeak * unit;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, peakY, barWidth, segHeight);
          }

          // 2. Draw Glossy Water / Mirror Floor Reflection (Beneath Baseline)
          const reflSegs = Math.min(activeSegs, 8);
          for (let r = 0; r < reflSegs; r++) {
            const reflY = baseline + 3 + r * unit;
            const opacity = Math.max(0, 0.42 - (r / 8) * 0.38);

            ctx.fillStyle = colColor;
            ctx.globalAlpha = opacity;
            ctx.fillRect(x, reflY, barWidth, segHeight);
            ctx.globalAlpha = 1.0;
          }
        }

        // Bright White Glowing Baseline Separator Bar
        const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
        lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        lineGrad.addColorStop(0.5, '#ffffff');
        lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = lineGrad;
        ctx.fillRect(sidePad, baseline, totalW, 1.5);
      }

      // =========================================================================
      // STYLE 5: MODERN SLEEK STUDIO SPECTRUM
      // =========================================================================
      else if (mode === 'spectrum') {
        const barCount = 26;
        const gap = 3.5;
        const sidePadding = 12;
        const barWidth = Math.max(3, (width - sidePadding * 2 - (barCount - 1) * gap) / barCount);
        const baseline = height - 16;
        const maxBarHeight = height * 0.65;

        // Baseline
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(sidePadding, baseline + 2, width - sidePadding * 2, 1);

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 36);
          const normVal = freqData[sampleIdx] || 0;
          const barHeight = Math.max(3, normVal * maxBarHeight);
          const x = sidePadding + i * (barWidth + gap);
          const y = baseline - barHeight;

          if (barHeight >= (peakHold.current[i] || 0)) {
            peakHold.current[i] = barHeight;
            peakHoldTime.current[i] = now + 300;
          } else if (now > (peakHoldTime.current[i] || 0)) {
            peakHold.current[i] = Math.max(3, (peakHold.current[i] || 0) - 80 * dt);
          }

          const barGrad = ctx.createLinearGradient(0, baseline, 0, y);
          barGrad.addColorStop(0, `${accentColor}88`);
          barGrad.addColorStop(0.7, accentColor);
          barGrad.addColorStop(1, '#ffffff');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();

          const peakY = baseline - (peakHold.current[i] || 0) - 2;
          if (peakY < baseline - 4) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillRect(x, Math.max(4, peakY), barWidth, 1.5);
          }
        }
      }

      // =========================================================================
      // STYLE 6: SILKY WAVE LINE
      // =========================================================================
      else {
        const points = 28;
        const sliceWidth = (width - 24) / (points - 1);
        const baseline = height * 0.65;

        ctx.beginPath();
        ctx.moveTo(12, baseline);

        for (let i = 0; i < points; i++) {
          const sampleIdx = Math.floor((i / points) * 36);
          const normVal = freqData[sampleIdx] || 0;
          const y = baseline - normVal * (baseline * 0.75);
          const x = 12 + i * sliceWidth;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.lineTo(width - 12, baseline + 8);
        ctx.lineTo(12, baseline + 8);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, baseline - 40, 0, baseline + 8);
        areaGrad.addColorStop(0, `${accentColor}33`);
        areaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = areaGrad;
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      resizeObserver.disconnect();
    };
  }, [mode, isPlaying, accentColor]);

  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
      <canvas
        id="aurapulse-live-visualizer-canvas"
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
