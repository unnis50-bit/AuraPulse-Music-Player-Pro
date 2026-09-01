import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Play,
  Pause,
  Plus,
  Check,
  Music,
  Flame,
  Radio,
  Sparkles,
  Download,
  X,
  Headphones,
} from 'lucide-react';
import { Song, ThemeConfig } from '../types';

interface OnlineSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySong: (song: Song) => void;
  onAddSongToLibrary: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  theme: ThemeConfig;
  existingSongIds: Set<string>;
}

// Curated high quality open streaming music catalog with Indian, Malayalam, LoFi, EDM, and Chill genres
export const ONLINE_STREAM_CATALOG: Song[] = [
  {
    id: 'online-stream-1',
    title: 'Kalyana Kacheri - Festive Kerala Beats (Instrumental)',
    artist: 'AuraPulse Studio South',
    album: 'Festival Beats 2025',
    duration: 384,
    folder: 'Online Stream',
    filePath: '/online/kalyana_kacheri.mp3',
    format: '320kbps MP3',
    bitrate: '320 kbps',
    year: 2025,
    genre: 'Malayalam / Indian Fusion',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverGradient: 'from-amber-500 via-rose-600 to-indigo-950',
    lyrics: `[00:00.00] (Chenda Melam & Nadaswaram Fusion Intro)\n[00:40.00] (Heavy bass drop with electronic synths)\n[01:30.00] (Kochi street groove rhythm)`,
    dateAdded: Date.now() - 10000,
    isFavorite: true,
    playCount: 154,
  },
  {
    id: 'online-stream-2',
    title: 'Monsoon Chill - Rain & LoFi Keys (Night Drive)',
    artist: 'Kerala LoFi Project',
    album: 'Wayanad Rain Tapes',
    duration: 412,
    folder: 'Online Stream',
    filePath: '/online/monsoon_chill.mp3',
    format: 'FLAC 24-bit',
    bitrate: '1411 kbps',
    year: 2025,
    genre: 'LoFi / Ambient',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverGradient: 'from-teal-600 via-emerald-800 to-slate-950',
    lyrics: `[00:00.00] (Gentle rain texture & Rhodes chords)\n[00:45.00] (Warm sub-bass & vinyl crackle)`,
    dateAdded: Date.now() - 20000,
    isFavorite: true,
    playCount: 98,
  },
  {
    id: 'online-stream-3',
    title: 'Aalapam - Electro Classical Violin & Mridangam',
    artist: 'Haridas & Daksha Collective',
    album: 'Ragas in Cyberpunk',
    duration: 340,
    folder: 'Online Stream',
    filePath: '/online/aalapam_electro.mp3',
    format: '44.1kHz AAC',
    bitrate: '320 kbps',
    year: 2024,
    genre: 'Carnatic Electronic',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverGradient: 'from-purple-600 via-violet-800 to-black',
    lyrics: `[00:00.00] (Charukesi Raga Violin Improvisation)\n[00:50.00] (808 Bass & Glitch Arp)`,
    dateAdded: Date.now() - 30000,
    isFavorite: false,
    playCount: 76,
  },
  {
    id: 'online-stream-4',
    title: 'Midnight Kozhikode - Desi Hip-Hop Groove',
    artist: 'Malabar Cypher Crew',
    album: 'Street Life KL-11',
    duration: 295,
    folder: 'Online Stream',
    filePath: '/online/midnight_kozhikode.mp3',
    format: '320kbps MP3',
    bitrate: '320 kbps',
    year: 2024,
    genre: 'Desi Hip-Hop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverGradient: 'from-red-600 via-amber-700 to-zinc-950',
    lyrics: `[00:00.00] Yo! Beach road sound check!\n[00:20.00] Deep groove rolling through the night`,
    dateAdded: Date.now() - 40000,
    isFavorite: true,
    playCount: 112,
  },
  {
    id: 'online-stream-5',
    title: 'Neon Beach EDM Festival Anthem 2025',
    artist: 'DJ Shaan & Lost Frequencies Club',
    album: 'Goa Neon Sessions',
    duration: 430,
    folder: 'Online Stream',
    filePath: '/online/neon_beach.mp3',
    format: '48kHz AAC',
    bitrate: '320 kbps',
    year: 2025,
    genre: 'EDM / Dance',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverGradient: 'from-cyan-500 via-blue-600 to-purple-950',
    lyrics: `[00:00.00] 3, 2, 1... Jump!\n[01:00.00] (Heavy Mainstage Festival Drop)`,
    dateAdded: Date.now() - 50000,
    isFavorite: false,
    playCount: 180,
  },
  {
    id: 'online-stream-6',
    title: 'Nila Nadhikarayil - Soulful Flute Melody',
    artist: 'Pandit Rajesh Varma',
    album: 'Rivers of Kerala',
    duration: 480,
    folder: 'Online Stream',
    filePath: '/online/nila_flute.mp3',
    format: 'FLAC 24-bit',
    bitrate: '1500 kbps',
    year: 2024,
    genre: 'Acoustic / Flute',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverGradient: 'from-blue-600 via-sky-700 to-slate-900',
    lyrics: `[00:00.00] (Solo Bamboo Flute echo over river waves)`,
    dateAdded: Date.now() - 60000,
    isFavorite: true,
    playCount: 64,
  },
  {
    id: 'online-stream-7',
    title: 'Sunset Boulevard - Retro Synthwave & Saxophone',
    artist: 'Neon Mirage',
    album: '80s Drive Nights',
    duration: 365,
    folder: 'Online Stream',
    filePath: '/online/synthwave_sunset.mp3',
    format: '320kbps MP3',
    bitrate: '320 kbps',
    year: 2024,
    genre: 'Synthwave',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverGradient: 'from-pink-500 via-fuchsia-700 to-purple-950',
    lyrics: `[00:00.00] (Analog Synthesizer Chords & Midnight Saxophone)`,
    dateAdded: Date.now() - 70000,
    isFavorite: false,
    playCount: 88,
  },
  {
    id: 'online-stream-8',
    title: 'Arabic Trap & Malayalam Bass Boost (Drift Edit)',
    artist: 'DJ Anoop & Gulf Club Edit',
    album: 'Dubai Drift Beats',
    duration: 310,
    folder: 'Online Stream',
    filePath: '/online/arabic_trap.mp3',
    format: '44.1kHz MP3',
    bitrate: '320 kbps',
    year: 2025,
    genre: 'Bass Boosted / Trap',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    coverGradient: 'from-emerald-500 via-amber-600 to-black',
    lyrics: `[00:00.00] (Oud Melody & Massive 808 Sub-bass)`,
    dateAdded: Date.now() - 80000,
    isFavorite: true,
    playCount: 142,
  },
];

