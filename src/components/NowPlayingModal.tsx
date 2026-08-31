import React, { useState } from 'react';
import {
  ChevronDown,
  Cast,
  Heart,
  Share2,
  Sliders,
  MoreVertical,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  ListOrdered,
  Sparkles,
  Music,
  Activity,
  Disc3,
  Gauge,
  FileText,
  Volume2,
  VolumeX,
  Crown,
} from 'lucide-react';
import { Song, VisualizerMode, RepeatMode, ThemeConfig } from '../types';
import { VisualizerCanvas } from './VisualizerCanvas';

interface NowPlayingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackSpeed: number;
  volume: number;
  trackIndex: number;
  totalTracks: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: (songId: string) => void;
  onSetSpeed: (speed: number) => void;
  onSetVolume: (vol: number) => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  onOpenTagEditor: (song: Song) => void;
  onOpenQueue: () => void;
  onOpenPlaylistPicker: (song: Song) => void;
  isCasting: boolean;
  onToggleCast: () => void;
  theme: ThemeConfig;
  isProUnlocked: boolean;
  onOpenProPayment: (feature: 'equalizer' | 'spectrum') => void;
}

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  isShuffle,
  playbackSpeed,
  volume,
  trackIndex,
  totalTracks,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onToggleRepeat,
  onToggleShuffle,
  onToggleFavorite,
  onSetSpeed,
  onSetVolume,
  onOpenEqualizer,
  onOpenSleepTimer,
  onOpenTagEditor,
  onOpenQueue,
  onOpenPlaylistPicker,
  isCasting,
  onToggleCast,
  theme,
  isProUnlocked,
  onOpenProPayment,
}) => {
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('winamp-classic');
  const [showCenterVisualizer, setShowCenterVisualizer] = useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: `Listening to "${currentSong.title}" by ${currentSong.artist} on AuraPulse Hi-Fi!`,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(`Now playing: ${currentSong.title} - ${currentSong.artist}`);
      alert('Track info copied to clipboard!');
    }
  };

  return (
    <div
      id="aurapulse-now-playing-fullscreen"
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none animate-in slide-in-from-bottom duration-300 backdrop-blur-3xl"
      style={{ backgroundColor: theme.bgDark }}
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ backgroundColor: '#6366f1' }}
      />

      {/* Top Action Bar (Clean Minimalist Header with Sleek Tactile Controls) */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/10 shrink-0 backdrop-blur-xl">
        <button
          id="now-playing-close-btn"
          onClick={onClose}
          className="w-9 h-9 rounded-xl text-neutral-300 hover:text-white tactile-projected-btn flex items-center justify-center transition-all"
          title="Minimize Player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Center Title Pill */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono-numbers">
            NOW PLAYING
          </span>
          <span className="text-[11px] font-mono-numbers text-neutral-500 font-medium">
            {trackIndex + 1} of {totalTracks}
          </span>
        </div>

        {/* Right Action Icons: Favorite, Equalizer, Queue, Menu */}
        <div className="flex items-center gap-1.5">
          {/* Favorite */}
          <button
            id="now-playing-fav-btn"
            onClick={() => onToggleFavorite(currentSong.id)}
            className={`w-9 h-9 rounded-xl transition-all tactile-projected-btn flex items-center justify-center ${
              currentSong.isFavorite ? 'is-active text-rose-500' : 'text-neutral-300 hover:text-white'
            }`}
            style={{ '--accent-color': '#f43f5e', '--accent-glow': 'rgba(244,63,94,0.4)' } as React.CSSProperties}
            title="Favorite Track"
          >
            <Heart className={`w-4.5 h-4.5 ${currentSong.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Equalizer Quick Access */}
          <button
            id="now-playing-eq-btn"
            onClick={onOpenEqualizer}
            className="w-9 h-9 rounded-xl text-neutral-300 hover:text-white transition-all tactile-projected-btn flex items-center justify-center"
            title="Studio Equalizer"
          >
            <Sliders className="w-4.5 h-4.5" />
          </button>

          {/* Queue Button */}
          <button
            id="now-playing-queue-btn"
            onClick={onOpenQueue}
            className="w-9 h-9 rounded-xl text-neutral-300 hover:text-white transition-all tactile-projected-btn flex items-center justify-center"
            title="Play Queue"
          >
            <ListOrdered className="w-4.5 h-4.5" />
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              id="now-playing-options-btn"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="w-9 h-9 rounded-xl text-neutral-300 hover:text-white transition-all tactile-projected-btn flex items-center justify-center"
              title="More Options"
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>

            {showOptionsMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowOptionsMenu(false)} />
                <div
                  id="now-playing-context-menu"
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl p-1.5 shadow-2xl border border-white/10 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95"
                  style={{ backgroundColor: theme.surfaceDark }}
                >
                  <button
                    id="np-menu-cast-btn"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onToggleCast();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                  >
                    <Cast className="w-4 h-4 text-emerald-400" />
                    <span>{isCasting ? 'Disconnect Cast' : 'Cast Audio'}</span>
                  </button>

                  <button
                    id="np-menu-share-btn"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      handleShare();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                  >
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>Share Track</span>
                  </button>

                  <button
                    id="np-menu-lyrics-btn"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowLyrics(!showLyrics);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                  >
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>{showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}</span>
                  </button>

                  <button
                    id="np-menu-playlist-btn"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onOpenPlaylistPicker(currentSong);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                  >
                    <ListOrdered className="w-4 h-4 text-emerald-400" />
                    <span>Add to Playlist</span>
                  </button>

                  <button
                    id="np-menu-tag-edit-btn"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onOpenTagEditor(currentSong);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Edit Tags</span>
                  </button>

                  <button
                    id="np-menu-sleeptimer-btn"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onOpenSleepTimer();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                  >
                    <Activity className="w-4 h-4 text-pink-400" />
                    <span>Sleep Timer</span>
                  </button>

                  <button
                    id="np-menu-speed-btn"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowSpeedMenu(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                  >
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span>Playback Speed ({playbackSpeed}x)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Center Area: Visualizer & Vinyl Artwork Canvas */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-2 max-w-md mx-auto w-full min-h-0">
        {/* Sleek Mode Switcher */}
        <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
          <button
            id="np-switch-art-vis-btn"
            onClick={() => setShowCenterVisualizer(!showCenterVisualizer)}
            className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
              showCenterVisualizer
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Visualizer Spectrum / Cover Art"
          >
            <Activity className="w-3.5 h-3.5" style={{ color: showCenterVisualizer ? theme.accent : undefined }} />
            <span>{showCenterVisualizer ? 'SPECTRUM' : 'COVER ART'}</span>
          </button>

          {showCenterVisualizer && (
            <div className="flex items-center gap-1">
              <button
                id="np-vis-mode-cycle-btn"
                onClick={() => {
                  const modes: VisualizerMode[] = [
                    'winamp-classic',
                    'hifi-vumeter',
                    'dense-fire',
                    'rainbow-matrix',
                  ];
                  const nextIdx = (modes.indexOf(visualizerMode) + 1) % modes.length;
                  setVisualizerMode(modes[nextIdx]);
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1.5 text-neutral-300"
                title="Click to switch between the 4 Retro Spectrum styles"
              >
                <span style={{ color: theme.accent }}>
                  {visualizerMode === 'winamp-classic' && '1. Winamp Classic'}
                  {visualizerMode === 'hifi-vumeter' && '2. Hi-Fi VU Meter'}
                  {visualizerMode === 'dense-fire' && '3. Dense Fire'}
                  {visualizerMode === 'rainbow-matrix' && '4. Rainbow LED'}
                  {visualizerMode === 'spectrum' && 'Studio Spectrum'}
                  {visualizerMode === 'wave-glow' && 'Wave Glow'}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono-numbers">
                  ({Math.max(1, [
                    'winamp-classic',
                    'hifi-vumeter',
                    'dense-fire',
                    'rainbow-matrix',
                    'spectrum',
                    'wave-glow',
                  ].indexOf(visualizerMode) + 1)}/4)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Direct Style Shortcut Tabs for Fast 1-Tap Switching */}
        {showCenterVisualizer && !showLyrics && (
          <div className="w-full flex items-center justify-center gap-1.5 mb-2 px-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              id="style-winamp-btn"
              onClick={() => setVisualizerMode('winamp-classic')}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all shrink-0 ${
                visualizerMode === 'winamp-classic'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              📻 Winamp
            </button>
            <button
              id="style-hifi-btn"
              onClick={() => setVisualizerMode('hifi-vumeter')}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all shrink-0 ${
                visualizerMode === 'hifi-vumeter'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              📟 Hi-Fi VU
            </button>
            <button
              id="style-densefire-btn"
              onClick={() => setVisualizerMode('dense-fire')}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all shrink-0 ${
                visualizerMode === 'dense-fire'
                  ? 'bg-red-500/20 border-red-400 text-red-300'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              🔥 Flame
            </button>
            <button
              id="style-rainbow-btn"
              onClick={() => setVisualizerMode('rainbow-matrix')}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all shrink-0 ${
                visualizerMode === 'rainbow-matrix'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              🌈 Rainbow
            </button>
          </div>
        )}

        {/* Visualizer / Album Art Box */}
        <div className="relative w-full aspect-square max-h-[320px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/15 flex items-center justify-center bg-black/50 backdrop-blur-2xl">
          {showLyrics ? (
            /* Synced Lyrics Screen */
            <div className="w-full h-full p-6 overflow-y-auto text-center flex flex-col justify-center space-y-4 backdrop-blur-md">
              <h3 className="text-xs uppercase font-mono-numbers text-neutral-400 tracking-wider">Lyrics</h3>
              <div className="text-sm font-medium text-neutral-200 leading-relaxed whitespace-pre-line">
                {currentSong.lyrics || 'No lyrics available for this track.'}
              </div>
            </div>
          ) : showCenterVisualizer ? (
            /* Live Audio Spectrum Visualizer */
            <div className="w-full h-full relative flex flex-col items-center justify-center p-3 backdrop-blur-md">
              {isProUnlocked ? (
                <VisualizerCanvas
                  mode={visualizerMode}
                  isPlaying={isPlaying}
                  accentColor={theme.accent}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-black/60 rounded-xl border border-amber-500/30">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <Activity className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    Spectrum Visualizer is <span className="text-amber-400">PRO</span>
                  </h4>
                  <p className="text-[11px] text-neutral-300 max-w-xs mt-1">
                    Winamp Classic, Hi-Fi VU Meter & Flame visualizers are exclusive to AuraPulse PRO.
                  </p>
                  <button
                    id="spectrum-unlock-btn"
                    onClick={() => onOpenProPayment('spectrum')}
                    className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-extrabold text-[11px] uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5 fill-neutral-950" />
                    <span>Unlock PRO (₹299)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Album Art View */
            <div
              className={`w-full h-full flex items-center justify-center relative bg-gradient-to-br ${
                currentSong.coverGradient || 'from-indigo-600 via-purple-700 to-slate-900'
              }`}
            >
              <div
                className={`w-36 h-36 rounded-full border-4 border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-sm ${
                  isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
                }`}
              >
                <Disc3 className="w-20 h-20 text-white/80" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Track Info, Scrubber, Controls, Audio Info */}
      <div className="relative z-20 px-6 pb-6 pt-2 max-w-md mx-auto w-full space-y-3">
        {/* Track Title & Artist & Track Number */}
        <div className="text-left">
          <h2 className="text-lg sm:text-xl font-extrabold text-white truncate tracking-tight">
            {currentSong.title}
          </h2>
          <div className="flex items-center justify-between mt-1 text-xs text-neutral-400">
            <span className="truncate">{currentSong.artist || 'Unknown artist'}</span>
            <div className="flex items-center gap-2 shrink-0 font-mono-numbers text-[11px] text-neutral-500">
              <span>{currentSong.folder || 'Music'}</span>
              <span>•</span>
              <span>{trackIndex + 1}/{totalTracks}</span>
            </div>
          </div>
        </div>

        {/* Animated High-Precision Timeline Scrubber Bar */}
        <div className="space-y-1.5 py-1">
          <div className="relative group cursor-pointer flex items-center py-2">
            {/* Background Track */}
            <div className="w-full h-1.5 group-hover:h-2 bg-white/10 rounded-full overflow-hidden relative transition-all">
              {/* Animated Progress Fill with Shimmer */}
              <div
                className="h-full rounded-full relative transition-all duration-75"
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  background: `linear-gradient(90deg, #f43f5e 0%, #fb923c 30%, ${theme.accent} 70%, #06b6d4 100%)`,
                  boxShadow: `0 0 14px ${theme.accentGlow}`,
                }}
              >
                {/* Flowing shimmer wave while playing */}
                {isPlaying && (
                  <div className="absolute inset-0 animate-seek-shimmer opacity-70" />
                )}
              </div>
            </div>

            {/* Glowing Beacon Head Thumb */}
            <div
              className="absolute pointer-events-none -translate-x-1/2 flex items-center justify-center transition-all duration-75"
              style={{
                left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            >
              {/* Outer Pulse Wave (Beacon) */}
              {isPlaying && (
                <div
                  className="absolute w-6 h-6 rounded-full animate-beacon"
                  style={{ backgroundColor: `${theme.accent}55` }}
                />
              )}
              {/* Inner Solid Thumb */}
              <div
                className="w-3.5 h-3.5 group-hover:w-4.5 group-hover:h-4.5 rounded-full bg-white border-2 shadow-lg transition-all"
                style={{
                  borderColor: theme.accent,
                  boxShadow: `0 0 10px #ffffff, 0 0 16px ${theme.accent}`,
                }}
              />
            </div>

            {/* Real Transparent Range Input for Scrubbing */}
            <input
              id="now-playing-scrubber-slider"
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono-numbers text-neutral-400">
            <span className="font-semibold text-white/90">{formatTime(currentTime)}</span>
            <span className="text-neutral-500 font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Audiophile Controls Dock: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="tactile-console-deck rounded-2xl p-2 sm:p-2.5 flex items-center justify-between">
          {/* Shuffle Button */}
          <button
            id="now-playing-shuffle-btn"
            onClick={onToggleShuffle}
            className={`w-10 h-10 rounded-xl transition-all tactile-projected-btn flex flex-col items-center justify-center relative ${
              isShuffle ? 'is-active text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{ '--accent-color': theme.accent, '--accent-glow': theme.accentGlow } as React.CSSProperties}
            title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4.5 h-4.5 relative z-10" />
            {isShuffle && (
              <span
                className="w-1.5 h-1.5 rounded-full absolute bottom-1 shadow-sm"
                style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }}
              />
            )}
          </button>

          {/* Previous Track Button */}
          <button
            id="now-playing-prev-btn"
            onClick={onPrev}
            className="w-12 h-11 sm:w-13 sm:h-12 text-neutral-200 hover:text-white rounded-xl tactile-projected-btn flex items-center justify-center transition-all group"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5 fill-current drop-shadow-sm transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Master Play / Pause 3D Projected Button - 100% INTERNAL ANIMATION */}
          <div className="relative flex items-center justify-center">
            <button
              id="now-playing-play-pause-btn"
              onClick={onTogglePlay}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white tactile-projected-play group transition-all cursor-pointer ${
                isPlaying ? 'is-playing' : ''
              }`}
              style={{ '--accent-color': theme.accent, '--accent-glow': theme.accentGlow } as React.CSSProperties}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {/* Internal Animations (Strictly contained inside button) */}
              {isPlaying && (
                <>
                  <div className="internal-shimmer-sweep" />
                  <div className="internal-core-glow" />
                  <div className="internal-wave-ring" />
                  <div className="internal-wave-ring-delayed" />
                  <div className="internal-eq-bars">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </>
              )}

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-105" />
                ) : (
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-105" />
                )}
              </div>
            </button>
          </div>

          {/* Next Track Button */}
          <button
            id="now-playing-next-btn"
            onClick={onNext}
            className="w-12 h-11 sm:w-13 sm:h-12 text-neutral-200 hover:text-white rounded-xl tactile-projected-btn flex items-center justify-center transition-all group"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current drop-shadow-sm transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Repeat Button */}
          <button
            id="now-playing-repeat-btn"
            onClick={onToggleRepeat}
            className={`w-10 h-10 rounded-xl transition-all tactile-projected-btn flex flex-col items-center justify-center relative ${
              repeatMode !== 'off' ? 'is-active text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            style={{ '--accent-color': theme.accent, '--accent-glow': theme.accentGlow } as React.CSSProperties}
            title={`Repeat Mode: ${repeatMode.toUpperCase()}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4.5 h-4.5 relative z-10" />
            ) : (
              <Repeat className="w-4.5 h-4.5 relative z-10" />
            )}
            {repeatMode !== 'off' && (
              <span
                className="w-1.5 h-1.5 rounded-full absolute bottom-1 shadow-sm"
                style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }}
              />
            )}
          </button>
        </div>

        {/* Volume & Format Footer */}
        <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-white/10">
          {/* Format Badge (44.1kHz AAC / FLAC) */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono-numbers shrink-0">
            <span
              className="px-2.5 py-1 rounded-xl font-bold text-[10px] tracking-wider border border-white/10 uppercase"
              style={{ backgroundColor: theme.badgeBg, color: theme.accent }}
            >
              {currentSong.format || '44.1kHz AAC'}
            </span>
            {currentSong.bitrate && (
              <span className="text-[11px] text-neutral-400 font-semibold hidden sm:inline">{currentSong.bitrate}</span>
            )}
          </div>

          {/* Premium Illuminated Volume Slider Bar */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl glass-panel border border-white/10 max-w-[200px] sm:max-w-[240px] flex-1">
            <button
              id="now-playing-volume-mute-btn"
              onClick={() => onSetVolume(volume === 0 ? 0.75 : 0)}
              className="text-neutral-300 hover:text-white transition-colors shrink-0 p-0.5"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" style={{ color: theme.accent }} />
              )}
            </button>

            {/* Custom Interactive Volume Bar */}
            <div className="relative flex-1 flex items-center group cursor-pointer h-5">
              {/* Bar track background */}
              <div className="w-full h-1.5 group-hover:h-2 bg-white/10 rounded-full overflow-hidden transition-all relative">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${volume * 100}%`,
                    background: `linear-gradient(90deg, ${theme.accent}, #06b6d4)`,
                    boxShadow: `0 0 8px ${theme.accentGlow}`,
                  }}
                />
              </div>

              {/* Slider Input */}
              <input
                id="now-playing-volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>

            <span className="text-[10px] font-mono-numbers font-bold text-neutral-300 w-7 text-right shrink-0">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Playback Speed Dialog */}
      {showSpeedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            id="playback-speed-dialog"
            className="w-full max-w-xs rounded-3xl p-5 shadow-2xl border border-white/10"
            style={{ backgroundColor: theme.surfaceDark }}
          >
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4" style={{ color: theme.accent }} />
              Playback Speed
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onSetSpeed(s);
                    setShowSpeedMenu(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-mono-numbers font-bold transition-all ${
                    playbackSpeed === s
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSpeedMenu(false)}
              className="w-full mt-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
