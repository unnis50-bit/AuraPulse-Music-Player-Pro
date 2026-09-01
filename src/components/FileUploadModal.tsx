import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Check,
  FolderSearch,
  FolderOpen,
  FileMusic,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSongs: (newSongs: Song[], blobsMap?: Map<string, Blob>) => void;
  theme: ThemeConfig;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSongs,
  theme,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const autoFileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  const processFiles = async (files: FileList | File[]) => {
    const fileList: File[] = Array.from(files).filter((file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return (
        ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'opus', 'wma', 'weba'].includes(ext) ||
        file.type.startsWith('audio/')
      );
    });

    if (fileList.length === 0) {
      alert('No audio files detected. Please pick MP3, M4A, WAV, or AAC audio files.');
      return;
    }

    setIsScanning(true);
    const parsedSongs: Song[] = [];
    const blobsMap = new Map<string, Blob>();

    const gradients = [
      'from-emerald-600 via-teal-700 to-slate-900',
      'from-rose-600 via-pink-700 to-purple-950',
      'from-amber-600 via-orange-700 to-neutral-900',
      'from-indigo-600 via-blue-700 to-slate-950',
      'from-cyan-600 via-sky-800 to-zinc-950',
      'from-violet-600 via-purple-700 to-stone-900',
    ];

    for (let idx = 0; idx < fileList.length; idx++) {
      const file = fileList[idx];
      setScanProgress(`Adding ${idx + 1} of ${fileList.length}: ${file.name}`);

      const fullName = file.name.replace(/\.[^/.]+$/, '');
      const parts = fullName.split(' - ');
      const artist = parts.length > 1 ? parts[0].trim() : 'Local Artist';
      const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : fullName;

      const audioUrl = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
      const formatStr = `${ext} ${(file.size / (1024 * 1024)).toFixed(1)}MB`;

      let folderName = 'Download';
      if (file.webkitRelativePath) {
        const pathParts = file.webkitRelativePath.split('/');
        if (pathParts.length > 1) {
          folderName = pathParts[pathParts.length - 2] || pathParts[0] || 'Download';
        }
      }

      const songDuration = await getAudioDuration(audioUrl);
      const songId = `user-track-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;

      blobsMap.set(songId, file);

      parsedSongs.push({
        id: songId,
        title: title || file.name,
        artist: artist || 'Local Artist',
        album: folderName,
        duration: songDuration,
        folder: folderName,
        filePath: `/storage/emulated/0/${folderName}/${file.name}`,
        format: formatStr,
        bitrate: '320 kbps',
        year: new Date().getFullYear(),
        genre: 'Local Audio',
        audioUrl: audioUrl,
        coverGradient: gradients[idx % gradients.length],
        dateAdded: Date.now() - idx * 1000,
        playCount: 0,
        isFavorite: false,
      });
    }

    onImportSongs(parsedSongs, blobsMap);
    setIsScanning(false);
    setScanProgress('');
    setImportedCount(parsedSongs.length);
    setTimeout(() => {
      onClose();
      setImportedCount(null);
    }, 1200);
  };

  // Button 1: Automatic Search
  const handleAutoSearch = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-expect-error - modern File System Access API
        const dirHandle = await window.showDirectoryPicker();
        setIsScanning(true);
        setScanProgress(`Scanning "${dirHandle.name}" folder...`);

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
          await processFiles(collectedFiles);
          return;
        }
      }
    } catch {
      // User cancelled or fallback
    }

    // Fallback to file picker
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      {/* Hidden File Pickers */}
      <input
        ref={autoFileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.flac,.wav,.aac,.m4a,.ogg,.opus"
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />
      <input
        ref={manualFileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.flac,.wav,.aac,.m4a,.ogg,.opus"
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />

      <div
        id="aurapulse-search-modal"
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/15 backdrop-blur-3xl"
        style={{ backgroundColor: `${theme.surfaceDark}f5` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md border border-white/10"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <FolderSearch className="w-5 h-5" style={{ color: theme.accent }} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                Add Songs to Player
              </h3>
              <p className="text-xs text-neutral-400 font-medium">Select search method</p>
            </div>
          </div>

          <button
            id="file-upload-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5"
            title="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {importedCount !== null ? (
          <div className="py-8 text-center space-y-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
              style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
            >
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-base font-extrabold text-white">
              Successfully Added {importedCount} {importedCount === 1 ? 'Track' : 'Tracks'}!
            </h4>
            <p className="text-xs text-neutral-400">Saved to your offline music library</p>
          </div>
        ) : isScanning ? (
          <div className="py-10 text-center space-y-4">
            <div
              className="w-12 h-12 border-3 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"
              style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
            />
            <div>
              <p className="text-sm font-bold text-white">Searching Songs...</p>
              <p className="text-xs text-neutral-400 font-mono-numbers mt-1 truncate max-w-xs mx-auto">
                {scanProgress || 'Analyzing audio files & adding to library...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* BUTTON 1: AUTOMATIC SEARCH */}
            <button
              id="modal-auto-search-btn"
              onClick={handleAutoSearch}
              className="w-full p-4 rounded-2xl text-left border transition-all relative overflow-hidden group border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-r from-emerald-950/50 via-neutral-900/60 to-emerald-950/30 hover:bg-emerald-900/20 active:scale-[0.99] shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                      1. Automatic Search
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-snug">
                    Allow storage permission and automatically scan all device songs
                  </p>
                </div>
              </div>
            </button>

            {/* BUTTON 2: MANUAL SEARCH */}
            <button
              id="modal-manual-search-btn"
              onClick={handleManualSearch}
              className="w-full p-4 rounded-2xl text-left border transition-all relative overflow-hidden group border-white/10 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.99] shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 shadow-sm border border-sky-500/30 group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-white group-hover:text-sky-300 transition-colors">
                      2. Manual Search
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-snug">
                    Manually choose specific audio files or folders from phone
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
