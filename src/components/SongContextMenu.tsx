import React from 'react';
import {
  Play,
  ListPlus,
  ListOrdered,
  Tag,
  Heart,
  Info,
  Trash2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface SongContextMenuProps {
  song: Song | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onPlayNext: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onEditTags: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
  theme: ThemeConfig;
}

export const SongContextMenu: React.FC<SongContextMenuProps> = ({
  song,
  position,
  onClose,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onToggleFavorite,
  onEditTags,
  onDeleteSong,
  theme,
}) => {
  if (!song || !position) return null;

  // Keep menu on screen
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const menuW = 220;
  const menuH = 320;

  const left = Math.min(position.x, screenW - menuW - 16);
  const top = Math.min(position.y, screenH - menuH - 16);

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        id="aurapulse-song-context-menu"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          backgroundColor: `${theme.surfaceDark}e6`,
        }}
        className="fixed z-50 w-56 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 backdrop-blur-3xl animate-in fade-in zoom-in-95"
      >
        {/* Track header */}
        <div className="px-3 py-2 border-b border-white/10 mb-1">
          <p className="text-xs font-bold text-white truncate">{song.title}</p>
          <p className="text-[11px] text-neutral-400 truncate">{song.artist}</p>
        </div>

        <button
          id="ctx-play-next"
          onClick={() => {
            onPlayNext(song);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left transition-colors"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span>Play Next</span>
        </button>

        <button
          id="ctx-add-queue"
          onClick={() => {
            onAddToQueue(song);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left transition-colors"
        >
          <ListOrdered className="w-3.5 h-3.5 text-sky-400" />
          <span>Add to Queue</span>
        </button>

        <button
          id="ctx-add-playlist"
          onClick={() => {
            onAddToPlaylist(song);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left transition-colors"
        >
          <ListPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add to Playlist</span>
        </button>

        <button
          id="ctx-toggle-fav"
          onClick={() => {
            onToggleFavorite(song.id);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 ${song.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-neutral-400'}`} />
          <span>{song.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        </button>

        <button
          id="ctx-edit-tags"
          onClick={() => {
            onEditTags(song);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left transition-colors"
        >
          <Tag className="w-3.5 h-3.5 text-purple-400" />
          <span>Edit ID3 Tags</span>
        </button>

        <div className="h-[1px] bg-white/10 my-1" />

        <button
          id="ctx-delete-track"
          onClick={() => {
            if (confirm(`Remove "${song.title}" from library?`)) {
              onDeleteSong(song.id);
            }
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Track</span>
        </button>
      </div>
    </>
  );
};
