import React, { useRef, useState } from 'react';
import { Upload, X, FileAudio, Check, FolderUp, HardDrive, RefreshCw, FolderSearch, AlertCircle } from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSongs: (newSongs: Song[]) => void;
  theme: ThemeConfig;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSongs,
  theme,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [importedCount, setImportedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Helper to accurately extract audio duration using Audio object
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
      // Timeout fallback after 1.5s
      setTimeout(() => {
        cleanup();
        resolve(210);
      }, 1500);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setScanProgress('Indexing audio files...');

    const gradients = [
      'from-rose-600 via-pink-700 to-purple-950',
      'from-emerald-600 via-teal-700 to-slate-900',
      'from-amber-600 via-orange-700 to-neutral-900',
      'from-indigo-600 via-blue-700 to-slate-950',
      'from-cyan-600 via-sky-800 to-zinc-950',
      'from-violet-600 via-purple-700 to-stone-900',
      'from-fuchsia-600 via-rose-700 to-slate-950',
    ];

    const fileList = Array.from(files).filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return (
        ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'opus', 'wma', 'weba', 'mid'].includes(ext) ||
        file.type.startsWith('audio/')
      );
    });

    if (fileList.length === 0) {
      setIsScanning(false);
      setScanProgress('No valid audio files found in selection.');
      setTimeout(() => setScanProgress(''), 3000);
      return;
    }

    const parsedSongs: Song[] = [];

    for (let idx = 0; idx < fileList.length; idx++) {
      const file = fileList[idx];
      setScanProgress(`Processing ${idx + 1} of ${fileList.length}: ${file.name}`);

      // Clean filename
      const fullName = file.name.replace(/\.[^/.]+$/, '');
      const parts = fullName.split(' - ');
      const artist = parts.length > 1 ? parts[0].trim() : 'Local Artist';
      const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : fullName;

      const audioUrl = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
      const formatStr = `${ext} ${(file.size / (1024 * 1024)).toFixed(1)}MB`;

      // Extract folder name from webkitRelativePath if available, else infer from filename or path
      let folderName = 'Music';
      let folderPath = `/storage/emulated/0/Music/${file.name}`;
      
      if (file.webkitRelativePath) {
        const pathParts = file.webkitRelativePath.split('/');
        if (pathParts.length > 1) {
          folderName = pathParts[pathParts.length - 2] || pathParts[0] || 'Music';
          folderPath = `/storage/emulated/0/${file.webkitRelativePath}`;
        }
      } else {
        // Infer folder based on keywords or default to Download / Device Audio
        if (file.name.toLowerCase().includes('whatsapp')) {
          folderName = 'WhatsApp Audio';
          folderPath = `/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Audio/${file.name}`;
        } else if (file.name.toLowerCase().includes('record') || file.name.toLowerCase().includes('voice')) {
          folderName = 'Recordings';
          folderPath = `/storage/emulated/0/Recordings/${file.name}`;
        } else {
          folderName = 'Download';
          folderPath = `/storage/emulated/0/Download/${file.name}`;
        }
      }

      // Fast async duration estimation
      const songDuration = await getAudioDuration(audioUrl);

      parsedSongs.push({
        id: `user-track-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        title: title || file.name,
        artist: artist || 'Local Artist',
        album: folderName,
        duration: songDuration,
        folder: folderName,
        filePath: folderPath,
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

    onImportSongs(parsedSongs);
    setIsScanning(false);
    setScanProgress('');
    setImportedCount(parsedSongs.length);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Modern File System Directory Access (if supported by browser)
  const handleModernDirectoryScan = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-expect-error - modern File System Access API
        const dirHandle = await window.showDirectoryPicker();
        setIsScanning(true);
        setScanProgress(`Scanning folder "${dirHandle.name}"...`);

        const collectedFiles: File[] = [];
        // Recursive directory reader
        const readDir = async (handle: any, path = '') => {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              const ext = file.name.split('.').pop()?.toLowerCase() || '';
              if (
                ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'opus', 'wma'].includes(ext) ||
                file.type.startsWith('audio/')
              ) {
                // Attach custom relative path
                Object.defineProperty(file, 'webkitRelativePath', {
                  value: `${path ? path + '/' : ''}${handle.name}/${file.name}`,
                  writable: false,
                });
                collectedFiles.push(file);
              }
            } else if (entry.kind === 'directory') {
              await readDir(entry, `${path ? path + '/' : ''}${handle.name}`);
            }
          }
        };

        await readDir(dirHandle);

        if (collectedFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          collectedFiles.forEach((f) => dataTransfer.items.add(f));
          await handleFiles(dataTransfer.files);
        } else {
          setIsScanning(false);
          setScanProgress('No audio files found in chosen folder.');
          setTimeout(() => setScanProgress(''), 3000);
        }
      } else {
        // Fallback to input ref
        folderInputRef.current?.click();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Directory Picker error, falling back to input:', err);
        folderInputRef.current?.click();
      }
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        id="aurapulse-file-upload-modal"
        className="w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.9)] border border-white/15 backdrop-blur-3xl"
        style={{ backgroundColor: `${theme.surfaceDark}f2` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md border border-white/10"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <FolderSearch className="w-5 h-5" style={{ color: theme.accent }} />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <h3 className="text-base font-extrabold text-white font-brand-luxury uppercase tracking-wider">
                  Scan & Import Audio
                </h3>
                <span
                  className="text-[9px] uppercase font-mono-numbers px-1.5 py-0.5 rounded-md font-bold tracking-wider border border-white/10"
                  style={{ backgroundColor: theme.badgeBg, color: theme.accent }}
                >
                  HI-RES
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-1">Scan device folders & add songs to library</p>
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
              Successfully Imported {importedCount} {importedCount === 1 ? 'Track' : 'Tracks'}!
            </h4>
            <p className="text-xs text-neutral-400">
              Folders categorized and saved to your offline library
            </p>
          </div>
        ) : isScanning ? (
          <div className="py-10 text-center space-y-4">
            <div
              className="w-12 h-12 border-3 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"
              style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
            />
            <div>
              <p className="text-sm font-bold text-white">Scanning Music Library...</p>
              <p className="text-xs text-neutral-400 font-mono-numbers mt-1 truncate max-w-xs mx-auto">
                {scanProgress || 'Analyzing audio metadata & organizing folders...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Direct Quick Scan Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Scan Entire Folder / Directory */}
              <button
                id="browse-device-folders-btn"
                onClick={handleModernDirectoryScan}
                className="p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden group border-white/10 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                  >
                    <FolderUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Scan Music Folder</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Select full folder or directory</p>
                  </div>
                </div>
              </button>

              {/* Select Audio Files */}
              <button
                id="browse-device-files-btn"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden group border-white/10 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 shadow-sm">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Select Audio Files</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Pick MP3, FLAC, WAV, AAC</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10 scale-102'
                  : 'border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/5'
              }`}
            >
              <Upload className="w-6 h-6 text-neutral-400 mb-1.5" />
              <p className="text-xs font-semibold text-white">Or Drag & Drop Audio Files Here</p>
              <p className="text-[10px] text-neutral-400 font-mono-numbers mt-0.5">
                MP3 • FLAC • WAV • AAC • M4A • OGG
              </p>

              {/* Hidden Standard File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*,.mp3,.flac,.wav,.aac,.m4a,.ogg,.opus,.wma"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {/* Hidden Directory Picker input for fallback */}
              <input
                ref={folderInputRef}
                type="file"
                multiple
                {...({ webkitdirectory: 'true', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {scanProgress && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{scanProgress}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

