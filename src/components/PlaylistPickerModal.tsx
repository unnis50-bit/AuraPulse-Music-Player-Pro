import React from 'react';
import { ListMusic, X, Plus, Check } from 'lucide-react';
import { Playlist, Song, ThemeConfig } from '../types';

interface PlaylistPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  playlists: Playlist[];
  onAddSongToPlaylist: (playlistId: string, songId: string) => void;
  onCreateAndAdd: (name: string, songId: string) => void;
  theme: ThemeConfig;
}

export const PlaylistPickerModal: React.FC<PlaylistPickerModalProps> = ({
  isOpen,
  onClose,
  song,
  playlists,
  onAddSongToPlaylist,
  onCreateAndAdd,
  theme,
}) => {
  const [showCreateInput, setShowCreateInput] = React.useState(false);
  const [newPlName, setNewPlName] = React.useState('');

  if (!isOpen || !song) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlName.trim()) return;
    onCreateAndAdd(newPlName.trim(), song.id);
    setNewPlName('');
    setShowCreateInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        id="aurapulse-playlist-picker-modal"
        className="w-full max-w-sm rounded-3xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] border border-white/15 backdrop-blur-3xl"
        style={{ backgroundColor: `${theme.surfaceDark}e6` }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ListMusic className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add to Playlist</h3>
              <p className="text-xs text-neutral-400 truncate max-w-[200px]">{song.title}</p>
            </div>
          </div>

          <button
            id="playlist-picker-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Playlists */}
        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {playlists.map((pl) => {
            const alreadyHas = pl.songIds.includes(song.id);
            return (
              <button
                key={pl.id}
                id={`add-to-pl-${pl.id}`}
                disabled={alreadyHas}
                onClick={() => {
                  onAddSongToPlaylist(pl.id, song.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                  alreadyHas
                    ? 'border-white/5 bg-white/5 opacity-60'
                    : 'border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ListMusic className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-semibold text-white">{pl.name}</span>
                </div>
                {alreadyHas ? (
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Added</span>
                  </span>
                ) : (
                  <Plus className="w-4 h-4 text-neutral-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Create new playlist inside picker */}
        {!showCreateInput ? (
          <button
            id="picker-new-playlist-toggle-btn"
            onClick={() => setShowCreateInput(true)}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-2">
            <input
              type="text"
              required
              autoFocus
              placeholder="New Playlist Name"
              value={newPlName}
              onChange={(e) => setNewPlName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/10 text-white text-xs border border-white/10 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreateInput(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-neutral-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                Create & Add
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
