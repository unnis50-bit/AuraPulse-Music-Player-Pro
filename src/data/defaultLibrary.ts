import { Song, FolderItem, Playlist, EqualizerPreset, ThemeConfig } from '../types';

export const DEFAULT_THEMES: ThemeConfig[] = [
  {
    id: 'emerald-aura',
    name: 'Emerald Pulsar (Default)',
    bgDark: '#0f1412',
    surfaceDark: '#171f1b',
    surfaceHighlight: '#222e28',
    accent: '#10b981', // emerald-500
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    textPrimary: '#f3f4f6',
    textSecondary: '#9ca3af',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    accentColorName: 'Emerald Green',
  },
  {
    id: 'onyx-black',
    name: 'Onyx AMOLED Pure',
    bgDark: '#090a0c',
    surfaceDark: '#121417',
    surfaceHighlight: '#1d2127',
    accent: '#38bdf8', // sky-400
    accentGlow: 'rgba(56, 189, 248, 0.4)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    accentColorName: 'Sky Blue',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Gold & Amber',
    bgDark: '#140f0c',
    surfaceDark: '#201813',
    surfaceHighlight: '#2e221b',
    accent: '#f59e0b', // amber-500
    accentGlow: 'rgba(245, 158, 11, 0.4)',
    textPrimary: '#fffbeb',
    textSecondary: '#d97706',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    accentColorName: 'Warm Amber',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon Wave',
    bgDark: '#0e0b16',
    surfaceDark: '#1a1329',
    surfaceHighlight: '#2b1e42',
    accent: '#ec4899', // pink-500
    accentGlow: 'rgba(236, 72, 153, 0.4)',
    textPrimary: '#fdf2f8',
    textSecondary: '#c084fc',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    accentColorName: 'Neon Pink',
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Deep Slate',
    bgDark: '#0b1118',
    surfaceDark: '#131e2b',
    surfaceHighlight: '#1d2d3f',
    accent: '#06b6d4', // cyan-500
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    textPrimary: '#ecfeff',
    textSecondary: '#7dd3fc',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    accentColorName: 'Nordic Cyan',
  },
];

export const DEFAULT_EQ_PRESETS: EqualizerPreset[] = [
  { id: 'normal', name: 'Normal', gains: [0, 0, 0, 0, 0], bassBoost: 0, trebleBoost: 0, virtualizer: 0, reverb: 'none' },
  { id: 'bass-boost', name: 'Bass Boost', gains: [7, 5, 0, 1, 2], bassBoost: 70, trebleBoost: 15, virtualizer: 20, reverb: 'room' },
  { id: 'treble-boost', name: 'Treble Boost', gains: [-1, 0, 2, 6, 9], bassBoost: 10, trebleBoost: 75, virtualizer: 30, reverb: 'studio' },
  { id: 'pop', name: 'Pop', gains: [-1, 2, 5, 3, -1], bassBoost: 25, trebleBoost: 30, virtualizer: 15, reverb: 'none' },
  { id: 'rock', name: 'Rock', gains: [5, 3, -1, 2, 6], bassBoost: 45, trebleBoost: 50, virtualizer: 30, reverb: 'hall' },
  { id: 'heavy-metal', name: 'Heavy Metal', gains: [4, 1, 9, 3, 0], bassBoost: 55, trebleBoost: 40, virtualizer: 35, reverb: 'hall' },
  { id: 'jazz', name: 'Jazz', gains: [3, 2, -2, 2, 4], bassBoost: 20, trebleBoost: 35, virtualizer: 40, reverb: 'studio' },
  { id: 'classical', name: 'Classical', gains: [4, 3, -2, 3, 4], bassBoost: 10, trebleBoost: 45, virtualizer: 50, reverb: 'cathedral' },
  { id: 'hip-hop', name: 'Hip Hop', gains: [7, 4, 1, 2, 3], bassBoost: 75, trebleBoost: 25, virtualizer: 25, reverb: 'room' },
  { id: 'vocal', name: 'Vocal Booster', gains: [-2, 1, 6, 4, 1], bassBoost: 10, trebleBoost: 60, virtualizer: 20, reverb: 'studio' },
  { id: 'electronic', name: 'Electronic / EDM', gains: [6, 4, 0, 3, 5], bassBoost: 70, trebleBoost: 55, virtualizer: 45, reverb: 'plate' },
];

// Clean empty start - No sample songs or mock folders
export const INITIAL_SONGS: Song[] = [];
export const sampleSongs: Song[] = [];

export const INITIAL_FOLDERS: FolderItem[] = [];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    name: 'Favorites ❤️',
    description: 'Your favorite tracks',
    coverGradient: 'from-rose-600 via-pink-700 to-purple-900',
    songIds: [],
    createdAt: Date.now(),
  },
];
