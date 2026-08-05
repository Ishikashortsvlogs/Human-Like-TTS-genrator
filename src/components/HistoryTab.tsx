import React, { useState } from 'react';
import { AudioClip } from '../types';
import { History, Search, Play, Pause, Download, Heart, Trash2, Calendar, Mic } from 'lucide-react';
import { formatDuration, formatBytes, createAudioFormatBlob, generateWaveformBars } from '../lib/audioUtils';

interface HistoryTabProps {
  clips: AudioClip[];
  onToggleFavorite: (id: string) => void;
  onDeleteClip: (id: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  clips,
  onToggleFavorite,
  onDeleteClip
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const filteredClips = clips.filter(clip => {
    const matchesSearch = searchQuery === '' || 
      clip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      clip.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.voiceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEmotion = filterEmotion === 'all' || clip.emotion === filterEmotion;
    const matchesFav = !showFavoritesOnly || clip.isFavorite;

    return matchesSearch && matchesEmotion && matchesFav;
  });

  const togglePlay = (clip: AudioClip) => {
    if (!clip || !clip.audioUrl) return;
    if (playingClipId === clip.id && audioElement) {
      audioElement.pause();
      setPlayingClipId(null);
    } else {
      if (audioElement) audioElement.pause();
      try {
        const audio = new Audio(clip.audioUrl);
        audio.onended = () => setPlayingClipId(null);
        audio.onerror = () => setPlayingClipId(null);
        audio.play().catch(err => {
          console.warn('Audio playback error:', err);
          setPlayingClipId(null);
        });
        setAudioElement(audio);
        setPlayingClipId(clip.id);
      } catch (err) {
        console.error('Audio init error:', err);
        setPlayingClipId(null);
      }
    }
  };

  const handleDownloadFormat = async (clip: AudioClip, targetFormat: 'mp3' | 'wav' | 'aac' | 'ogg') => {
    const base64Data = clip.audioUrl.split(',')[1] || clip.audioUrl;
    const { blob } = await createAudioFormatBlob(base64Data, targetFormat, clip.mimeType);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${clip.title.replace(/\s+/g, '_')}_${targetFormat}.${targetFormat}`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            Generation History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quickly replay, re-download in multiple formats, or manage all saved voice creations.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Clips: <strong className="text-indigo-300">{clips.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history clips..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Emotion Filter */}
          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Emotion Tones</option>
            <option value="cheerful">Cheerful</option>
            <option value="empathetic">Empathetic</option>
            <option value="dramatic">Dramatic</option>
            <option value="whisper">Whisper</option>
            <option value="excited">Excited</option>
            <option value="storyteller">Storyteller</option>
            <option value="newsroom">Newsroom</option>
          </select>

          {/* Favorites Only Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              showFavoritesOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* History Items Grid */}
      <div className="space-y-3">
        {filteredClips.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-400">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs">No generation history matches your criteria.</p>
          </div>
        ) : (
          filteredClips.map((clip) => {
            const isPlaying = playingClipId === clip.id;

            return (
              <div
                key={clip.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg text-white space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => togglePlay(clip)}
                      className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white line-clamp-1">{clip.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-mono">
                          {clip.format}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">{clip.text}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onToggleFavorite(clip.id)}
                      className={`p-2 rounded-xl border transition-all ${
                        clip.isFavorite
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${clip.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => onDeleteClip(clip.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Waveform Visualization Strip */}
                <div className="h-10 bg-slate-950/80 rounded-xl px-3 border border-slate-800 flex items-center justify-between gap-1 overflow-hidden">
                  {generateWaveformBars(clip.text, 28).map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1 rounded-full transition-all ${
                        isPlaying ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Clip Meta & Format Downloads */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/60 font-mono">
                  <div className="flex items-center gap-3">
                    <span>Voice: <strong className="text-indigo-300">{clip.voiceName}</strong></span>
                    <span>•</span>
                    <span>Emotion: <strong className="text-rose-300">{clip.emotion}</strong></span>
                    <span>•</span>
                    <span>{formatDuration(clip.durationSeconds)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-sans">Download Format:</span>
                    {(['mp3', 'wav', 'aac', 'ogg'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => handleDownloadFormat(clip, fmt)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-indigo-300 hover:text-white uppercase font-mono border border-slate-700 transition-all"
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