export const OnlineSearchModal: React.FC<OnlineSearchModalProps> = ({
  isOpen,
  onClose,
  onPlaySong,
  onAddSongToLibrary,
  currentSong,
  isPlaying,
  theme,
  existingSongIds,
}) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const genres = ['All', 'Malayalam / Indian Fusion', 'LoFi / Ambient', 'EDM / Dance', 'Desi Hip-Hop', 'Acoustic / Flute', 'Bass Boosted / Trap', 'Synthwave'];

  const filteredSongs = useMemo(() => {
    return ONLINE_STREAM_CATALOG.filter((song) => {
      const matchQuery =
        !query.trim() ||
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.genre?.toLowerCase().includes(query.toLowerCase()) ||
        song.album?.toLowerCase().includes(query.toLowerCase());

      const matchGenre = selectedGenre === 'All' || song.genre === selectedGenre;
      return matchQuery && matchGenre;
    });
  }, [query, selectedGenre]);

  if (!isOpen) return null;

  const handleAdd = (song: Song) => {
    onAddSongToLibrary(song);
    setAddedIds((prev) => new Set(prev).add(song.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl border border-white/15 overflow-hidden flex flex-col shadow-2xl"
        style={{ backgroundColor: theme.surfaceDark }}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Search & Stream Online Music</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Free
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Stream or add songs directly to your offline player library</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 border-b border-white/5 space-y-3 bg-black/20">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 shadow-inner focus-within:border-emerald-500/50 transition-colors">
            <Search className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, Malayalam beats, LoFi, EDM..."
              className="bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none w-full"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-neutral-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Genre Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all ${
                  selectedGenre === g
                    ? 'bg-emerald-500 text-white font-bold shadow-md'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                }`}
                style={selectedGenre === g ? { backgroundColor: theme.accent } : {}}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredSongs.map((song) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            const isAlreadyAdded = existingSongIds.has(song.id) || addedIds.has(song.id);

            return (
              <div
                key={song.id}
                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isThisPlaying
                    ? 'border-emerald-500/50 bg-emerald-500/15'
                    : 'border-white/5 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br ${
                      song.coverGradient || 'from-indigo-600 to-purple-800'
                    }`}
                  >
                    {isThisPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.2s]" />
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.4s]" />
                      </div>
                    ) : (
                      <Music className="w-5 h-5 text-white/90" />
                    )}
                  </div>

                  <div className="min-w-0 pr-2">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isThisPlaying ? 'text-emerald-400' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="truncate">{song.artist}</span>
                      <span>•</span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <span>•</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-neutral-300">
                        {song.genre}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Play / Pause Stream Button */}
                  <button
                    onClick={() => onPlaySong(song)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white text-emerald-400 transition-all shadow-sm"
                    title="Play stream"
                  >
                    {isThisPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  {/* Add to Library Button */}
                  <button
                    onClick={() => handleAdd(song)}
                    disabled={isAlreadyAdded}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isAlreadyAdded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    {isAlreadyAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredSongs.length === 0 && (
            <div className="py-12 text-center text-neutral-400">
              <Music className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
              <p className="text-sm">No songs match "{query}" in online catalog</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
