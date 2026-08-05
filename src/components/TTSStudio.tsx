import React, { useState } from 'react';
import { 
  VoiceProfile, 
  EmotionType, 
  AudioFormat, 
  TTSGenerationSettings, 
  ProjectFolder, 
  AudioClip 
} from '../types';
import { 
  Mic, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  Sliders, 
  Wand2, 
  Plus, 
  FolderPlus, 
  Copy, 
  Check, 
  Volume2, 
  Info,
  ChevronDown,
  Layers,
  Flame,
  Globe
} from 'lucide-react';
import { createAudioFormatBlob, formatDuration, formatBytes, generateWaveformBars } from '../lib/audioUtils';

interface TTSStudioProps {
  voices: VoiceProfile[];
  projects: ProjectFolder[];
  onGenerate: (settings: TTSGenerationSettings, selectedVoice: VoiceProfile) => Promise<AudioClip>;
  onOpenVoiceCloneModal: () => void;
  onSaveClipToProject: (clip: AudioClip) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Hindi Romantic Story (हिंदी कहानी)',
    text: 'उस शाम बारिश हल्की-हल्की हो रही थी। वो कॉफ़ी की चुस्की लेते हुए पुरानी यादों में खो गई...',
    lang: 'hi-IN',
    emotion: 'empathetic' as EmotionType
  },
  {
    title: 'Hinglish Tech Review',
    text: 'Guys, aaj hum baat karne wale hain iss new AI voice engine ke baare mein. Performance absolutely next level hai!',
    lang: 'hinglish',
    emotion: 'excited' as EmotionType
  },
  {
    title: 'English Storyteller',
    text: 'Deep inside the enchanted forest, a mysterious voice whispered ancient secrets to the lone traveller.',
    lang: 'en-US',
    emotion: 'storyteller' as EmotionType
  },
  {
    title: 'News Commentary (समाचार)',
    text: 'आज की मुख्य समाचारों में, वैज्ञानिकों ने एआई तकनीक में एक नया ऐतिहासिक कीर्तिमान स्थापित किया है।',
    lang: 'hi-IN',
    emotion: 'newsroom' as EmotionType
  }
];

