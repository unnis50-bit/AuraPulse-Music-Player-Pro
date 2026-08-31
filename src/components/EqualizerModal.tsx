import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Sliders, Check, Sparkles, Volume2, Radio, Zap } from 'lucide-react';
import { EqualizerPreset, ThemeConfig } from '../types';
import { DEFAULT_EQ_PRESETS } from '../data/defaultLibrary';
import { audioEngine } from '../services/audioEngine';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: EqualizerPreset;
  onSelectPreset: (preset: EqualizerPreset) => void;
  theme: ThemeConfig;
  isProUnlocked: boolean;
  onOpenProPayment: (feature: 'equalizer' | 'spectrum') => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  onSelectPreset,
  theme,
  isProUnlocked,
  onOpenProPayment,
}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activePreset, setActivePreset] = useState<EqualizerPreset>(currentPreset);
  const [bassBoost, setBassBoost] = useState<number>(currentPreset.bassBoost || 35);
  const [trebleBoost, setTrebleBoost] = useState<number>(currentPreset.trebleBoost || 30);
  const [virtualizer, setVirtualizer] = useState<number>(currentPreset.virtualizer || 25);
  const [reverb, setReverb] = useState<string>(currentPreset.reverb || 'studio');

  if (!isOpen) return null;

  const frequencies = [
    { label: '60 Hz', sub: 'SUB-BASS' },
    { label: '230 Hz', sub: 'BASS' },
    { label: '910 Hz', sub: 'MIDRANGE' },
    { label: '3.6 kHz', sub: 'PRESENCE' },
    { label: '14 kHz', sub: 'TREBLE' },
  ];

  const handleTogglePower = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    audioEngine.toggleEq(next);
    audioEngine.setEqualizerPreset(activePreset, next);
  };

  const handleBandChange = (index: number, value: number) => {
    const newGains = [...activePreset.gains] as [number, number, number, number, number];
    newGains[index] = value;
    const updated: EqualizerPreset = {
      ...activePreset,
      id: 'custom',
      name: 'Custom',
      gains: newGains,
    };
    setActivePreset(updated);
    onSelectPreset(updated);
    audioEngine.setCustomBand(index, value);
  };

  const handlePresetSelect = (preset: EqualizerPreset) => {
    setActivePreset(preset);
    setBassBoost(preset.bassBoost || 0);
    setTrebleBoost(preset.trebleBoost || 0);
    setVirtualizer(preset.virtualizer || 0);
    setReverb(preset.reverb || 'none');
    onSelectPreset(preset);
    audioEngine.setEqualizerPreset(preset, isEnabled);
  };

  const handleBassChange = (val: number) => {
    setBassBoost(val);
    audioEngine.setBassBoost(val);
  };

  const handleTrebleChange = (val: number) => {
    setTrebleBoost(val);
    audioEngine.setTrebleBoost(val);
  };

  const handleVirtualizerChange = (val: number) => {
    setVirtualizer(val);
    audioEngine.setVirtualizer(val);
  };

  const handleReverbChange = (rev: string) => {
    setReverb(rev);
  };

  const handleReset = () => {
    const normal = DEFAULT_EQ_PRESETS[0];
    handlePresetSelect(normal);
  };

  // Compute SVG curve points for visualizer line across the 5 bands
  const getCurvePath = () => {
    const points = activePreset.gains.map((gain, i) => {
      const x = 10 + i * 20; // in percent (10%, 30%, 50%, 70%, 90%)
      // Range -15dB to +15dB maps from y = 90% to y = 10%
      const y = 50 - (gain / 15) * 38;
      return { x, y };
    });

    let d = `M 0 50 L ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    d += ` L 100 50`;
    return d;
  };

  return (
    <div
      id="aurapulse-equalizer-fullscreen"
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-250 select-none"
      style={{
        backgroundColor: theme.bgDark,
        backgroundImage: `radial-gradient(circle at 50% 0%, ${theme.accent}18 0%, transparent 60%)`,
      }}
    >
      {/* 1. STUDIO HEADER */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/10 shrink-0 backdrop-blur-2xl z-20"
        style={{ backgroundColor: `${theme.bgDark}ee` }}
      >
        <div className="flex items-center gap-3">
          <button
            id="eq-back-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-neutral-300 hover:text-white tactile-projected-btn flex items-center justify-center transition-all"
            title="Back to Player"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Studio Equalizer
              </h2>
              <span
                className="text-[9px] uppercase font-mono-numbers px-2 py-0.5 rounded-md font-bold tracking-wider border border-white/10"
                style={{ backgroundColor: theme.badgeBg, color: theme.accent }}
              >
                DSP PRO
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono-numbers flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
              <span>{isEnabled ? 'Active High-Definition Processing' : 'Bypassed (DSP Off)'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Reset button */}
          <button
            id="eq-reset-btn"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white tactile-projected-btn flex items-center gap-1.5 transition-all text-xs font-semibold"
            title="Reset to Flat 0dB"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Premium Illuminated Power Toggle */}
          <button
            id="eq-power-toggle-btn"
            onClick={handleTogglePower}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 tactile-projected-btn ${
              isEnabled ? 'is-active text-emerald-400' : 'text-neutral-400'
            }`}
            style={{ '--accent-color': '#10b981', '--accent-glow': 'rgba(16,185,129,0.4)' } as React.CSSProperties}
            title="Toggle Equalizer DSP"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isEnabled ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-neutral-500'
              }`}
            />
            <span>{isEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* 2. PRESET HORIZONTAL CAROUSEL */}
      <div className="px-4 sm:px-6 py-2 shrink-0 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] uppercase font-bold text-neutral-500 shrink-0 mr-1 tracking-wider">
            Presets:
          </span>
          {DEFAULT_EQ_PRESETS.map((preset) => {
            const isSelected = activePreset.id === preset.id;
            return (
              <button
                key={preset.id}
                id={`eq-preset-chip-${preset.id}`}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all tactile-projected-btn ${
                  isSelected ? 'is-active text-white' : 'text-neutral-400'
                }`}
                style={{
                  '--accent-color': theme.accent,
                  '--accent-glow': theme.accentGlow,
                } as React.CSSProperties}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CENTER 5-BAND GRAPHIC EQUALIZER (Full-Screen Studio Rack) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-2 max-w-2xl mx-auto w-full min-h-0 relative">
        {!isProUnlocked ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-black/75 backdrop-blur-2xl rounded-3xl border border-amber-500/40 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <Zap className="w-8 h-8 text-amber-400 fill-amber-400/20 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Studio Equalizer is <span className="text-amber-400 font-black">PRO</span>
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Unlock 5-band hardware graphic tuning, Bass Boost, Treble Booster, 3D Spatial Virtualizer and Reverb DSP with lifetime access.
              </p>
            </div>
            <button
              id="unlock-eq-pro-btn"
              onClick={() => onOpenProPayment('equalizer')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Unlock for ₹299 (One-Time)</span>
            </button>
          </div>
        ) : (
          <div
            className={`relative flex-1 flex flex-col justify-between p-4 sm:p-5 rounded-3xl border border-white/15 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.6)] transition-all ${
              isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
            }`}
            style={{ backgroundColor: `${theme.surfaceDark}e6` }}
          >
            {/* Top dB Scale Header */}
            <div className="flex items-center justify-between text-[10px] font-mono-numbers text-neutral-400 px-2 shrink-0">
              <span className="text-emerald-400 font-bold">+15 dB</span>
              <span className="text-neutral-300 font-semibold">0 dB (Reference Baseline)</span>
              <span className="text-rose-400 font-bold">-15 dB</span>
            </div>

            {/* Graphic Faders Stage with SVG Curve Overlay */}
            <div className="relative flex-1 flex items-center justify-between py-2 my-1">
              {/* SVG Connecting Frequency Curve */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="eqCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="30%" stopColor="#fb923c" />
                    <stop offset="50%" stopColor={theme.accent} />
                    <stop offset="80%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path
                  d={getCurvePath()}
                  fill="none"
                  stroke="url(#eqCurveGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* Zero dB Line Indicator */}
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[1px] bg-white/15 border-t border-dashed border-white/20 pointer-events-none" />

              {/* 5 Vertical Slider Columns */}
              {frequencies.map((freqObj, index) => {
                const gain = activePreset.gains[index] ?? 0;
                return (
                  <div
                    key={freqObj.label}
                    className="flex flex-col items-center justify-between h-full z-10 w-1/5"
                  >
                    {/* Gain Indicator Pill */}
                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono-numbers font-extrabold border transition-all ${
                        gain > 0
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : gain < 0
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-white/10 text-neutral-300 border-white/10'
                      }`}
                    >
                      {gain > 0 ? `+${gain}` : `${gain}`}
                    </div>

                    {/* Vertical Fader Range Slider */}
                    <div className="flex-1 flex items-center justify-center my-1 relative">
                      <input
                        id={`eq-slider-band-${index}`}
                        type="range"
                        min={-15}
                        max={15}
                        step={1}
                        value={gain}
                        onChange={(e) => handleBandChange(index, parseInt(e.target.value))}
                        className="eq-slider h-28 sm:h-36"
                        style={{ '--accent-color': theme.accent } as React.CSSProperties}
                      />
                    </div>

                    {/* Frequency Labels */}
                    <div className="text-center">
                      <span className="text-[11px] font-extrabold text-white block tracking-tight">
                        {freqObj.label}
                      </span>
                      <span className="text-[8px] font-bold text-neutral-400 block uppercase tracking-wider">
                        {freqObj.sub}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM STUDIO AUDIO FX RACK (Bass Boost, Treble Boost, 3D Virtualizer, Reverb) - ONLY FOR PRO */}
      {isProUnlocked && (
        <div className="px-4 sm:px-6 pb-4 pt-1 max-w-2xl mx-auto w-full shrink-0 animate-in fade-in">
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-3xl border border-white/15 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${
              isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
            }`}
            style={{ backgroundColor: `${theme.surfaceDark}e6` }}
          >
            {/* A. BASS BOOST CARD */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  <span>Bass Boost</span>
                </span>
                <span
                  className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded font-bold"
                  style={{ backgroundColor: `${theme.accent}33`, color: theme.accent }}
                >
                  {bassBoost}%
                </span>
              </div>
              <input
                id="eq-bass-boost-slider"
                type="range"
                min={0}
                max={100}
                value={bassBoost}
                onChange={(e) => handleBassChange(parseInt(e.target.value))}
                className="w-full custom-slider cursor-pointer my-1"
              />
            </div>

            {/* B. TREBLE BOOST CARD */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Treble Boost</span>
                </span>
                <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300">
                  {trebleBoost}%
                </span>
              </div>
              <input
                id="eq-treble-boost-slider"
                type="range"
                min={0}
                max={100}
                value={trebleBoost}
                onChange={(e) => handleTrebleChange(parseInt(e.target.value))}
                className="w-full custom-slider cursor-pointer my-1"
              />
            </div>

            {/* C. 3D VIRTUALIZER CARD */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D Spatial</span>
                </span>
                <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-300">
                  {virtualizer}%
                </span>
              </div>
              <input
                id="eq-virtualizer-slider"
                type="range"
                min={0}
                max={100}
                value={virtualizer}
                onChange={(e) => handleVirtualizerChange(parseInt(e.target.value))}
                className="w-full custom-slider cursor-pointer my-1"
              />
            </div>

            {/* D. REVERB ENVIRONMENT CARD */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  <span>Reverb FX</span>
                </span>
                <span className="text-[10px] font-bold uppercase text-purple-300">
                  {reverb}
                </span>
              </div>
              <select
                id="eq-reverb-select"
                value={reverb}
                onChange={(e) => handleReverbChange(e.target.value)}
                className="w-full px-2 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="none" className="bg-neutral-900">Off (Dry)</option>
                <option value="room" className="bg-neutral-900">Acoustic Room</option>
                <option value="studio" className="bg-neutral-900">Studio Stage</option>
                <option value="hall" className="bg-neutral-900">Concert Hall</option>
                <option value="cathedral" className="bg-neutral-900">Cathedral</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
