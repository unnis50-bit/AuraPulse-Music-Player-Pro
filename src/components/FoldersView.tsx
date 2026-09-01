import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  Music,
  MoreVertical,
  Shuffle,
  Play,
  ArrowLeft,
  HardDrive,
  FolderPlus,
  Search,
  CheckCircle,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { FolderItem, Song, ThemeConfig } from '../types';

interface FoldersViewProps {
  folders: FolderItem[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onPlayFolder: (folder: FolderItem) => void;
  onShuffleFolder: (folder: FolderItem) => void;
  onOpenSongMenu: (song: Song, e: React.MouseEvent) => void;
  onOpenFileUpload: () => void;
  searchQuery?: string;
  theme: ThemeConfig;
}

export const FoldersView: React.FC<FoldersViewProps> = ({
  folders,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayFolder,
  onShuffleFolder,
  onOpenSongMenu,
  onOpenFileUpload,
  searchQuery = '',
  theme,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [activeMenuFolderId, setActiveMenuFolderId] = useState<string | null>(null);
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('');

  // Filter folders by global or local search
  const activeSearch = (folderSearchQuery || searchQuery || '').toLowerCase().trim();

  const filteredFolders = useMemo(() => {
    if (!activeSearch) return folders;
    return folders.filter((f) => {
      const matchFolderName = f.name.toLowerCase().includes(activeSearch);
      const matchPath = f.path.toLowerCase().includes(activeSearch);
      const matchSong = f.songs.some(
        (s) =>
          s.title.toLowerCase().includes(activeSearch) ||
          s.artist.toLowerCase().includes(activeSearch) ||
          s.album.toLowerCase().includes(activeSearch)
      );
      return matchFolderName || matchPath || matchSong;
    });
  }, [folders, activeSearch]);

  // If a folder is opened, display songs inside that folder
  if (selectedFolder) {
    const folderSongs = selectedFolder.songs.filter((song) => {
      if (!activeSearch) return true;
      return (
        song.title.toLowerCase().includes(activeSearch) ||
        song.artist.toLowerCase().includes(activeSearch) ||
        song.album.toLowerCase().includes(activeSearch)
      );
    });

    const totalFolderDurationSecs = selectedFolder.songs.reduce((acc, s) => acc + (s.duration || 0), 0);
    const folderMin = Math.floor(totalFolderDurationSecs / 60);

    return (
      <div className="pb-32 px-4 pt-4 max-w-5xl mx-auto animate-in fade-in duration-200">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              id="folder-back-btn"
              onClick={() => setSelectedFolder(null)}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">{selectedFolder.name}</h2>
              </div>
              <p className="text-xs text-neutral-400 font-mono-numbers">{selectedFolder.path}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="folder-play-all-btn"
              onClick={() => onPlayFolder(selectedFolder)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: theme.accent }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
            <button
              id="folder-shuffle-all-btn"
              onClick={() => onShuffleFolder(selectedFolder)}
              className="p-2 rounded-xl bg-white/10 text-neutral-200 hover:text-white hover:bg-white/20 transition-colors"
              title="Shuffle Folder"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Folder Stats & In-Folder Search */}
        <div className="flex items-center justify-between mb-3 px-1 gap-2">
          <span className="text-xs text-neutral-400">
            {selectedFolder.songs.length} tracks • approx {folderMin} min
          </span>
          <div className="flex items-center bg-white/5 rounded-xl px-2.5 py-1 text-xs border border-white/10">
            <Search className="w-3.5 h-3.5 text-neutral-400 mr-1.5" />
            <input
              type="text"
              value={folderSearchQuery}
              onChange={(e) => setFolderSearchQuery(e.target.value)}
              placeholder="Search in folder..."
              className="bg-transparent text-white placeholder-neutral-500 focus:outline-none w-32 sm:w-44"
            />
            {folderSearchQuery && (
              <button onClick={() => setFolderSearchQuery('')} className="text-neutral-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Songs List inside Folder */}
        <div className="space-y-1.5">
          {folderSongs.map((song, idx) => {
            const isThisPlaying = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                id={`folder-song-item-${song.id}`}
                onClick={() => onPlaySong(song, selectedFolder.songs)}
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
                      <span className="font-mono-numbers text-[11px] text-neutral-400">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] uppercase font-mono-numbers px-2 py-0.5 rounded-md font-bold hidden sm:inline-block"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: theme.textSecondary }}
                  >
                    {song.format}
                  </span>
                  <button
                    id={`folder-song-more-${song.id}`}
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

          {folderSongs.length === 0 && (
            <div className="py-12 text-center text-neutral-400">
              <Music className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
              <p className="text-sm">No tracks match your search in this folder</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Root Folders List View (Mirrors Pulsar's exact Folders tab view)
  const totalSongsCount = folders.reduce((sum, f) => sum + f.songCount, 0);

  return (
    <div className="pb-32 px-4 pt-3 max-w-5xl mx-auto">
      {activeSearch && (
        <div className="mb-3 px-2 text-xs text-neutral-400">
          Showing {filteredFolders.length} folders matching "{activeSearch}"
        </div>
      )}

      {/* Folders List */}
      <div className="space-y-2.5">
        {filteredFolders.map((folder) => {
          return (
            <div
              key={folder.id}
              id={`folder-card-${folder.id}`}
              onClick={() => setSelectedFolder(folder)}
              className="group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border border-white/10 hover:border-white/25 hover:bg-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Folder Icon */}
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Folder className="w-6 h-6 text-amber-400 fill-amber-400/30" />
                </div>

                <div className="min-w-0 pr-2">
                  <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono-numbers truncate mt-0.5">
                    {folder.path}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-neutral-400 font-medium mr-1 hidden sm:inline">
                  {folder.songCount} {folder.songCount === 1 ? 'song' : 'songs'}
                </span>

                {/* Direct 1-Tap Play Folder Button */}
                <button
                  id={`folder-direct-play-${folder.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayFolder(folder);
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white text-emerald-400 transition-all shadow-sm"
                  title="Play all songs in folder"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>

                {/* Direct 1-Tap Shuffle Folder Button */}
                <button
                  id={`folder-direct-shuffle-${folder.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShuffleFolder(folder);
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all shadow-sm"
                  title="Shuffle folder"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <div className="relative">
                  <button
                    id={`folder-options-${folder.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuFolderId(activeMenuFolderId === folder.id ? null : folder.id);
                    }}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {activeMenuFolderId === folder.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuFolderId(null);
                        }}
                      />
                      <div
                        id={`folder-context-menu-${folder.id}`}
                        className="absolute right-0 top-full mt-1 w-48 rounded-2xl p-1.5 shadow-2xl border border-white/10 z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl"
                        style={{ backgroundColor: theme.surfaceDark }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          id={`folder-menu-play-${folder.id}`}
                          onClick={() => {
                            setActiveMenuFolderId(null);
                            onPlayFolder(folder);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                          <span>Play Folder</span>
                        </button>
                        <button
                          id={`folder-menu-shuffle-${folder.id}`}
                          onClick={() => {
                            setActiveMenuFolderId(null);
                            onShuffleFolder(folder);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                        >
                          <Shuffle className="w-3.5 h-3.5 text-sky-400" />
                          <span>Shuffle Folder</span>
                        </button>
                        <button
                          id={`folder-menu-explore-${folder.id}`}
                          onClick={() => {
                            setActiveMenuFolderId(null);
                            setSelectedFolder(folder);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 text-left"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>Explore Songs</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFolders.length === 0 && (
          <div className="py-16 text-center text-neutral-400">
            <Folder className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
            <p className="text-base font-semibold text-neutral-200">No folders found</p>
            <p className="text-xs text-neutral-500 mt-1">Tap "Auto-Scan & Add Folders" to select music directories</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Shuffle All Folders */}
      <div className="fixed bottom-24 right-5 z-20">
        <button
          id="folders-fab-shuffle-all"
          onClick={() => {
            const allSongs = folders.flatMap((f) => f.songs);
            if (allSongs.length > 0) {
              const randomSong = allSongs[Math.floor(Math.random() * allSongs.length)];
              onPlaySong(randomSong, allSongs);
            }
          }}
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
