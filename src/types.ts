export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  folder: string;
  filePath: string;
  coverArt?: string;
  coverGradient?: string;
  format: string; // e.g. "44.1kHz AAC", "FLAC 24-bit 96kHz", "MP3 320kbps"
  bitrate?: string;
  year?: number;
  genre?: string;
  lyrics?: string;
  audioUrl?: string;
  isFavorite?: boolean;
  playCount?: number;
  dateAdded: number;
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  songCount: number;
  songs: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverGradient?: string;
  songIds: string[];
  createdAt: number;
}

export type VisualizerMode =
  | 'winamp-classic' // 1. Classic Winamp Segmented Gold/Fire Spectrum (Image 1)
  | 'hifi-vumeter'    // 2. Pioneer / Hi-Fi 3-Zone Green-Yellow-Red VU Rack (Image 2)
  | 'dense-fire'     // 3. Dense Fiery Flame Visualizer with floating dots (Image 3)
  | 'rainbow-matrix' // 4. Multi-color Rainbow LED Matrix with Floor Reflection (Image 4)
  | 'spectrum'       // Modern Sleek Spectrum
  | 'wave-glow';     // Silky Wave Line

export type RepeatMode = 'off' | 'all' | 'one';

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz in dB (-15 to +15)
  bassBoost?: number; // 0 to 100
  trebleBoost?: number; // 0 to 100
  virtualizer?: number; // 0 to 100
  reverb?: 'none' | 'room' | 'hall' | 'plate' | 'studio' | 'cathedral';
}

export interface ThemeConfig {
  id: string;
  name: string;
  bgDark: string;
  surfaceDark: string;
  surfaceHighlight: string;
  accent: string;
  accentGlow: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  accentColorName: string;
}
