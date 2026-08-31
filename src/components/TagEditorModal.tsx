import React, { useState } from 'react';
import { Tag, X, Save, Sparkles, Music } from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface TagEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onSaveTags: (updatedSong: Song) => void;
  theme: ThemeConfig;
}

export const TagEditorModal: React.FC<TagEditorModalProps> = ({
  isOpen,
  onClose,
  song,
  onSaveTags,
  theme,
}) => {
  if (!isOpen || !song) return null;

  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [album, setAlbum] = useState(song.album);
  const [genre, setGenre] = useState(song.genre || '');
  const [year, setYear] = useState<string>(song.year ? String(song.year) : '');
  const [lyrics, setLyrics] = useState(song.lyrics || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTags({
      ...song,
      title: title.trim() || song.title,
      artist: artist.trim() || song.artist,
      album: album.trim() || song.album,
      genre: genre.trim() || undefined,
      year: year ? parseInt(year) : undefined,
      lyrics: lyrics.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        id="aurapulse-tag-editor-modal"
        className="w-full max-w-lg rounded-3xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] border border-white/15 max-h-[90vh] overflow-y-auto backdrop-blur-3xl"
        style={{ backgroundColor: `${theme.surfaceDark}e6` }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Tag className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit ID3 Tags</h3>
              <p className="text-xs text-neutral-400">Modify audio file metadata</p>
            </div>
          </div>

          <button
            id="tag-editor-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Track Title</label>
            <input
              id="tag-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-sm border border-white/10 focus:outline-none focus:ring-2"
              style={{ borderColor: theme.accent }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Artist</label>
              <input
                id="tag-artist-input"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-sm border border-white/10 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Album</label>
              <input
                id="tag-album-input"
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-sm border border-white/10 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Genre</label>
              <input
                id="tag-genre-input"
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Carnatic Fusion"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-sm border border-white/10 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Year</label>
              <input
                id="tag-year-input"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2025"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-sm border border-white/10 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Lyrics (LRC / Text)</label>
            <textarea
              id="tag-lyrics-textarea"
              rows={4}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste synced or plain lyrics here..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/10 text-white text-xs border border-white/10 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              id="tag-editor-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="tag-editor-save-btn"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: theme.accent }}
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
