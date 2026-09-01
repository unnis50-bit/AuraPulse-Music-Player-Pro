import React, { useRef } from 'react';
import { ShieldCheck, FolderOpen, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { ThemeConfig } from '../types';

interface PermissionScanBannerProps {
  onAutoScanClick?: () => void;
  onManualScanClick?: () => void;
  onDirectFilesSelected?: (files: FileList) => void;
  theme: ThemeConfig;
  totalSongs: number;
}

export const PermissionScanBanner: React.FC<PermissionScanBannerProps> = ({
  onAutoScanClick,
  onManualScanClick,
  onDirectFilesSelected,
  theme,
  totalSongs,
}) => {
  const autoInputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const handleAutoClick = () => {
    if (onAutoScanClick) {
      onAutoScanClick();
    } else if (autoInputRef.current) {
      autoInputRef.current.click();
    }
  };

  const handleManualClick = () => {
    if (onManualScanClick) {
      onManualScanClick();
    } else if (manualInputRef.current) {
      manualInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onDirectFilesSelected) {
      onDirectFilesSelected(e.target.files);
    }
  };

  return (
    <div className="mb-4 p-4 rounded-3xl bg-gradient-to-br from-neutral-900/90 via-emerald-950/40 to-neutral-900/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl animate-in fade-in">
      {/* Hidden file inputs for immediate 1-tap browser triggers */}
      <input
        ref={autoInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.flac,.aac,.ogg,.opus"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={manualInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.flac,.aac,.ogg,.opus"
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
              <span>Add Songs to AuraPulse</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Offline
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              {totalSongs > 0
                ? `${totalSongs} tracks loaded • Add more tracks below`
                : 'Choose automatic or manual scan to load your music'}
            </p>
          </div>
        </div>
      </div>

      {/* EXACT 2 BUTTONS REQUESTED BY USER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* BUTTON 1: Automatic Searching */}
        <button
          id="banner-auto-search-btn"
          onClick={handleAutoClick}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-black text-xs leading-none">
              1. Automatic Search
            </div>
            <div className="text-[11px] text-black/80 mt-1 font-medium truncate">
              Allow permission & auto-scan songs
            </div>
          </div>
        </button>

        {/* BUTTON 2: Manual Search */}
        <button
          id="banner-manual-search-btn"
          onClick={handleManualClick}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white font-bold text-xs active:scale-[0.98] transition-all cursor-pointer text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-sky-500/30">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-white text-xs leading-none group-hover:text-sky-300 transition-colors">
              2. Manual Search
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 font-normal truncate">
              Pick files or custom folders
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
