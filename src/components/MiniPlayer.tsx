import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface MiniPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onPrev: (e: React.MouseEvent) => void;
  onOpenFullPlayer: () => void;
  theme: ThemeConfig;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onPrev,
  onOpenFullPlayer,
  theme,
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="aurapulse-mini-player"
      onClick={onOpenFullPlayer}
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-4xl mx-auto z-40 rounded-2xl shadow-[0_16px_45px_rgba(0,0,0,0.7)] backdrop-blur-3xl border border-white/15 cursor-pointer overflow-hidden transition-all duration-300 transform hover:scale-[1.01] hover:border-white/25"
      style={{
        backgroundColor: `${theme.surfaceDark}cc`,
        boxShadow: `0 16px 45px rgba(0,0,0,0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)`,
      }}
    >
      {/* Top Animated Progress Line */}
      <div className="w-full h-1 bg-white/10 relative overflow-hidden">
        <div
          className="h-full transition-all duration-150 relative"
          style={{
            width: `${Math.min(100, Math.max(0, progressPercent))}%`,
            background: `linear-gradient(90deg, #f43f5e, ${theme.accent}, #06b6d4)`,
            boxShadow: `0 0 10px ${theme.accentGlow}`,
          }}
        >
          {isPlaying && (
            <div className="absolute inset-0 animate-seek-shimmer opacity-70" />
          )}
        </div>
      </div>

      {/* Main Bar Content */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side: Artwork & Track Metadata */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center relative overflow-hidden shadow-lg border border-white/15 bg-gradient-to-br ${
              currentSong.coverGradient || 'from-indigo-600 to-purple-800'
            }`}
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.15s]" />
                <span className="w-1 bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.3s]" />
              </div>
            ) : (
              <Music className="w-5 h-5 text-white/90" />
            )}
          </div>

          <div className="min-w-0 pr-2">
            <h4 className="text-sm font-extrabold text-white truncate flex items-center gap-2">
              <span>{currentSong.title}</span>
            </h4>
            <p className="text-xs text-neutral-400 truncate mt-0.5 flex items-center gap-1.5 font-medium">
              <span>{currentSong.artist}</span>
              <span>•</span>
              <span className="font-mono-numbers text-[10px] text-neutral-400 font-semibold">{currentSong.format}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Quick Playback Controls */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            id="mini-player-prev-btn"
            onClick={onPrev}
            className="w-8 h-8 sm:w-9 sm:h-9 text-neutral-300 hover:text-white rounded-xl tactile-projected-btn flex items-center justify-center transition-all group"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4 fill-current drop-shadow-sm transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Master Mini Play Button - 100% INTERNAL ANIMATION */}
          <div className="relative flex items-center justify-center">
            <button
              id="mini-player-play-btn"
              onClick={onTogglePlay}
              className={`w-10 h-10 rounded-xl flex items-center justify-center tactile-projected-play text-white z-10 transition-all group cursor-pointer ${
                isPlaying ? 'is-playing' : ''
              }`}
              style={{ '--accent-color': theme.accent, '--accent-glow': theme.accentGlow } as React.CSSProperties}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {/* Internal Animations strictly inside button */}
              {isPlaying && (
                <>
                  <div className="internal-shimmer-sweep" />
                  <div className="internal-core-glow" />
                  <div className="internal-wave-ring" />
                </>
              )}

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-4.5 h-4.5 fill-current drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                ) : (
                  <Play className="w-4.5 h-4.5 fill-current ml-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                )}
              </div>
            </button>
          </div>

          <button
            id="mini-player-next-btn"
            onClick={onNext}
            className="w-9 h-9 text-neutral-300 hover:text-white rounded-xl tactile-projected-btn flex items-center justify-center transition-all group"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current drop-shadow-sm transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
