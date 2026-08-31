import React, { useState } from 'react';
import { Users, Disc3, Music, Play, ArrowLeft, MoreVertical } from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface ArtistsAlbumsViewProps {
  mode: 'artists' | 'albums';
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onOpenSongMenu: (song: Song, e: React.MouseEvent) => void;
  theme: ThemeConfig;
}

export const ArtistsAlbumsView: React.FC<ArtistsAlbumsViewProps> = ({
  mode,
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onOpenSongMenu,
  theme,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Group songs by artist or album
  const grouped = React.useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach((s) => {
      const key = mode === 'artists' ? s.artist : s.album;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(s);
    });
    return Array.from(map.entries()).map(([name, trackList]) => ({
      name,
      songs: trackList,
      count: trackList.length,
      gradient: trackList[0]?.coverGradient || 'from-indigo-600 to-purple-800',
    }));
  }, [songs, mode]);

  if (selectedEntity) {
    const activeGroup = grouped.find((g) => g.name === selectedEntity);
    const activeSongs = activeGroup ? activeGroup.songs : [];

    return (
      <div className="pb-32 px-4 pt-4 max-w-5xl mx-auto animate-in fade-in duration-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              id="group-back-btn"
              onClick={() => setSelectedEntity(null)}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                {mode === 'artists' ? (
                  <Users className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Disc3 className="w-5 h-5 text-sky-400" />
                )}
                <h2 className="text-lg font-bold text-white">{selectedEntity}</h2>
              </div>
              <p className="text-xs text-neutral-400 font-mono-numbers">
                {activeSongs.length} {activeSongs.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          </div>

          <button
            id="group-play-all-btn"
            onClick={() => activeSongs[0] && onPlaySong(activeSongs[0], activeSongs)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg"
            style={{ backgroundColor: theme.accent }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play All</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {activeSongs.map((song) => {
            const isThisPlaying = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                id={`group-song-item-${song.id}`}
                onClick={() => onPlaySong(song, activeSongs)}
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
                      <span className="truncate">{mode === 'artists' ? song.album : song.artist}</span>
                      <span>•</span>
                      <span className="font-mono-numbers text-[11px]">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id={`group-song-menu-${song.id}`}
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
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-3 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {grouped.map((item) => (
          <div
            key={item.name}
            id={`entity-card-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => setSelectedEntity(item.name)}
            className="group p-3 rounded-2xl border border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl cursor-pointer transition-all flex flex-col items-center text-center shadow-sm hover:shadow-lg"
          >
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 mb-3 rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 bg-gradient-to-br ${item.gradient}`}
            >
              {mode === 'artists' ? (
                <Users className="w-10 h-10 text-white/90" />
              ) : (
                <Disc3 className="w-10 h-10 text-white/90 animate-[spin_10s_linear_infinite]" />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-current" />
              </div>
            </div>

            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate w-full">
              {item.name}
            </h3>
            <p className="text-xs text-neutral-400 font-mono-numbers mt-0.5">
              {item.count} {item.count === 1 ? 'track' : 'tracks'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
