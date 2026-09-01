import { Song } from '../types';

export function setupMediaSession(params: {
  currentSong: Song | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
}) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

  const { currentSong, isPlaying, duration, currentTime, onPlay, onPause, onPrev, onNext, onSeek } = params;

  if (!currentSong) {
    try {
      navigator.mediaSession.playbackState = 'none';
    } catch {
      // Ignored
    }
    return;
  }

  // 1. Explicitly update playback state
  try {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  } catch {
    // Ignored
  }

  // 2. Register Artwork with absolute URLs (Required by Android Notification System)
  const origin = window.location.origin || '';
  const artwork: MediaImage[] = [
    { src: `${origin}/favicon.svg`, sizes: '512x512', type: 'image/svg+xml' },
    { src: `${origin}/icon.svg`, sizes: '512x512', type: 'image/svg+xml' },
  ];

  if (currentSong.coverArt) {
    const fullCover = currentSong.coverArt.startsWith('http')
      ? currentSong.coverArt
      : `${origin}${currentSong.coverArt.startsWith('/') ? '' : '/'}${currentSong.coverArt}`;
    artwork.unshift({
      src: fullCover,
      sizes: '512x512',
      type: 'image/png',
    });
  }

  // 3. Register Metadata with pure string values
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title || 'AuraPulse Music',
      artist: currentSong.artist || 'AuraPulse Audio',
      album: currentSong.album || 'AuraPulse Library',
      artwork: artwork,
    });
  } catch (err) {
    console.warn('MediaMetadata error:', err);
  }

  // 4. Update position state for Android notification seekbar
  try {
    if ('setPositionState' in navigator.mediaSession && duration > 0) {
      navigator.mediaSession.setPositionState({
        duration: Math.max(1, duration),
        playbackRate: isPlaying ? 1.0 : 0.0,
        position: Math.max(0, Math.min(duration, currentTime)),
      });
    }
  } catch {
    // Ignored
  }

  // 5. Action Handlers for Lock screen & Notification Next, Prev, Play, Pause, Seek
  const safeRegisterHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Action not supported on this platform
    }
  };

  safeRegisterHandler('play', onPlay);
  safeRegisterHandler('pause', onPause);
  safeRegisterHandler('previoustrack', onPrev);
  safeRegisterHandler('nexttrack', onNext);
  safeRegisterHandler('seekto', (details) => {
    if (details.seekTime !== undefined && details.seekTime !== null) {
      onSeek(details.seekTime);
    }
  });
  safeRegisterHandler('seekbackward', (details) => {
    const skipTime = details.seekOffset || 10;
    onSeek(Math.max(0, currentTime - skipTime));
  });
  safeRegisterHandler('seekforward', (details) => {
    const skipTime = details.seekOffset || 10;
    onSeek(Math.min(duration, currentTime + skipTime));
  });
  safeRegisterHandler('stop', onPause);
}