const EMOTIONS_LIST: Array<{ id: EmotionType; label: string; icon: string; color: string }> = [
  { id: 'neutral', label: 'Natural / Neutral', icon: '💬', color: 'bg-slate-700/50 text-slate-200 border-slate-600' },
  { id: 'cheerful', label: 'Cheerful / Happy', icon: '😊', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'empathetic', label: 'Empathetic / Warm', icon: '❤️', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'dramatic', label: 'Dramatic / Intense', icon: '🎭', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'whisper', label: 'Soft Whisper', icon: '🤫', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 'excited', label: 'Energetic / Excited', icon: '⚡', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'storyteller', label: 'Storyteller / Lore', icon: '📖', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'newsroom', label: 'Authoritative News', icon: '🎙️', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { id: 'angry', label: 'Angry / Loud', icon: '🔥', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
  { id: 'calm', label: 'Calm Meditation', icon: '🧘', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' }
];

export const TTSStudio: React.FC<TTSStudioProps> = ({
  voices,
  projects,
  onGenerate,
  onOpenVoiceCloneModal,
  onSaveClipToProject
}) => {
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(voices[0]?.id || 'voice-aarav');
  const [text, setText] = useState<string>('नमस्ते! वॉइसक्राफ्ट एआई स्टूडियो में आपका स्वागत है। यहाँ आप realistic hindi, english aur hinglish voice with true human emotions generate kar sakte hain.');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('empathetic');
  const [emotionIntensity, setEmotionIntensity] = useState<number>(0.85);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);
  const [stability, setStability] = useState<number>(0.75);
  const [clarity, setClarity] = useState<number>(0.85);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(projects[0]?.id || 'folder-default');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentClip, setCurrentClip] = useState<AudioClip | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showVoiceList, setShowVoiceList] = useState<boolean>(false);

  const selectedVoice = voices.find(v => v.id === selectedVoiceId) || voices[0];

  const handleApplySamplePrompt = (prompt: typeof SAMPLE_PROMPTS[0]) => {
    setText(prompt.text);
    setSelectedEmotion(prompt.emotion);
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }

    try {
      const clip = await onGenerate({
        text,
        voiceId: selectedVoice.id,
        languageCode: selectedVoice.languageCode,
        emotion: selectedEmotion,
        emotionIntensity,
        speed,
        pitch,
        stability,
        clarity,
        pauseLength: 0.5,
        format,
        projectFolderId: selectedFolderId
      }, selectedVoice);

      setCurrentClip(clip);
    } catch (err) {
      console.error('TTS Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayAudio = () => {
    if (!currentClip || !currentClip.audioUrl) return;
    
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play().catch(err => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    } else {
      try {
        const newAudio = new Audio(currentClip.audioUrl);
        newAudio.onended = () => setIsPlaying(false);
        newAudio.onerror = (e) => {
          console.warn('Audio element source error:', e);
          setIsPlaying(false);
        };
        newAudio.play().catch(err => {
          console.warn('Audio play failed:', err);
          setIsPlaying(false);
        });
        setAudioElement(newAudio);
        setIsPlaying(true);
      } catch (err) {
        console.error('Audio initialization error:', err);
        setIsPlaying(false);
      }
    }
  };

  const handleDownload = async (targetFormat: AudioFormat) => {
    if (!currentClip) return;
    const base64Data = currentClip.audioUrl.split(',')[1] || currentClip.audioUrl;
    const { blob } = await createAudioFormatBlob(base64Data, targetFormat, currentClip.mimeType);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentClip.title.replace(/\s+/g, '_')}_${targetFormat}.${targetFormat}`;
    link.click();
  };

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsCount = text.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Studio Header & Quick Sample Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              Voice Generation Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Human-like realistic TTS with emotion controls, voice cloning, and multilingual synthesis.
            </p>
          </div>

          {/* Voice Cloning Trigger Button */}
          <button
            onClick={onOpenVoiceCloneModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Clone New Voice</span>
          </button>
        </div>

        {/* Quick Sample Script Chips */}
        <div className="pt-4">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-2.5">
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" /> Quick Multilingual Prompt Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleApplySamplePrompt(prompt)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>{prompt.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Script Editor & Voice Settings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Text Input Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-indigo-400" /> Speech Script
              </label>
              <div className="text-xs text-slate-400 flex items-center gap-3 font-mono">
                <span>{wordsCount} words</span>
                <span>•</span>
                <span>{charsCount} chars</span>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text here in Hindi, English, Hinglish, Spanish, French..."
              rows={6}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-sans leading-relaxed"
            />

            {/* Insertion Helper tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">SSML Helpers:</span>
              {['[pause=1s]', '[whisper]', '[excited]', '[emphasis]'].map((tag, i) => (
                <button
                  key={i}
                  onClick={() => setText(prev => prev + ` ${tag} `)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-700 font-mono transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selector Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" /> Select Voice Profile
              </label>
              <span className="text-xs text-indigo-400 font-medium">
                {voices.length} Available Voices
              </span>
            </div>

            {/* Currently Selected Voice Profile Card */}
            <div 
              onClick={() => setShowVoiceList(!showVoiceList)}
              className="cursor-pointer bg-slate-950/90 border border-slate-700 hover:border-indigo-500/80 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-3">
                <img
                  src={selectedVoice.avatarUrl}
                  alt={selectedVoice.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-white">{selectedVoice.name}</h4>
                    {selectedVoice.isCloned && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Cloned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{selectedVoice.accent} • {selectedVoice.language}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showVoiceList ? 'rotate-180' : ''}`} />
            </div>

            {/* Voice Dropdown Drawer */}
            {showVoiceList && (
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar p-1 bg-slate-950 rounded-xl border border-slate-800">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoiceId(voice.id);
                      if (voice.recommendedEmotion) setSelectedEmotion(voice.recommendedEmotion);
                      setShowVoiceList(false);
                    }}
                    className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                      selectedVoiceId === voice.id
                        ? 'bg-indigo-600/20 border border-indigo-500/60 text-white'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={voice.avatarUrl}
                        alt={voice.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-medium text-white">{voice.name}</div>
                        <div className="text-[10px] text-slate-400">{voice.accent}</div>
                      </div>
                    </div>
                    {selectedVoiceId === voice.id && (
                      <Check className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emotion & Tone Style Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" /> Human Emotional Tone
              </label>
              <span className="text-xs text-slate-400">
                Intensity: <strong className="text-indigo-300">{Math.round(emotionIntensity * 100)}%</strong>
              </span>
            </div>

            {/* Emotion Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EMOTIONS_LIST.map((emo) => (
                <button
                  key={emo.id}
                  onClick={() => setSelectedEmotion(emo.id)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-center gap-2 ${
                    selectedEmotion === emo.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                      : `${emo.color} hover:bg-slate-800/60`
                  }`}
                >
                  <span className="text-base">{emo.icon}</span>
                  <span className="truncate font-medium">{emo.label}</span>
                </button>
              ))}
            </div>

            {/* Emotion Intensity Slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Subtle Emotion</span>
                <span>Extreme Expression</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={emotionIntensity}
                onChange={(e) => setEmotionIntensity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

        </div>

        {/* Right Column: ElevenLabs Fine Control Sliders & Audio Output Player */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ElevenLabs Style Controls Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" /> Voice Fine-Tuning Controls
            </h3>

            {/* Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Speaking Speed</span>
                <span className="text-indigo-300 font-mono font-medium">{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Pitch Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Pitch Shift</span>
                <span className="text-indigo-300 font-mono font-medium">{pitch > 0 ? `+${pitch}` : pitch} semitones</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Stability Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Voice Stability</span>
                <span className="text-indigo-300 font-mono font-medium">{Math.round(stability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Clarity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Clarity & Similarity Boost</span>
                <span className="text-indigo-300 font-mono font-medium">{Math.round(clarity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={clarity}
                onChange={(e) => setClarity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Audio Export Format & Folder Target */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Export Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as AudioFormat)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="mp3">MP3 Audio</option>
                  <option value="wav">WAV Lossless</option>
                  <option value="aac">AAC High Quality</option>
                  <option value="ogg">OGG Vorbis</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Target Project</label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateSpeech}
              disabled={isGenerating || !text.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-98"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Human Speech...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-indigo-200" />
                  <span>Generate Human Speech</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Audio Player & Waveform Box */}
          {currentClip && (
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{currentClip.title}</h4>
                  <p className="text-xs text-indigo-300">
                    Voice: {currentClip.voiceName} • {formatDuration(currentClip.durationSeconds)} ({formatBytes(currentClip.sizeBytes)})
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-mono">
                  {currentClip.format}
                </span>
              </div>

              {/* Dynamic Waveform Visualizer Bars */}
              <div className="h-16 bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-1 overflow-hidden">
                {generateWaveformBars(currentClip.text, 36).map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`w-1.5 rounded-full transition-all ${
                      isPlaying 
                        ? 'bg-gradient-to-t from-indigo-500 to-pink-500 animate-pulse' 
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Playback Controls & Multi-Format Download */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  onClick={togglePlayAudio}
                  className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Export:</span>
                  {(['mp3', 'wav', 'aac', 'ogg'] as AudioFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleDownload(fmt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-indigo-300 hover:text-white uppercase font-mono transition-all"
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
