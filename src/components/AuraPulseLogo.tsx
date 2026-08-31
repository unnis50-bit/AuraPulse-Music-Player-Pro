import React from 'react';

interface AuraPulseLogoProps {
  size?: number | string;
  className?: string;
  glow?: boolean;
  animated?: boolean;
}

export const AuraPulseLogo: React.FC<AuraPulseLogoProps> = ({
  size = 32,
  className = '',
  glow = true,
  animated = false,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Outer Ambient Dynamic Glow */}
      {glow && (
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500/40 via-cyan-500/30 to-amber-400/30 blur-md pointer-events-none ${
            animated ? 'animate-pulse' : ''
          }`}
        />
      )}

      {/* SVG Icon Masterpiece */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
      >
        <defs>
          {/* Outer Ring Gradients */}
          <linearGradient id="apChassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e3440" />
            <stop offset="50%" stopColor="#1a1d24" />
            <stop offset="100%" stopColor="#0d0f14" />
          </linearGradient>

          <linearGradient id="apBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Luxury Gold/Emerald Wave Gradient */}
          <linearGradient id="apWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="30%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Laser Core Gradient */}
          <radialGradient id="apCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Chassis Backdrop */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="url(#apChassisGrad)"
          stroke="url(#apBorderGrad)"
          strokeWidth="1.5"
        />

        {/* Subtly Machined Bevel Reflection */}
        <path
          d="M 5 15 C 5 8.5 8.5 5 15 5 L 33 5 C 39.5 5 43 8.5 43 15 Q 24 18 5 15 Z"
          fill="white"
          fillOpacity="0.12"
        />

        {/* Central Ambient Glow Node */}
        <circle cx="24" cy="24" r="14" fill="url(#apCoreGlow)" />

        {/* Audiophile Sound Pulse & Wave Crest (A + P Fusion Icon) */}
        {/* Left Pulse Bar */}
        <rect x="11" y="21" width="3" height="6" rx="1.5" fill="url(#apWaveGrad)" />
        <rect x="16" y="15" width="3" height="18" rx="1.5" fill="url(#apWaveGrad)" />
        
        {/* Center Peak Wave (The "A" Crest) */}
        <path
          d="M 21 29 L 24 10 L 27 29 Z"
          fill="none"
          stroke="url(#apWaveGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* The Aura Pulse Cross-Bridge */}
        <line
          x1="22"
          y1="23"
          x2="26"
          y2="23"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Center Core Sparkle Point */}
        <circle cx="24" cy="18" r="1.5" fill="#ffffff" />

        {/* Right Pulse Bars & Loop */}
        <rect x="29" y="14" width="3" height="20" rx="1.5" fill="url(#apWaveGrad)" />
        <rect x="34" y="21" width="3" height="6" rx="1.5" fill="url(#apWaveGrad)" />

        {/* Top Sound Headphone Arc */}
        <path
          d="M 12 21 C 12 13 17 8 24 8 C 31 8 36 13 36 21"
          stroke="url(#apWaveGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1 3.5"
        />

        {/* Corner Jewel Dot */}
        <circle cx="39" cy="9" r="1.5" fill="#34d399" />
      </svg>
    </div>
  );
};
