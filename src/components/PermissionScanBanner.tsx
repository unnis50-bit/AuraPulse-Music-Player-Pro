import React from 'react';
import { ShieldCheck, FolderOpen, Trash2, Music } from 'lucide-react';
import { ThemeConfig } from '../types';
import { requestNotificationPermission } from '../utils/mediaSession';

interface PermissionScanBannerProps {
  onDirectFilesSelected?: (files: FileList) => void;
  theme: ThemeConfig;
  totalSongs: number;
  hasDemoSongs?: boolean;
  onRemoveDemoSongs?: () => void;
}

export const PermissionScanBanner: React.FC<PermissionScanBannerProps> = ({
  onDirectFilesSelected,
  theme,
  totalSongs,
  hasDemoSongs,
  onRemoveDemoSongs,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Also trigger notification permission request so lock screen controls work
    requestNotificationPermission().catch(() => {});
    if (e.target.files && e.target.files.length > 0 && onDirectFilesSelected) {
      onDirectFilesSelected(e.target.files);
    }
  };

  return (
    <div className="mb-4 p-4 rounded-3xl bg-gradient-to-br from-neutral-900/90 via-emerald-950/40 to-neutral-900/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl animate-in fade-in">
      {/* Hidden file inputs directly linked to label buttons for 100% native Android compatibility */}
      <input
        id="banner-native-auto-input"
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.flac,.aac,.ogg,.opus,.wma"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        id="banner-native-manual-input"
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.flac,.aac,.ogg,.opus,.wma"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md border border-emerald-500/30"
            style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Scan & Add Songs</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Storage Access
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              {totalSongs > 0
                ? `${totalSongs} device songs loaded`
                : 'Grant storage access to load your device music files'}
            </p>
          </div>
        </div>

        {hasDemoSongs && onRemoveDemoSongs && (
          <button
            id="banner-remove-demo-btn"
            onClick={onRemoveDemoSongs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
            title="Remove sample/demo songs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Demo Tracks</span>
            <span className="sm:hidden">Clear Demo</span>
          </button>
        )}
      </div>

      {/* EXACT 2 BUTTONS REQUESTED BY USER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* BUTTON 1: Automatic Searching (Direct native label trigger) */}
        <label
          htmlFor="banner-native-auto-input"
          id="banner-auto-search-btn"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer text-left group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-black text-xs leading-none">
              1. Automatic Search
            </div>
            <div className="text-[11px] text-black/80 mt-1 font-medium truncate">
              Grant permission & scan all music
            </div>
          </div>
        </label>

        {/* BUTTON 2: Manual Search (Direct native label trigger) */}
        <label
          htmlFor="banner-native-manual-input"
          id="banner-manual-search-btn"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white font-bold text-xs active:scale-[0.98] transition-all cursor-pointer text-left group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-sky-500/30">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-white text-xs leading-none group-hover:text-sky-300 transition-colors">
              2. Manual Search
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 font-normal truncate">
              Pick songs or folder from storage
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

