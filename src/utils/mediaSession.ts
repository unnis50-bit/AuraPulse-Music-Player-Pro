import { Song } from '../types';

// Fallback high-contrast PNG icon generator using HTML Canvas (Ensures Android NotificationCompat renders the icon without failing on SVG)
function createIconDataUrl(title: string, artist: string, accentColor = '#10b981'): string {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Dark sleek background
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#042f2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Accent circular glow
    const radial = ctx.createRadialGradient(256, 256, 20, 256, 256, 220);
    radial.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 512, 512);

    // Equalizer bars
    const bars = [90, 160, 220, 270, 240, 180, 130, 70];
    const colors = ['#10b981', '#10b981', '#38bdf8', '#f59e0b', '#f59e0b', '#38bdf8', '#10b981', '#10b981'];
    bars.forEach((height, i) => {
      ctx.fillStyle = colors[i];
      const x = 90 + i * 44;
      const y = 360 - height;
      ctx.beginPath();
      ctx.roundRect(x, y, 28, height, 14);
      ctx.fill();
    });

    // Subtitle text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AuraPulse Music', 256, 430);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

let cachedArtworkDataUrl: string | null = null;

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

  // 2. Register Artwork with PNG formats (Required by Android System Notifications)
  if (!cachedArtworkDataUrl) {
    cachedArtworkDataUrl = createIconDataUrl(currentSong.title, currentSong.artist);
  }

  const artwork: MediaImage[] = [];

  if (currentSong.coverArt && currentSong.coverArt.startsWith('http')) {
    artwork.push({
      src: currentSong.coverArt,
      sizes: '512x512',
      type: 'image/png',
    });
  }

  if (cachedArtworkDataUrl) {
    artwork.push({
      src: cachedArtworkDataUrl,
      sizes: '512x512',
      type: 'image/png',
    });
  }

  // 3. Register Metadata with clean strings
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title || 'AuraPulse Music',
      artist: currentSong.artist || 'AuraPulse Audio',
      album: currentSong.album || currentSong.folder || 'AuraPulse Library',
      artwork: artwork.length > 0 ? artwork : undefined,
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

