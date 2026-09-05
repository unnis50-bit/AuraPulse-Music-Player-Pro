import React, { useState, useMemo, useRef } from 'react';
import {
  Music,
  Play,
  MoreVertical,
  Shuffle,
  ArrowUpDown,
  Heart,
  Headphones,
  Search,
  X,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { Song, ThemeConfig } from '../types';
import { PermissionScanBanner } from './PermissionScanBanner';

interface SongsListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onToggleFavorite: (songId: string, e: React.MouseEvent) => void;
  onOpenSongMenu: (song: Song, e: React.MouseEvent) => void;
  onRemoveSampleSongs?: () => void;
  onCleanDuplicates?: () => void;
  onOpenFileUpload?: () => void;
  onImportSongs?: (newSongs: Song[], blobsMap?: Map<string, Blob>) => void;
  onOpenOnlineSearch?: () => void;
  searchQuery: string;
  onSearchChange?: (q: string) => void;
  theme: ThemeConfig;
}

type SortOption = 'default' | 'title' | 'artist' | 'duration' | 'mostPlayed';

export const SongsList: React.FC<SongsListProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleFavorite,
  onOpenSongMenu,
  onImportSongs,
  onOpenFileUpload,
  onRemoveSampleSongs,
  searchQuery,
  onSearchChange,
  theme,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const autoFileInputRef = useRef<HTMLInputElement | null>(null);
  const manualFileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to extract audio duration
  const getAudioDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'metadata';
      const onLoaded = () => {
        const dur = Math.round(audio.duration);
        cleanup();
        resolve(isNaN(dur) || dur <= 0 ? 210 : dur);
      };
      const onError = () => {
        cleanup();
        resolve(210);
      };
      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('error', onError);
      };
      audio.addEventListener('loadedmetadata', onLoaded);
      audio.addEventListener('error', onError);
      setTimeout(() => {
        cleanup();
        resolve(210);
      }, 1500);
    });
  };

  // Process selected audio files
  const processImportFiles = async (files: FileList | File[]) => {
    const fileList: File[] = (Array.from(files) as File[]).filter((file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return (
        ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'opus', 'wma', 'weba'].includes(ext) ||
        file.type.startsWith('audio/')
      );
    });

    if (fileList.length === 0) {
      setIsProcessing(false);
      setStatusMessage('No valid audio files found.');
      setTimeout(() => setStatusMessage(null), 2500);
      return;
    }

    setIsProcessing(true);
    setStatusMessage(`Scanning ${fileList.length} audio tracks...`);

    const gradients = [
      'from-emerald-600 via-teal-700 to-slate-900',
      'from-rose-600 via-pink-700 to-purple-950',
      'from-amber-600 via-orange-700 to-neutral-900',
      'from-indigo-600 via-blue-700 to-slate-950',
      'from-cyan-600 via-sky-800 to-zinc-950',
      'from-violet-600 via-purple-700 to-stone-900',
    ];

    const parsedSongs: Song[] = [];
    const blobsMap = new Map<string, Blob>();

    for (let idx = 0; idx < fileList.length; idx++) {
      const file = fileList[idx];
      const fullName = file.name.replace(/\.[^/.]+$/, '');
      const parts = fullName.split(' - ');
      const artist = parts.length > 1 ? parts[0].trim() : 'Local Artist';
      const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : fullName;

      const audioUrl = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
      const duration = await getAudioDuration(audioUrl);

      let folderName = 'Download';
      if ((file as any).webkitRelativePath) {
        const segments = (file as any).webkitRelativePath.split('/');
        if (segments.length > 1) {
          folderName = segments[segments.length - 2];
        }
      }

      const songId = `user-track-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
      parsedSongs.push({
        id: songId,
        title,
        artist,
        album: folderName,
        duration,
        format: ext,
        bitrate: ext === 'FLAC' || ext === 'WAV' ? '1411 kbps' : '320 kbps',
        audioUrl,
        isFavorite: false,
        folder: folderName,
        filePath: `/storage/emulated/0/${folderName}/${file.name}`,
        dateAdded: Date.now(),
        coverGradient: gradients[idx % gradients.length],
      });

      blobsMap.set(songId, file);
    }

    if (onImportSongs) {
      onImportSongs(parsedSongs, blobsMap);
    } else if (onOpenFileUpload) {
      onOpenFileUpload();
    }

    setIsProcessing(false);
    setStatusMessage(`✓ Added ${parsedSongs.length} songs to library!`);
    setTimeout(() => setStatusMessage(null), 3000);

    if (autoFileInputRef.current) autoFileInputRef.current.value = '';
    if (manualFileInputRef.current) manualFileInputRef.current.value = '';
  };

  // Button 1: Automatic Search
  const handleAutoSearch = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-expect-error - Modern Directory Picker
        const dirHandle = await window.showDirectoryPicker();
        setIsProcessing(true);
        setStatusMessage(`Scanning "${dirHandle.name}" folder...`);

        const collectedFiles: File[] = [];
        const readDir = async (handle: any) => {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              const ext = file.name.split('.').pop()?.toLowerCase() || '';
              if (['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'opus', 'wma'].includes(ext)) {
                collectedFiles.push(file);
              }
            } else if (entry.kind === 'directory') {
              await readDir(entry);
            }
          }
        };

        await readDir(dirHandle);
        if (collectedFiles.length > 0) {
          await processImportFiles(collectedFiles);
          return;
        }
      }
    } catch {
      // User cancelled or fallback to native file picker
    }

    if (autoFileInputRef.current) {
      autoFileInputRef.current.click();
    }
  };

  // Button 2: Manual Search
  const handleManualSearch = () => {
    if (manualFileInputRef.current) {
      manualFileInputRef.current.click();
    }
  };

  const filteredAndSortedSongs = useMemo(() => {
    let list = [...songs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q) ||
          s.genre?.toLowerCase().includes(q) ||
          s.folder?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist') {
      list.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (sortBy === 'duration') {
      list.sort((a, b) => b.duration - a.duration);
    } else if (sortBy === 'mostPlayed') {
      list.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }

    return list;
  }, [songs, searchQuery, sortBy]);

  const handlePlayAll = () => {
    if (filteredAndSortedSongs.length === 0) return;
    onPlaySong(filteredAndSortedSongs[0], filteredAndSortedSongs);
  };

  const handleShuffleAll = () => {
    if (filteredAndSortedSongs.length === 0) return;
    const shuffled = [...filteredAndSortedSongs].sort(() => Math.random() - 0.5);
    onPlaySong(shuffled[0], shuffled);
  };

  return (
    <div className="pb-32 px-4 pt-3 max-w-5xl mx-auto">
      {/* Hidden File Pickers for 1-Tap Trigger */}
      <input
        ref={autoFileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.flac,.aac,.ogg,.opus,.wma"
        onChange={(e) => e.target.files && processImportFiles(e.target.files)}
        className="hidden"
        id="native-auto-search-input"
      />
      <input
        ref={manualFileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.flac,.aac,.ogg,.opus,.wma"
        onChange={(e) => e.target.files && processImportFiles(e.target.files)}
        className="hidden"
        id="native-manual-search-input"
      />

      {/* Storage & Music Permission Scan Banner (1. Automatic Search & 2. Manual Search) */}
      <PermissionScanBanner
        onDirectFilesSelected={(files) => processImportFiles(files)}
        theme={theme}
        totalSongs={songs.filter((s) => !s.id.startsWith('demo-')).length}
        hasDemoSongs={songs.some((s) => s.id.startsWith('demo-'))}
        onRemoveDemoSongs={onRemoveSampleSongs}
      />

      {/* Status / Success Toast */}
      {statusMessage && (
        <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header Info & Sort Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Headphones className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-neutral-200">
            {filteredAndSortedSongs.length} {filteredAndSortedSongs.length === 1 ? 'Track' : 'Tracks'}
          </span>
          {searchQuery && (
            <span className="text-emerald-400 font-medium">matching "{searchQuery}"</span>
          )}
        </div>

        {/* Quick Action Bar: Play All, Shuffle, Sort */}
        <div className="flex items-center gap-2">
          {filteredAndSortedSongs.length > 0 && (
            <>
              <button
                id="songs-play-all-top-btn"
                onClick={handlePlayAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: theme.accent }}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </button>

              <button
                id="songs-shuffle-all-top-btn"
                onClick={handleShuffleAll}
                className="p-1.5 rounded-xl bg-white/10 text-neutral-200 hover:text-white hover:bg-white/20 transition-colors"
                title="Shuffle All"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Sort Menu */}
          <div className="relative">
            <button
              id="songs-sort-dropdown-btn"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors border border-white/5"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="capitalize">
                {sortBy === 'default' ? 'Sort' : sortBy.replace('mostPlayed', 'Top Played')}
              </span>
            </button>

            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div
                  id="songs-sort-menu"
                  className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl p-1.5 shadow-2xl border border-white/10 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95"
                  style={{ backgroundColor: theme.surfaceDark }}
                >
                  {[
                    { id: 'default', label: 'Default Order' },
                    { id: 'title', label: 'Track Title' },
                    { id: 'artist', label: 'Artist Name' },
                    { id: 'duration', label: 'Duration' },
                    { id: 'mostPlayed', label: 'Most Played' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      id={`sort-option-${opt.id}`}
                      onClick={() => {
                        setSortBy(opt.id as SortOption);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                        sortBy === opt.id
                          ? 'bg-white/15 text-white font-bold'
                          : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Songs List Items */}
      <div className="space-y-1.5">
        {filteredAndSortedSongs.map((song) => {
          const isThisPlaying = currentSong?.id === song.id;
          return (
            <div
              key={song.id}
              id={`song-row-${song.id}`}
              onClick={() => onPlaySong(song, filteredAndSortedSongs)}
              className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all border backdrop-blur-md ${
                isThisPlaying
                  ? 'border-emerald-500/40 bg-emerald-500/15 shadow-lg'
                  : 'border-white/5 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08]'
              }`}
            >
              {/* Left Column: Artwork + Title + Artist */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Artwork / Animated Equalizer Thumbnail */}
                <div
                  className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center relative overflow-hidden shadow-md bg-gradient-to-br ${
                    song.coverGradient || 'from-indigo-600 to-purple-800'
                  }`}
                >
                  {isThisPlaying && isPlaying ? (
                    <div className="flex items-end gap-1 h-5">
                      <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                      <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.15s]" />
                      <span className="w-1 bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.3s]" />
                      <span className="w-1 bg-white rounded-full animate-[bounce_0.7s_ease-in-out_infinite_0.45s]" />
                    </div>
                  ) : (
                    <div className="relative">
                      <Music className="w-5 h-5 text-white/90 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="min-w-0 pr-2">
                  <h4
                    className={`text-sm font-semibold truncate transition-colors ${
                      isThisPlaying ? 'text-emerald-400 font-bold' : 'text-neutral-100 group-hover:text-white'
                    }`}
                  >
                    {song.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                    <span className="truncate max-w-[150px] sm:max-w-[220px]">{song.artist}</span>
                    <span>•</span>
                    <span className="truncate hidden sm:inline text-neutral-500">{song.album}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-mono-numbers text-[11px] text-neutral-400">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Res Format Badge, Favorite, 3-dot menu */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="text-[10px] uppercase font-mono-numbers px-2 py-0.5 rounded-md font-bold hidden md:inline-block tracking-wider"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: theme.textSecondary }}
                >
                  {song.format}
                </span>

                <button
                  id={`song-favorite-${song.id}`}
                  onClick={(e) => onToggleFavorite(song.id, e)}
                  className={`p-2 rounded-xl transition-all ${
                    song.isFavorite
                      ? 'text-rose-500 scale-110'
                      : 'text-neutral-500 hover:text-rose-400 opacity-0 group-hover:opacity-100'
                  }`}
                  title={song.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
                </button>

                <button
                  id={`song-options-${song.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSongMenu(song, e);
                  }}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Track Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredAndSortedSongs.length === 0 && (
          <div className="py-12 text-center text-neutral-400 space-y-4 max-w-md mx-auto px-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl">
              <Music className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-neutral-200">
                {searchQuery ? `No results for "${searchQuery}"` : 'No Songs Found'}
              </p>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {searchQuery
                  ? 'Try searching with another keyword or clear the search.'
                  : 'No audio tracks found on this device.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {searchQuery && (
                <button
                  id="empty-songs-clear-search-btn"
                  onClick={() => onSearchChange?.('')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Search</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Shuffle All */}
      {filteredAndSortedSongs.length > 0 && (
        <div className="fixed bottom-24 right-5 z-20">
          <button
            id="songs-fab-shuffle-all"
            onClick={handleShuffleAll}
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 group"
            style={{ backgroundColor: theme.accent, boxShadow: `0 8px 24px ${theme.accentGlow}` }}
            title="Shuffle All Tracks"
          >
            <Shuffle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
