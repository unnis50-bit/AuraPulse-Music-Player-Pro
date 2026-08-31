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

export const INITIAL_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'REYVI - Miss you My love (Original Mix)',
    artist: 'REYVI & Daksha',
    album: 'Movie Soundtrack Vol. 1',
    duration: 372,
    folder: 'Movie',
    filePath: '/storage/emulated/0/Movie/REYVI_Miss_You_My_Love.aac',
    format: '44.1kHz AAC',
    bitrate: '320 kbps',
    year: 2024,
    genre: 'Synthpop / Melodic',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverGradient: 'from-amber-600 via-rose-700 to-indigo-900',
    lyrics: `[00:00.00] (Instrumental intro with synth pads)
[00:15.00] Miss you tonight... under neon skies
[00:23.00] Holding on to memories that never die
[00:35.00] Every beat echoing inside my chest
[00:48.00] When the rhythm falls, you are my quiet rest
[01:05.00] (Drop - Electric Bass & Arpeggio)
[01:25.00] Miss you my love...
[01:38.00] Through the rain and through the night
[01:50.00] Until the morning brings the light`,
    isFavorite: true,
    playCount: 42,
    dateAdded: Date.now() - 86400000 * 2,
  },
  {
    id: 'song-2',
    title: 'Thaalam Trip (Instrumental & Flute)',
    artist: 'Daksha Music Studio',
    album: 'Kerala Chill Beats',
    duration: 423,
    folder: 'Music',
    filePath: '/storage/emulated/0/Music/Thaalam_Trip_Instrumental.mp3',
    format: 'FLAC 24-bit 96kHz',
    bitrate: '1411 kbps',
    year: 2025,
    genre: 'Fusion Instrumental',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    lyrics: `[00:00.00] (Acoustic Mridangam & Bamboo Flute Solo)
[00:30.00] (Deep sub-bass groove begins)
[01:10.00] (Harmonic synth melody interlude)
[01:45.00] (Accelerating rhythmic crescendo)
[02:10.00] (Serene fade out)`,
    isFavorite: true,
    playCount: 38,
    dateAdded: Date.now() - 86400000 * 4,
  },
  {
    id: 'song-3',
    title: 'Rakkaviletho Kulirkkattu Pole _ EDM Remix',
    artist: 'Arun & DJ Shaan',
    album: 'Club Malayalam Classics',
    duration: 346,
    folder: 'Download',
    filePath: '/storage/emulated/0/Download/Rakkaviletho_EDM_Remix.mp3',
    format: '44.1kHz AAC',
    bitrate: '320 kbps',
    year: 2024,
    genre: 'EDM / Dance',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverGradient: 'from-purple-600 via-pink-600 to-indigo-950',
    lyrics: `[00:00.00] Rakkaviletho kulirkkattu pole...
[00:20.00] En manassil oru pookkalam
[00:45.00] (EDM Synth Build-up)
[01:00.00] Hey! Turn the bass up!
[01:15.00] (Festival drop with club drums)`,
    isFavorite: false,
    playCount: 19,
    dateAdded: Date.now() - 86400000 * 6,
  },
  {
    id: 'song-4',
    title: 'Theerathe Neelunne - Electro Carnatic',
    artist: 'Harish Sivaramakrishnan',
    album: 'Agam Vibes',
    duration: 302,
    folder: 'Music',
    filePath: '/storage/emulated/0/Music/Theerathe_Neelunne.flac',
    format: 'FLAC 24-bit 48kHz',
    bitrate: '980 kbps',
    year: 2024,
    genre: 'Carnatic Rock',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverGradient: 'from-orange-600 via-red-700 to-zinc-900',
    lyrics: `[00:00.00] Theerathe neelunne ee raave...
[00:25.00] Ormakal peyyum oru mazhayil
[00:50.00] Njan engo thedunnu nin ninaavukal
[01:20.00] (Heavy Guitar & Violin Swaras)
[02:00.00] Sa Ni Dha Pa Ma Ga Ri Sa...`,
    isFavorite: true,
    playCount: 56,
    dateAdded: Date.now() - 86400000 * 7,
  },
  {
    id: 'song-5',
    title: 'Bum Baa Diga Diga - Music Video',
    artist: 'Malayalam Hip-Hop Collective',
    album: 'Street Anthem 2024',
    duration: 423,
    folder: 'Movie',
    filePath: '/storage/emulated/0/Movie/Bum_Baa_Diga_Diga.mp3',
    format: '44.1kHz MP3',
    bitrate: '320 kbps',
    year: 2023,
    genre: 'Desi Hip-Hop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverGradient: 'from-yellow-500 via-amber-700 to-black',
    lyrics: `[00:00.00] Mic check 1, 2!
[00:10.00] Bum Baa Diga Diga taalathil
[00:22.00] Oadi nadakkana kochi townil
[00:40.00] Flow straight from the soul!`,
    isFavorite: false,
    playCount: 14,
    dateAdded: Date.now() - 86400000 * 9,
  },
  {
    id: 'song-6',
    title: 'Raga of Revenge (From _DC_ OST)',
    artist: 'Jakes Bejoy',
    album: 'Original Score',
    duration: 382,
    folder: 'AudioCutter',
    filePath: '/storage/emulated/0/Music/Mp3Cutter/Raga_of_Revenge.aac',
    format: '48kHz AAC',
    bitrate: '256 kbps',
    year: 2024,
    genre: 'Cinematic / Orchestral',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverGradient: 'from-red-800 via-zinc-900 to-black',
    lyrics: `[00:00.00] (Dark Strings & Epic Brass crescendo)
[00:45.00] (Intense war drums)
[01:20.00] (Choral chant reverberation)`,
    isFavorite: true,
    playCount: 27,
    dateAdded: Date.now() - 86400000 * 10,
  },
  {
    id: 'song-7',
    title: 'Kalakalam Kaayalolangal _ Full Romantic',
    artist: 'Vineeth Sreenivasan & KS Harisankar',
    album: 'Backwater Serenade',
    duration: 521,
    folder: 'Music',
    filePath: '/storage/emulated/0/Music/Kalakalam_Kaayalolangal.flac',
    format: 'FLAC 24-bit 96kHz',
    bitrate: '1520 kbps',
    year: 2024,
    genre: 'Malayalam Melody',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverGradient: 'from-blue-600 via-cyan-700 to-slate-900',
    lyrics: `[00:00.00] Kalakalam kaayalolangal paadunnu
[00:20.00] Kulirkatte nee en arikil varoo
[00:45.00] Sneham choriyum oru sandhyayil
[01:10.00] Nin mizhikalil oru kadal kandu njan`,
    isFavorite: true,
    playCount: 65,
    dateAdded: Date.now() - 86400000 * 12,
  },
  {
    id: 'song-8',
    title: 'Labon Ko (Female Lo-Fi Acoustic Version)',
    artist: 'Pritam & Shirley S.',
    album: 'Acoustic Sessions Unplugged',
    duration: 412,
    folder: 'Download',
    filePath: '/storage/emulated/0/Download/Labon_Ko_Lofi.mp3',
    format: '44.1kHz MP3',
    bitrate: '320 kbps',
    year: 2023,
    genre: 'Lo-Fi Chill / Acoustic',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverGradient: 'from-rose-500 via-pink-700 to-purple-950',
    lyrics: `[00:00.00] (Gentle fingerstyle acoustic guitar)
[00:15.00] Labon ko labon pe sajao
[00:30.00] Kya ho tum mujhe ab batao
[00:50.00] Tod do khud ko tum baahon mein meri
[01:15.00] Baahon mein meri...`,
    isFavorite: false,
    playCount: 22,
    dateAdded: Date.now() - 86400000 * 14,
  },
  {
    id: 'song-9',
    title: 'GUMNAAM HAI KOI _ Horror Trap Remix',
    artist: 'Bass Cannons',
    album: 'Midnight Drops Vol. 4',
    duration: 350,
    folder: 'Music',
    filePath: '/storage/emulated/0/Music/Gumnaam_Hai_Koi_Trap.mp3',
    format: '44.1kHz AAC',
    bitrate: '320 kbps',
    year: 2024,
    genre: 'Trap / Dark EDM',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    coverGradient: 'from-violet-700 via-slate-900 to-black',
    lyrics: `[00:00.00] Gumnaam hai koi... badnaam hai koi...
[00:25.00] Kis kisko hum royein...
[00:40.00] (808 Sub-Bass Distortion Drop)
[01:10.00] Trap siren & hi-hat rolls`,
    isFavorite: false,
    playCount: 17,
    dateAdded: Date.now() - 86400000 * 15,
  },
  {
    id: 'song-10',
    title: 'Nilaave (Official Cinematic Track)',
    artist: 'Daksha Records',
    album: 'Cinematic Expressions',
    duration: 390,
    folder: 'Movie',
    filePath: '/storage/emulated/0/Movie/Nilaave_Cinematic.flac',
    format: 'FLAC 24-bit 96kHz',
    bitrate: '1350 kbps',
    year: 2025,
    genre: 'Soundtrack / Ambient',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    coverGradient: 'from-teal-600 via-cyan-800 to-slate-950',
    lyrics: `[00:00.00] Nilaave... maayalle nee...
[00:30.00] Ee vazhiyil oru kaattu njan
[01:00.00] Pularoli kanum vare
[01:30.00] Koodeyunde en nizhal pole`,
    isFavorite: true,
    playCount: 49,
    dateAdded: Date.now() - 86400000 * 18,
  },
  {
    id: 'song-11',
    title: 'Vanthu Paaraayo (ഒരു മുറൈ വന്തു പാരായൊ)',
    artist: 'Chitra K.S. & Daksha Band',
    album: 'Evergreen Remastered',
    duration: 440,
    folder: 'Music',
    filePath: '/storage/emulated/0/Music/Vanthu_Paaraayo_Remaster.flac',
    format: 'FLAC 24-bit 192kHz',
    bitrate: '2200 kbps',
    year: 2025,
    genre: 'Classical Remaster',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
    coverGradient: 'from-amber-700 via-orange-800 to-stone-950',
    lyrics: `[00:00.00] Oru murai vanthu paaraayo...
[00:25.00] En manam aake nin ninaavukal
[00:50.00] Thirayadikkum oru kadal pole
[01:20.00] Varumo en kaanthan nee...`,
    isFavorite: true,
    playCount: 88,
    dateAdded: Date.now() - 86400000 * 20,
  }
];

