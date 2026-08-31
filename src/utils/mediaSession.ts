import { Song } from '../types';
import appIconImg from '../assets/images/aurapulse_app_icon_1788092851435.jpg';

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
  if (!('mediaSession' in navigator)) return;

  const { currentSong, isPlaying, duration, currentTime, onPlay, onPause, onPrev, onNext, onSeek } = params;

  if (!currentSong) {
    navigator.mediaSession.playbackState = 'none';
    return;
  }

  // 1. Set playback state
  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

  // 2. Register Artwork with absolute URLs and bundled icons
  const artwork = [
    { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
    { src: appIconImg, sizes: '512x512', type: 'image/jpeg' },
  ];

  if (currentSong.coverArt && currentSong.coverArt.startsWith('http')) {
    artwork.unshift({
      src: currentSong.coverArt,
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

  // 4. Update position state
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

  // 5. Action Handlers for Lock screen & Notification Next, Prev, Play, Pause
  try {
    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('previoustrack', onPrev);
    navigator.mediaSession.setActionHandler('nexttrack', onNext);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && details.seekTime !== null) {
        onSeek(details.seekTime);
      }
    });
  } catch (e) {
    console.warn('Error setting MediaSession handlers:', e);
  }
}
