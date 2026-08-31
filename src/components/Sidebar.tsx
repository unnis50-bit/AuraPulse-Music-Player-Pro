import React from 'react';
import {
  FolderOpen,
  Music,
  ListOrdered,
  ListMusic,
  Sliders,
  Sparkles,
  Timer,
  Tag,
  Upload,
  Info,
  ShieldCheck,
  Headphones,
  Radio,
  X,
  ChevronRight,
  Trash2,
  CopyX,
  Crown,
  Zap,
} from 'lucide-react';
import { AuraPulseLogo } from './AuraPulseLogo';
import { ThemeConfig } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenEqualizer: () => void;
  onOpenThemeModal: () => void;
  onOpenSleepTimer: () => void;
  onOpenTagEditor: () => void;
  onOpenFileUpload: () => void;
  onOpenQueue: () => void;
  totalSongsCount: number;
  theme: ThemeConfig;
  isProUnlocked: boolean;
  onOpenProPayment: (feature?: 'equalizer' | 'spectrum' | 'general') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenEqualizer,
  onOpenThemeModal,
  onOpenSleepTimer,
  onOpenTagEditor,
  onOpenFileUpload,
  onOpenQueue,
  totalSongsCount,
  theme,
  isProUnlocked,
  onOpenProPayment,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'folders',
      label: 'Folders',
      icon: FolderOpen,
      badge: 'Local Paths',
      action: () => {
        onSelectTab('folders');
        onClose();
      },
    },
    {
      id: 'songs',
      label: 'Songs',
      icon: Music,
      badge: `${totalSongsCount} tracks`,
      action: () => {
        onSelectTab('songs');
        onClose();
      },
    },
    {
      id: 'play-queue',
      label: 'Play queue',
      icon: ListOrdered,
      action: () => {
        onClose();
        onOpenQueue();
      },
    },
    {
      id: 'playlists',
      label: 'Playlists',
      icon: ListMusic,
      action: () => {
        onSelectTab('playlists');
        onClose();
      },
    },
    {
      id: 'equalizer',
      label: 'Equalizer & DSP',
      icon: Sliders,
      badge: '5-Band',
      highlight: true,
      action: () => {
        onClose();
        onOpenEqualizer();
      },
    },
    {
      id: 'themes',
      label: 'Theme Studio',
      icon: Sparkles,
      action: () => {
        onClose();
        onOpenThemeModal();
      },
    },
    {
      id: 'sleeptimer',
      label: 'Sleep timer',
      icon: Timer,
      action: () => {
        onClose();
        onOpenSleepTimer();
      },
    },
    {
      id: 'tageditor',
      label: 'Edit audio tags',
      icon: Tag,
      action: () => {
        onClose();
        onOpenTagEditor();
      },
    },
    {
      id: 'import',
      label: 'Import audio & folders',
      icon: Upload,
      action: () => {
        onClose();
        onOpenFileUpload();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div
        id="aurapulse-sidebar-drawer"
        className="relative w-80 max-w-[85vw] h-full shadow-[0_16px_50px_rgba(0,0,0,0.8)] flex flex-col z-10 border-r border-white/10 animate-in slide-in-from-left duration-300 backdrop-blur-3xl"
        style={{ backgroundColor: `${theme.surfaceDark}f2` }}
      >
        {/* Header (Like Daksha Music / Pulsar with custom polygon banner) */}
        <div className="relative p-5 pb-6 overflow-hidden border-b border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl">
          {/* Subtle Geometric Background */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: theme.accent }}
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3.5">
              {/* Premium App Logo */}
              <AuraPulseLogo size={48} animated={true} glow={true} />

              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <h3 className="font-brand-luxury font-extrabold text-lg brand-title-gradient uppercase tracking-wider">
                    AuraPulse
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <p className="text-[11px] font-brand-luxury uppercase tracking-[0.16em] text-neutral-400 font-semibold mt-1">
                  Music Player PRO
                </p>
              </div>
            </div>

            <button
              id="sidebar-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>24-bit Hi-Res DSP</span>
            </div>
            <span className="font-mono-numbers font-medium text-neutral-300">v4.8 Studio</span>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {!isProUnlocked && (
            <div className="mb-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-500/30 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span className="text-xs font-black text-white uppercase tracking-wider">AuraPulse PRO</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold ml-auto">₹299</span>
              </div>
              <p className="text-[10px] text-neutral-300 mb-2">
                Unlock Hardware Equalizer, Spectrum & Studio DSP.
              </p>
              <button
                id="sidebar-unlock-pro-btn"
                onClick={() => {
                  onClose();
                  onOpenProPayment('general');
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-neutral-950" />
                <span>Unlock PRO Now</span>
              </button>
            </div>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={item.action}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className="w-5 h-5 transition-transform group-hover:scale-110"
                    style={{ color: item.highlight || isActive ? theme.accent : undefined }}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-md font-mono-numbers font-medium"
                      style={{
                        backgroundColor: item.highlight ? theme.badgeBg : 'rgba(255, 255, 255, 0.08)',
                        color: item.highlight ? theme.accent : '#9ca3af',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 text-xs text-neutral-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-neutral-400" />
            <span>Audiophile Master Audio</span>
          </div>
          <span className="font-mono-numbers">Lossless</span>
        </div>
      </div>
    </div>
  );
};
