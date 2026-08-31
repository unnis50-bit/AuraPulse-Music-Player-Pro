import React from 'react';
import { ListOrdered, X, Play, Trash2, Music, GripVertical } from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  theme: ThemeConfig;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  onClose,
  queue,
  currentSong,
  isPlaying,
  onPlaySong,
  onRemoveFromQueue,
  onClearQueue,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        id="aurapulse-queue-modal"
        className="w-full max-w-md rounded-3xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] border border-white/15 max-h-[85vh] flex flex-col backdrop-blur-3xl"
        style={{ backgroundColor: `${theme.surfaceDark}e6` }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <ListOrdered className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Play Queue</h3>
              <p className="text-xs text-neutral-400 font-mono-numbers">
                {queue.length} {queue.length === 1 ? 'track' : 'tracks'} queued
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {queue.length > 0 && (
              <button
                id="queue-clear-btn"
                onClick={onClearQueue}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Clear Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="queue-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {queue.map((song, index) => {
            const isThisPlaying = currentSong?.id === song.id;
            return (
              <div
                key={`${song.id}-${index}`}
                id={`queue-item-${index}`}
                onClick={() => onPlaySong(song)}
                className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all border ${
                  isThisPlaying
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-transparent hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono-numbers text-neutral-500 w-5 text-center">
                    {index + 1}
                  </span>

                  <div
                    className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${
                      song.coverGradient || 'from-indigo-600 to-purple-800'
                    }`}
                  >
                    {isThisPlaying && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-white rounded-full animate-bounce" />
                        <span className="w-0.5 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.15s]" />
                      </div>
                    ) : (
                      <Music className="w-4 h-4 text-white/90" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4
                      className={`text-xs font-semibold truncate ${
                        isThisPlaying ? 'text-emerald-400 font-bold' : 'text-neutral-200'
                      }`}
                    >
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono-numbers text-neutral-400">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    id={`queue-remove-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromQueue(index);
                    }}
                    className="p-1.5 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from Queue"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {queue.length === 0 && (
            <div className="py-12 text-center text-neutral-400">
              <ListOrdered className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
              <p className="text-sm font-semibold text-neutral-300">Play Queue is empty</p>
              <p className="text-xs text-neutral-500 mt-0.5">Select a song to start listening</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
