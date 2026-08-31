import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song, FolderItem, Playlist, EqualizerPreset, ThemeConfig, RepeatMode } from './types';
import {
  INITIAL_SONGS,
  INITIAL_FOLDERS,
  INITIAL_PLAYLISTS,
  DEFAULT_THEMES,
  DEFAULT_EQ_PRESETS,
} from './data/defaultLibrary';
import { audioEngine } from './services/audioEngine';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SongsList } from './components/SongsList';
import { FoldersView } from './components/FoldersView';
import { ArtistsAlbumsView } from './components/ArtistsAlbumsView';
import { PlaylistsView } from './components/PlaylistsView';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlayingModal } from './components/NowPlayingModal';
import { EqualizerModal } from './components/EqualizerModal';
import { ThemeModal } from './components/ThemeModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { TagEditorModal } from './components/TagEditorModal';
import { QueueModal } from './components/QueueModal';
import { FileUploadModal } from './components/FileUploadModal';
import { ProPaymentModal } from './components/ProPaymentModal';
import { SongContextMenu } from './components/SongContextMenu';
import { PlaylistPickerModal } from './components/PlaylistPickerModal';
import { setupMediaSession } from './utils/mediaSession';

// Helper to normalize and deduplicate songs (prevents multiple duplicate tracks with same name)
export function deduplicateSongs(songList: Song[]): Song[] {
  const map = new Map<string, Song>();

  songList.forEach((song) => {
    // Generate clean canonical key
    const cleanTitle = (song.title || '')
      .toLowerCase()
      .replace(/\s*\(\d+\)\s*$/g, '') // remove trailing (1), (2)
      .replace(/[^\w\s\u0D00-\u0D7F]/gi, ' ') // keep alphanumeric, spaces, and Malayalam script
      .trim();

    const cleanArtist = (song.artist || '').toLowerCase().trim();
    const key = cleanTitle ? `${cleanTitle}::${cleanArtist}` : song.id;

    if (!map.has(key)) {
      map.set(key, song);
    } else {
      const existing = map.get(key)!;
      // If the incoming song has real audioUrl and existing doesn't, upgrade it
      if (!existing.audioUrl && song.audioUrl) {
        map.set(key, { ...existing, ...song, audioUrl: song.audioUrl });
      } else if (song.isFavorite && !existing.isFavorite) {
        map.set(key, { ...existing, isFavorite: true });
      } else if ((song.playCount || 0) > (existing.playCount || 0)) {
        map.set(key, { ...existing, playCount: song.playCount });
      }
    }
  });

  return Array.from(map.values());
}

