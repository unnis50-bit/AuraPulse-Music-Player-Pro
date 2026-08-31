import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Shuffle,
  Trash2,
  ArrowLeft,
  Music,
  MoreVertical,
  Heart,
  Sparkles,
} from 'lucide-react';
import { Playlist, Song, ThemeConfig } from '../types';

interface PlaylistsViewProps {
  playlists: Playlist[];
  allSongs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (id: string) => void;
  onOpenSongMenu: (song: Song, e: React.MouseEvent) => void;
  theme: ThemeConfig;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  allSongs,
  currentSong,
  isPlaying,
  onPlaySong,
  onCreatePlaylist,
  onDeletePlaylist,
  onOpenSongMenu,
  theme,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
  };

  if (selectedPlaylist) {
    const playlistSongs = allSongs.filter((s) => selectedPlaylist.songIds.includes(s.id));

    return (
      <div className="pb-32 px-4 pt-4 max-w-5xl mx-auto animate-in fade-in duration-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              id="playlist-back-btn"
              onClick={() => setSelectedPlaylist(null)}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5" style={{ color: theme.accent }} />
                <h2 className="text-lg font-bold text-white">{selectedPlaylist.name}</h2>
              </div>
              <p className="text-xs text-neutral-400 font-mono-numbers">
                {playlistSongs.length} {playlistSongs.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="playlist-play-btn"
              onClick={() => playlistSongs[0] && onPlaySong(playlistSongs[0], playlistSongs)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-lg"
              style={{ backgroundColor: theme.accent }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </button>
            <button
              id="playlist-shuffle-btn"
              onClick={() => {
                if (playlistSongs.length === 0) return;
                const shuffled = [...playlistSongs].sort(() => Math.random() - 0.5);
                onPlaySong(shuffled[0], shuffled);
              }}
              className="p-2 rounded-xl bg-white/10 text-neutral-200 hover:text-white hover:bg-white/20 transition-colors"
              title="Shuffle Playlist"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-1.5">
          {playlistSongs.map((song) => {
            const isThisPlaying = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                id={`pl-track-item-${song.id}`}
                onClick={() => onPlaySong(song, playlistSongs)}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border backdrop-blur-md ${
                  isThisPlaying
                    ? 'border-emerald-500/40 bg-emerald-500/15 shadow-lg'
                    : 'border-white/5 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${
                      song.coverGradient || 'from-indigo-600 to-purple-800'
                    }`}
                  >
                    {isThisPlaying && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.2s]" />
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.4s]" />
                      </div>
                    ) : (
                      <Music className="w-5 h-5 text-white/90" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isThisPlaying ? 'text-emerald-400' : 'text-neutral-100 group-hover:text-white'
                      }`}
                    >
                      {song.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="truncate">{song.artist}</span>
                      <span>•</span>
                      <span className="font-mono-numbers text-[11px]">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id={`pl-song-menu-${song.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSongMenu(song, e);
                    }}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {playlistSongs.length === 0 && (
            <div className="py-12 text-center text-neutral-400">
              <ListMusic className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-300">No tracks in this playlist yet</p>
              <p className="text-xs text-neutral-500 mt-0.5">Use track 3-dot menu to add songs</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-3 max-w-5xl mx-auto">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-neutral-400">
          <span className="font-semibold text-neutral-200">{playlists.length} Playlists</span>
        </div>

        <button
          id="playlists-create-new-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: theme.accent }}
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Playlists Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {playlists.map((pl) => {
          const songCount = pl.songIds.length;
          return (
            <div
              key={pl.id}
              id={`playlist-card-${pl.id}`}
              onClick={() => setSelectedPlaylist(pl)}
              className="group p-4 rounded-2xl border border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl cursor-pointer transition-all flex items-center justify-between shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform bg-gradient-to-br ${
                    pl.coverGradient || 'from-indigo-600 to-purple-800'
                  }`}
                >
                  <ListMusic className="w-7 h-7 text-white/95" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {pl.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono-numbers mt-0.5">
                    {songCount} {songCount === 1 ? 'song' : 'songs'}
                  </p>
                  {pl.description && (
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">{pl.description}</p>
                  )}
                </div>
              </div>

              {pl.id.startsWith('custom-') && (
                <button
                  id={`playlist-delete-${pl.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete playlist "${pl.name}"?`)) {
                      onDeletePlaylist(pl.id);
                    }
                  }}
                  className="p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            id="create-playlist-dialog"
            className="w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10"
            style={{ backgroundColor: theme.surfaceDark }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: theme.accent }} />
              <h3 className="text-base font-bold text-white">Create New Playlist</h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Playlist Name</label>
                <input
                  id="create-playlist-name-input"
                  type="text"
                  required
                  placeholder="e.g. My Driving Beats"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-sm border border-white/10 focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.accent }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Description (optional)</label>
                <input
                  id="create-playlist-desc-input"
                  type="text"
                  placeholder="e.g. High energy tracks for travel"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-sm border border-white/10 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  id="create-playlist-cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="create-playlist-submit-btn"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg"
                  style={{ backgroundColor: theme.accent }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
