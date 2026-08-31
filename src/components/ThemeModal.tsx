import React from 'react';
import { Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import { ThemeConfig } from '../types';
import { DEFAULT_THEMES } from '../data/defaultLibrary';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="aurapulse-theme-studio-modal"
        className="w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.9)] border border-white/15 backdrop-blur-3xl"
        style={{ backgroundColor: `${currentTheme.surfaceDark}f2` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md border border-white/10"
              style={{ backgroundColor: `${currentTheme.accent}20` }}
            >
              <Sparkles className="w-5 h-5" style={{ color: currentTheme.accent }} />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <h3 className="text-base font-extrabold text-white font-brand-luxury uppercase tracking-wider">
                  Theme Studio
                </h3>
                <span
                  className="text-[9px] uppercase font-mono-numbers px-1.5 py-0.5 rounded-md font-bold tracking-wider border border-white/10"
                  style={{ backgroundColor: currentTheme.badgeBg, color: currentTheme.accent }}
                >
                  DSP THEMES
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-1">Select player acoustic & visual palette</p>
            </div>
          </div>

          <button
            id="theme-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5"
            title="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Non-Scrollable Responsive Visual Grid for All Themes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
          {DEFAULT_THEMES.map((theme) => {
            const isSelected = currentTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                id={`theme-card-${theme.id}`}
                onClick={() => onSelectTheme(theme)}
                className={`w-full p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between group ${
                  isSelected
                    ? 'border-white/40 bg-white/12 shadow-[0_8px_24px_rgba(0,0,0,0.6)]'
                    : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 20px ${theme.accentGlow}` : undefined,
                }}
              >
                {/* Active Indicator Bar on Top */}
                {isSelected && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1 shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                  />
                )}

                <div className="flex items-center gap-3">
                  {/* Theme Color Dual Palette Swatch */}
                  <div
                    className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden"
                    style={{ backgroundColor: theme.bgDark }}
                  >
                    {/* Inner Accent Ring */}
                    <div
                      className="w-5 h-5 rounded-full ring-2 ring-white/30 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: theme.accent,
                        boxShadow: `0 0 12px ${theme.accent}`,
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-white">
                      {theme.name.replace(' (Default)', '')}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-mono-numbers truncate mt-0.5">
                      {theme.accentColorName}
                    </p>
                  </div>
                </div>

                {/* Selected Checkmark Badge */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                  style={{ backgroundColor: theme.accent, color: '#ffffff' }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Compact Pro Footer Info */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-neutral-200">AuraPulse Pro Real-time Theming</span>
          </div>
          <span className="font-mono-numbers text-[11px] text-neutral-500">5 High-Contrast Palettes</span>
        </div>
      </div>
    </div>
  );
};