export const INITIAL_FOLDERS: FolderItem[] = [
  {
    id: 'folder-movie',
    name: 'Movie',
    path: '/storage/emulated/0/Movie',
    songCount: 26,
    songs: INITIAL_SONGS.filter(s => s.folder === 'Movie'),
  },
  {
    id: 'folder-music',
    name: 'Music',
    path: '/storage/emulated/0/Music',
    songCount: 96,
    songs: INITIAL_SONGS.filter(s => s.folder === 'Music'),
  },
  {
    id: 'folder-download',
    name: 'Download',
    path: '/storage/emulated/0/Download',
    songCount: 4,
    songs: INITIAL_SONGS.filter(s => s.folder === 'Download'),
  },
  {
    id: 'folder-audiocutter',
    name: 'AudioCutter',
    path: '/storage/emulated/0/Music/Mp3Cutter',
    songCount: 1,
    songs: INITIAL_SONGS.filter(s => s.folder === 'AudioCutter'),
  },
  {
    id: 'folder-musicolet',
    name: 'Musicolet',
    path: '/storage/emulated/0/Ringtones',
    songCount: 1,
    songs: INITIAL_SONGS.slice(0, 1),
  },
  {
    id: 'folder-browser',
    name: 'Browser',
    path: '/storage/emulated/0/Download',
    songCount: 1,
    songs: INITIAL_SONGS.slice(2, 3),
  },
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    name: 'Favorites ❤️',
    description: 'Your top loved tracks and high-rotation melodies',
    coverGradient: 'from-rose-600 via-pink-700 to-purple-900',
    songIds: ['song-1', 'song-2', 'song-4', 'song-7', 'song-10', 'song-11'],
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'pl-late-night',
    name: 'Late Night Chill 🌙',
    description: 'Atmospheric lo-fi, synthwave & calm acoustics',
    coverGradient: 'from-indigo-600 via-violet-800 to-slate-950',
    songIds: ['song-1', 'song-2', 'song-8', 'song-10'],
    createdAt: Date.now() - 86400000 * 8,
  },
  {
    id: 'pl-malayalam-vibes',
    name: 'Malayalam Hi-Fi Masterpieces',
    description: 'Pristine 24-bit audiophile classical & fusion tracks',
    coverGradient: 'from-emerald-600 via-teal-800 to-zinc-950',
    songIds: ['song-2', 'song-4', 'song-7', 'song-11'],
    createdAt: Date.now() - 86400000 * 3,
  },
];
