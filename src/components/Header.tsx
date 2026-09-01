import React, { useState } from 'react';
import {
  Menu,
  Search,
  Cast,
  MoreVertical,
  Sliders,
  FolderOpen,
  Music,
  Users,
  Disc3,
  ListMusic,
  Sparkles,
  Timer,
  Upload,
  Check,
  Radio,
  X,
  Crown,
} from 'lucide-react';
import { AuraPulseLogo } from './AuraPulseLogo';
import { ThemeConfig } from '../types';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSidebar: () => void;
  onOpenEqualizer: () => void;
  onOpenThemeModal: () => void;
  onOpenSleepTimer: () => void;
  onOpenFileUpload: () => void;
  onOpenOnlineSearch?: () => void;
  theme: ThemeConfig;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isCasting: boolean;
  onToggleCast: () => void;
  isProUnlocked: boolean;
  onOpenProPayment: (feature?: 'equalizer' | 'spectrum' | 'general') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenSidebar,
  onOpenEqualizer,
  onOpenThemeModal,
  onOpenSleepTimer,
  onOpenFileUpload,
  onOpenOnlineSearch,
  theme,
  searchQuery,
  onSearchChange,
  isCasting,
  onToggleCast,
  isProUnlocked,
  onOpenProPayment,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const tabs = [
    { id: 'folders', label: 'FOLDERS', icon: FolderOpen },
    { id: 'songs', label: 'SONGS', icon: Music },
    { id: 'artists', label: 'ARTISTS', icon: Users },
    { id: 'albums', label: 'ALBUMS', icon: Disc3 },
    { id: 'playlists', label: 'PLAYLISTS', icon: ListMusic },
  ];

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]" style={{ backgroundColor: `${theme.bgDark}bf` }}>
      {/* Top Navbar Row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side: Drawer Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="header-drawer-toggle-btn"
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 active:scale-95"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {!isSearching ? (
            <div className="flex items-center gap-2.5 select-none">
              <AuraPulseLogo size={34} animated={true} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-brand-luxury font-extrabold text-lg tracking-wider brand-title-gradient uppercase">
                    AuraPulse
                  </span>
                  <span
                    className="text-[9px] uppercase font-mono-numbers px-1.5 py-0.5 rounded-md font-bold tracking-widest border border-white/15 backdrop-blur-md shadow-sm"
                    style={{ backgroundColor: theme.badgeBg, color: theme.accent }}
                  >
                    PRO
                  </span>
                </div>
                <span className="text-[10px] uppercase font-brand-luxury tracking-[0.2em] text-neutral-400 font-semibold mt-0.5">
                  Music Player
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 max-w-md flex items-center bg-white/10 backdrop-blur-xl rounded-xl px-3 py-1.5 border border-white/15 focus-within:ring-2" style={{ borderColor: theme.accent }}>
              <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
              <input
                id="header-search-input"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tracks, artists, genres..."
                className="w-full bg-transparent text-sm text-white placeholder-neutral-400 focus:outline-none"
              />
              <button
                id="header-search-clear-btn"
                onClick={() => {
                  onSearchChange('');
                  setIsSearching(false);
                }}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side - PRO 299 Button */}
        <div className="flex items-center gap-2">
          {!isProUnlocked ? (
            <button
              id="header-pro-unlock-btn"
              onClick={() => onOpenProPayment('general')}
              className="pro-badge-animate flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border border-amber-400/60 text-amber-300 hover:text-white hover:border-amber-300 transition-all active:scale-95 cursor-pointer shadow-md"
              title="Unlock AuraPulse PRO (₹299 One-Time)"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider font-mono-numbers">PRO ₹299</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Crown className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">PRO</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Header Row (Pulsar Style: FOLDERS, SONGS, ARTISTS, ALBUMS, PLAYLISTS) */}
      <div className="flex items-center gap-1 px-3 overflow-x-auto no-scrollbar border-t border-white/5 backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap relative rounded-t-lg ${
                isActive
                  ? 'text-white bg-white/[0.06] backdrop-blur-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'scale-110' : ''}`} style={{ color: isActive ? theme.accent : undefined }} />
              <span>{tab.label}</span>
              {isActive && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: theme.accent, boxShadow: `0 0 10px ${theme.accent}` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