export default function App() {
  // State Initialization from LocalStorage with automatic deduplication
  const [songs, setSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('aurapulse_songs');
      const parsed: Song[] = saved ? JSON.parse(saved) : INITIAL_SONGS;
      // Ensure songs have working audioUrl for media notification
      const hydrated = parsed.map((s) => {
        const initial = INITIAL_SONGS.find((init) => init.id === s.id);
        if (initial?.audioUrl && !s.audioUrl) {
          return { ...s, audioUrl: initial.audioUrl, duration: initial.duration || s.duration };
        }
        return s;
      });
      return deduplicateSongs(hydrated);
    } catch {
      return deduplicateSongs(INITIAL_SONGS);
    }
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('aurapulse_playlists');
      return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
    }
  });

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const savedId = localStorage.getItem('aurapulse_theme_id');
      const found = DEFAULT_THEMES.find((t) => t.id === savedId);
      return found || DEFAULT_THEMES[0];
    } catch {
      return DEFAULT_THEMES[0];
    }
  });

  const [currentPreset, setCurrentPreset] = useState<EqualizerPreset>(() => {
    try {
      const saved = localStorage.getItem('aurapulse_eq_preset');
      return saved ? JSON.parse(saved) : DEFAULT_EQ_PRESETS[0];
    } catch {
      return DEFAULT_EQ_PRESETS[0];
    }
  });

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<string>('folders');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isProPaymentOpen, setIsProPaymentOpen] = useState(false);
  const [proFeatureTrigger, setProFeatureTrigger] = useState<'equalizer' | 'spectrum' | 'general'>('general');
  const [isProUnlocked, setIsProUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aurapulse_pro_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const handleOpenProPayment = (feature: 'equalizer' | 'spectrum' | 'general' = 'general') => {
    setProFeatureTrigger(feature);
    setIsProPaymentOpen(true);
  };

  const handleUnlockPro = () => {
    setIsProUnlocked(true);
    try {
      localStorage.setItem('aurapulse_pro_unlocked', 'true');
    } catch {
      // Ignored
    }
  };
  const [tagEditSong, setTagEditSong] = useState<Song | null>(null);
  const [playlistPickerSong, setPlaylistPickerSong] = useState<Song | null>(null);
  const [contextMenuState, setContextMenuState] = useState<{
    song: Song | null;
    position: { x: number; y: number } | null;
  }>({ song: null, position: null });

  // Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(() => songs[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(songs[0]?.duration || 180);
  const [queue, setQueue] = useState<Song[]>(() => songs);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isCasting, setIsCasting] = useState<boolean>(false);

  // Sleep Timer Seconds
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);

  // Audio elements & timers
  const timerIntervalRef = useRef<number | null>(null);
  const playheadIntervalRef = useRef<number | null>(null);

  // Group songs into folders dynamically
  const folders: FolderItem[] = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach((s) => {
      const folderName = s.folder || 'Music';
      if (!map.has(folderName)) {
        map.set(folderName, []);
      }
      map.get(folderName)!.push(s);
    });

    const list: FolderItem[] = [];
    map.forEach((fSongs, name) => {
      const samplePath = fSongs[0]?.filePath || `/storage/emulated/0/${name}`;
      const dirPath = samplePath.substring(0, samplePath.lastIndexOf('/')) || `/storage/emulated/0/${name}`;
      list.push({
        id: `folder-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        path: dirPath,
        songCount: fSongs.length,
        songs: fSongs,
      });
    });

    return list;
  }, [songs]);

  // Persist storage changes
  useEffect(() => {
    localStorage.setItem('aurapulse_songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('aurapulse_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('aurapulse_theme_id', theme.id);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('aurapulse_eq_preset', JSON.stringify(currentPreset));
  }, [currentPreset]);

  // Handle HTML Audio Element
  useEffect(() => {
    const audioEl = audioEngine.getAudioElement();
    if (!audioEl) return;

    const onTimeUpdate = () => {
      if (currentSong?.audioUrl) {
        setCurrentTime(audioEl.currentTime);
        setDuration(audioEl.duration || currentSong.duration);
      }
    };

    const onEnded = () => {
      handleTrackEnd();
    };

    audioEl.addEventListener('timeupdate', onTimeUpdate);
    audioEl.addEventListener('ended', onEnded);

    return () => {
      audioEl.removeEventListener('timeupdate', onTimeUpdate);
      audioEl.removeEventListener('ended', onEnded);
    };
  }, [currentSong, queue, repeatMode, isShuffle]);

  // Playback control effect
  useEffect(() => {
    if (isPlaying) {
      audioEngine.playTrack(
        currentSong?.audioUrl,
        currentTime,
        currentSong?.genre || 'EDM',
        currentSong?.id || 'song-1'
      );

      if (!currentSong?.audioUrl) {
        // Fallback smooth timer if offline audio file
        playheadIntervalRef.current = window.setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 1;
            if (currentSong && next >= (currentSong.duration || 180)) {
              handleTrackEnd();
              return 0;
            }
            return next;
          });
        }, 1000);
      }
    } else {
      audioEngine.pause();
      if (playheadIntervalRef.current) {
        clearInterval(playheadIntervalRef.current);
        playheadIntervalRef.current = null;
      }
    }

    return () => {
      if (playheadIntervalRef.current) {
        clearInterval(playheadIntervalRef.current);
      }
    };
  }, [isPlaying, currentSong]);

  // Sleep Timer Interval
  useEffect(() => {
    if (sleepTimerSeconds !== null && sleepTimerSeconds > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setSleepTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsPlaying(false);
            audioEngine.pause();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [sleepTimerSeconds]);

  // Track switching & controls
  const handlePlaySong = (song: Song, newQueue?: Song[]) => {
    audioEngine.resumeContext();
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    }
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 180);
    setIsPlaying(true);

    if (song.audioUrl) {
      audioEngine.playTrack(song.audioUrl, 0);
    }

    // Increase play count
    setSongs((prev) =>
      prev.map((s) => (s.id === song.id ? { ...s, playCount: (s.playCount || 0) + 1 } : s))
    );
  };

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioEngine.resumeContext();
    if (!currentSong && songs.length > 0) {
      handlePlaySong(songs[0]);
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      if (currentSong?.audioUrl) {
        audioEngine.playTrack(currentSong.audioUrl, currentTime);
      }
      setIsPlaying(true);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (queue.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      handlePlaySong(queue[randomIndex]);
      return;
    }
    const currentIdx = queue.findIndex((s) => s.id === currentSong?.id);
    const nextIdx = currentIdx + 1 < queue.length ? currentIdx + 1 : 0;
    handlePlaySong(queue[nextIdx]);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (queue.length === 0) return;
    if (currentTime > 4) {
      setCurrentTime(0);
      audioEngine.seek(0);
      return;
    }
    const currentIdx = queue.findIndex((s) => s.id === currentSong?.id);
    const prevIdx = currentIdx - 1 >= 0 ? currentIdx - 1 : queue.length - 1;
    handlePlaySong(queue[prevIdx]);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    audioEngine.seek(time);
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one' && currentSong) {
      setCurrentTime(0);
      audioEngine.seek(0);
      if (currentSong.audioUrl) {
        audioEngine.playTrack(currentSong.audioUrl, 0);
      }
    } else if (repeatMode === 'all' || isShuffle) {
      handleNext();
    } else {
      const currentIdx = queue.findIndex((s) => s.id === currentSong?.id);
      if (currentIdx + 1 < queue.length) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleToggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIdx]);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  // Android lock screen & notification controls (Next, Prev, Play, Pause, Artwork, Seekbar)
  useEffect(() => {
    setupMediaSession({
      currentSong,
      isPlaying,
      duration,
      currentTime,
      onPlay: () => {
        audioEngine.resumeContext();
        if (currentSong?.audioUrl) {
          audioEngine.playTrack(currentSong.audioUrl, currentTime);
        }
        setIsPlaying(true);
      },
      onPause: () => {
        audioEngine.pause();
        setIsPlaying(false);
      },
      onPrev: () => {
        handlePrev();
      },
      onNext: () => {
        handleNext();
      },
      onSeek: (time: number) => {
        handleSeek(time);
      },
    });
  }, [currentSong, isPlaying, duration, currentTime, queue, isShuffle]);

  const handleToggleFavorite = (songId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
    if (currentSong && currentSong.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleSetVolume = (vol: number) => {
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    audioEngine.setSpeed(speed);
  };

  const handleToggleCast = () => {
    setIsCasting(!isCasting);
  };

  // Folder Play / Shuffle
  const handlePlayFolder = (folder: FolderItem) => {
    if (folder.songs.length > 0) {
      handlePlaySong(folder.songs[0], folder.songs);
    }
  };

  const handleShuffleFolder = (folder: FolderItem) => {
    if (folder.songs.length > 0) {
      const shuffled = [...folder.songs].sort(() => Math.random() - 0.5);
      handlePlaySong(shuffled[0], shuffled);
    }
  };

  // Delete sample placeholder tracks as requested by user
  const handleRemoveSampleSongs = () => {
    const userOnly = songs.filter((s) => s.audioUrl || s.id.startsWith('user-track-'));
    if (userOnly.length > 0) {
      const cleaned = deduplicateSongs(userOnly);
      setSongs(cleaned);
      setQueue(cleaned);
      if (currentSong && !cleaned.some((s) => s.id === currentSong.id)) {
        handlePlaySong(cleaned[0], cleaned);
      }
    } else {
      setSongs([]);
      setQueue([]);
      setCurrentSong(null);
      setIsPlaying(false);
      audioEngine.pause();
    }
  };

  // Clean duplicates explicitly
  const handleCleanDuplicates = () => {
    const cleaned = deduplicateSongs(songs);
    setSongs(cleaned);
    setQueue(cleaned);
    if (currentSong) {
      const matched = cleaned.find((s) => s.id === currentSong.id) || cleaned[0] || null;
      setCurrentSong(matched);
    }
  };

  // Playlist handlers
  const handleCreatePlaylist = (name: string, description: string) => {
    const newPl: Playlist = {
      id: `custom-${Date.now()}`,
      name,
      description,
      songIds: [],
      createdAt: Date.now(),
      coverGradient: 'from-sky-600 via-indigo-700 to-slate-950',
    };
    setPlaylists([newPl, ...playlists]);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddSongToPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.songIds.includes(songId)
          ? { ...p, songIds: [...p.songIds, songId] }
          : p
      )
    );
  };

  const handleCreateAndAdd = (name: string, songId: string) => {
    const newPl: Playlist = {
      id: `custom-${Date.now()}`,
      name,
      songIds: [songId],
      createdAt: Date.now(),
      coverGradient: 'from-amber-600 via-rose-700 to-slate-950',
    };
    setPlaylists([newPl, ...playlists]);
  };

  // Queue Handlers
  const handlePlayNext = (song: Song) => {
    const currentIdx = queue.findIndex((s) => s.id === currentSong?.id);
    const newQueue = [...queue];
    newQueue.splice(currentIdx + 1, 0, song);
    setQueue(newQueue);
  };

  const handleAddToQueue = (song: Song) => {
    setQueue([...queue, song]);
  };

  const handleRemoveFromQueue = (index: number) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
  };

  const handleClearQueue = () => {
    if (currentSong) {
      setQueue([currentSong]);
    } else {
      setQueue([]);
    }
  };

  // Tag Saving
  const handleSaveTags = (updatedSong: Song) => {
    setSongs((prev) => prev.map((s) => (s.id === updatedSong.id ? updatedSong : s)));
    if (currentSong?.id === updatedSong.id) {
      setCurrentSong(updatedSong);
    }
    setQueue((prev) => prev.map((s) => (s.id === updatedSong.id ? updatedSong : s)));
  };

  // Song Context Menu
  const handleOpenSongMenu = (song: Song, e: React.MouseEvent) => {
    setContextMenuState({
      song,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleDeleteSong = (songId: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    setQueue((prev) => prev.filter((s) => s.id !== songId));
    if (currentSong?.id === songId) {
      handleNext();
    }
  };

  // Import local audio files with automatic deduplication
  const handleImportSongs = (newSongs: Song[]) => {
    const combined = deduplicateSongs([...newSongs, ...songs]);
    setSongs(combined);
    setQueue(combined);
    if (newSongs.length > 0) {
      handlePlaySong(newSongs[0], combined);
    }
  };

  const currentTrackIndex = useMemo(() => {
    return queue.findIndex((s) => s.id === currentSong?.id) || 0;
  }, [queue, currentSong]);

  return (
    <div
      className="min-h-screen w-full flex flex-col font-sans transition-colors duration-500 overflow-x-hidden relative selection:bg-emerald-500/30 selection:text-emerald-300"
      style={{
        backgroundColor: theme.bgDark,
        color: theme.textPrimary,
        '--accent-glow': theme.accentGlow,
      } as React.CSSProperties}
    >
      {/* Dynamic Frosted Ambient Mesh Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full blur-[140px] opacity-25 transition-all duration-1000"
          style={{ backgroundColor: theme.accent }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 transition-all duration-1000"
          style={{ backgroundColor: '#3b82f6' }}
        />
        <div
          className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15 transition-all duration-1000"
          style={{ backgroundColor: '#8b5cf6' }}
        />
      </div>

      {/* Top Navbar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenFileUpload={() => setIsFileUploadOpen(true)}
        theme={theme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCasting={isCasting}
        onToggleCast={handleToggleCast}
        isProUnlocked={isProUnlocked}
        onOpenProPayment={handleOpenProPayment}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full relative z-10">
        {currentTab === 'folders' && (
          <FoldersView
            folders={folders}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onPlayFolder={handlePlayFolder}
            onShuffleFolder={handleShuffleFolder}
            onOpenSongMenu={handleOpenSongMenu}
            onOpenFileUpload={() => setIsFileUploadOpen(true)}
            searchQuery={searchQuery}
            theme={theme}
          />
        )}

        {currentTab === 'songs' && (
          <SongsList
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onOpenSongMenu={handleOpenSongMenu}
            onRemoveSampleSongs={handleRemoveSampleSongs}
            onCleanDuplicates={handleCleanDuplicates}
            searchQuery={searchQuery}
            theme={theme}
          />
        )}

        {(currentTab === 'artists' || currentTab === 'albums') && (
          <ArtistsAlbumsView
            mode={currentTab}
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onOpenSongMenu={handleOpenSongMenu}
            theme={theme}
          />
        )}

        {currentTab === 'playlists' && (
          <PlaylistsView
            playlists={playlists}
            allSongs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onOpenSongMenu={handleOpenSongMenu}
            theme={theme}
          />
        )}
      </main>

      {/* Fixed Bottom Mini Player */}
      {currentSong && (
        <MiniPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrev={handlePrev}
          onOpenFullPlayer={() => setIsNowPlayingOpen(true)}
          theme={theme}
        />
      )}

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenTagEditor={() => setTagEditSong(currentSong || songs[0])}
        onOpenFileUpload={() => setIsFileUploadOpen(true)}
        onOpenQueue={() => setIsQueueOpen(true)}
        totalSongsCount={songs.length}
        theme={theme}
        isProUnlocked={isProUnlocked}
        onOpenProPayment={handleOpenProPayment}
      />

      {/* Fullscreen Now Playing Modal */}
      {currentSong && (
        <NowPlayingModal
          isOpen={isNowPlayingOpen}
          onClose={() => setIsNowPlayingOpen(false)}
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          repeatMode={repeatMode}
          isShuffle={isShuffle}
          playbackSpeed={playbackSpeed}
          volume={volume}
          trackIndex={currentTrackIndex}
          totalTracks={queue.length || songs.length}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrev={handlePrev}
          onSeek={handleSeek}
          onToggleRepeat={handleToggleRepeat}
          onToggleShuffle={handleToggleShuffle}
          onToggleFavorite={handleToggleFavorite}
          onSetSpeed={handleSetSpeed}
          onSetVolume={handleSetVolume}
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          onOpenTagEditor={(s) => setTagEditSong(s)}
          onOpenQueue={() => setIsQueueOpen(true)}
          onOpenPlaylistPicker={(s) => setPlaylistPickerSong(s)}
          isCasting={isCasting}
          onToggleCast={handleToggleCast}
          theme={theme}
          isProUnlocked={isProUnlocked}
          onOpenProPayment={handleOpenProPayment}
        />
      )}

      {/* Equalizer Modal */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        currentPreset={currentPreset}
        onSelectPreset={setCurrentPreset}
        theme={theme}
        isProUnlocked={isProUnlocked}
        onOpenProPayment={handleOpenProPayment}
      />

      {/* AuraPulse PRO Payment Modal */}
      <ProPaymentModal
        isOpen={isProPaymentOpen}
        onClose={() => setIsProPaymentOpen(false)}
        isProUnlocked={isProUnlocked}
        onUnlockPro={handleUnlockPro}
        theme={theme}
        featureTrigger={proFeatureTrigger}
      />

      {/* Theme Studio Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        timerMinutesRemaining={sleepTimerSeconds !== null ? sleepTimerSeconds / 60 : null}
        onStartTimer={(mins) => setSleepTimerSeconds(mins * 60)}
        onCancelTimer={() => setSleepTimerSeconds(null)}
        theme={theme}
      />

      {/* Tag Editor Modal */}
      <TagEditorModal
        isOpen={tagEditSong !== null}
        onClose={() => setTagEditSong(null)}
        song={tagEditSong}
        onSaveTags={handleSaveTags}
        theme={theme}
      />

      {/* Queue Modal */}
      <QueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlaySong={handlePlaySong}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        theme={theme}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onImportSongs={handleImportSongs}
        theme={theme}
      />

      {/* Song Context Menu */}
      <SongContextMenu
        song={contextMenuState.song}
        position={contextMenuState.position}
        onClose={() => setContextMenuState({ song: null, position: null })}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
        onAddToPlaylist={(s) => setPlaylistPickerSong(s)}
        onToggleFavorite={handleToggleFavorite}
        onEditTags={(s) => setTagEditSong(s)}
        onDeleteSong={handleDeleteSong}
        theme={theme}
      />

      {/* Playlist Picker Modal */}
      <PlaylistPickerModal
        isOpen={playlistPickerSong !== null}
        onClose={() => setPlaylistPickerSong(null)}
        song={playlistPickerSong}
        playlists={playlists}
        onAddSongToPlaylist={handleAddSongToPlaylist}
        onCreateAndAdd={handleCreateAndAdd}
        theme={theme}
      />
    </div>
  );
}
