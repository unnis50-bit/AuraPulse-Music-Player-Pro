import React, { useState, useMemo } from 'react';
import {
  Music,
  Play,
  MoreVertical,
  Shuffle,
  ArrowUpDown,
  Heart,
  Headphones,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface SongsListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onToggleFavorite: (songId: string, e: React.MouseEvent) => void;
  onOpenSongMenu: (song: Song, e: React.MouseEvent) => void;
  onRemoveSampleSongs?: () => void;
  onCleanDuplicates?: () => void;
  searchQuery: string;
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
  onRemoveSampleSongs,
  onCleanDuplicates,
  searchQuery,
  theme,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
      {/* Header Info & Sort Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Headphones className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-neutral-200">
            {filteredAndSortedSongs.length} {filteredAndSortedSongs.length === 1 ? 'Track' : 'Tracks'}
          </span>
          {searchQuery && (
            <span className="text-neutral-400">matching "{searchQuery}"</span>
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
                      {sortBy === opt.id && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />}
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
        {filteredAndSortedSongs.map((song, index) => {
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

        {filteredAndSortedSongs.length === 0 && (
          <div className="py-16 text-center text-neutral-400">
            <Music className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
            <p className="text-base font-semibold text-neutral-200">No tracks found</p>
            <p className="text-xs text-neutral-500 mt-1">Try a different search query or import audio files</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Shuffle All (Pulsar green FAB) */}
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
    </div>
  );
};
