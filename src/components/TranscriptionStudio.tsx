import React, { useState, useRef } from 'react';
import { TranscriptionItem } from '../types';
import { 
  FileText, 
  Mic, 
  Square, 
  Upload, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  Languages, 
  ShieldCheck,
  Search,
  Trash2
} from 'lucide-react';

interface TranscriptionStudioProps {
  transcriptions: TranscriptionItem[];
  onSaveTranscription: (item: TranscriptionItem) => void;
  onDeleteTranscription: (id: string) => void;
}

export const TranscriptionStudio: React.FC<TranscriptionStudioProps> = ({
  transcriptions,
  onSaveTranscription,
  onDeleteTranscription
}) => {
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [languagePref, setLanguagePref] = useState('Hindi & English (Hinglish)');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentResult, setCurrentResult] = useState<TranscriptionItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
          setFileName('Recorded_Mic_Speech.mp3');
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(p => p + 1), 1000);

    } catch (err) {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setAudioBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBase64) return;
    setIsTranscribing(true);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: 'audio/mp3',
          languagePreference: languagePref
        })
      });

      const data = await res.json();
      if (data.success && data.transcription) {
        const newItem: TranscriptionItem = {
          id: `transcription-${Date.now()}`,
          title: fileName ? `Transcript of ${fileName}` : 'Speech Transcription',
          originalFileName: fileName || 'Recorded_Audio.mp3',
          transcriptText: data.transcription.transcriptText,
          detectedLanguage: data.transcription.detectedLanguage || 'Hindi / English',
          emotionSummary: data.transcription.emotionSummary || 'Conversational',
          durationSeconds: data.transcription.durationSeconds || 15,
          wordsCount: data.transcription.wordsCount || 0,
          speakerSegments: data.transcription.speakerSegments || [],
          createdAt: new Date().toLocaleDateString(),
          cloudSynced: true
        };

        setCurrentResult(newItem);
        onSaveTranscription(newItem);
      }
    } catch (err) {
      console.error('Transcription failed:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyTranscript = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.transcriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSrtSubtitle = (item: TranscriptionItem) => {
    let srtContent = '';
    item.speakerSegments.forEach((seg, idx) => {
      srtContent += `${idx + 1}\n00:00:00,000 --> 00:00:${seg.endTime || '10'},000\n[${seg.speaker}]: ${seg.text}\n\n`;
    });
    const blob = new Blob([srtContent || item.transcriptText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${item.title.replace(/\s+/g, '_')}.srt`;
    link.click();
  };

  const filteredTranscripts = transcriptions.filter(t => 
    searchQuery === '' ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.transcriptText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            AI Audio Transcription Service (STT)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Convert Hindi, English, and Hinglish speech to text with timestamps, speaker tags, and secure cloud backups.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secure Cloud Backup Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area: Audio Input & Transcription Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Input Audio Source
            </h3>

            {/* Mic Record or Upload */}
            <div className="grid grid-cols-2 gap-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-all"
                >
                  <Mic className="w-4 h-4 text-rose-400" />
                  <span>Record Voice</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center justify-center gap-2 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop ({recordingSeconds}s)</span>
                </button>
              )}

              <label className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Upload Audio</span>
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {fileName && (
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 truncate">
                Loaded: <strong>{fileName}</strong>
              </div>
            )}

            {/* Language Selection */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-medium text-slate-400">Target Language Context</label>
              <select
                value={languagePref}
                onChange={(e) => setLanguagePref(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Hindi & English (Hinglish)">Hindi & English (Hinglish - Auto)</option>
                <option value="Pure Hindi">Pure Hindi (हिंदी)</option>
                <option value="English (Global)">English (Global)</option>
                <option value="Spanish / French / German">Multilingual Global</option>
              </select>
            </div>

            {/* Transcribe Button */}
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing || !audioBase64}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isTranscribing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini Transcribing Speech...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-purple-200" />
                  <span>Transcribe Speech to Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Area: Latest Result & Saved Transcriptions */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Latest Result Box */}
          {currentResult && (
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white">{currentResult.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-purple-300 mt-0.5">
                    <Languages className="w-3.5 h-3.5" />
                    <span>{currentResult.detectedLanguage}</span>
                    <span>•</span>
                    <span>{currentResult.wordsCount} words</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyTranscript}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Copy Text"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => downloadSrtSubtitle(currentResult)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>SRT</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans max-h-48 overflow-y-auto custom-scrollbar">
                {currentResult.transcriptText}
              </div>

              {/* Speaker Segments */}
              {currentResult.speakerSegments.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Speaker Timestamps</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {currentResult.speakerSegments.map((seg, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-start gap-2">
                        <span className="font-mono text-[10px] text-purple-400 shrink-0 mt-0.5">[{seg.startTime} - {seg.endTime}]</span>
                        <div className="flex-1">
                          <strong className="text-white text-[11px]">{seg.speaker}:</strong> <span className="text-slate-300">{seg.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Saved Cloud Transcriptions List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Saved Cloud Backup Transcriptions
              </h3>
              <span className="text-xs text-slate-400 font-mono">{transcriptions.length} items</span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
              {filteredTranscripts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No saved transcriptions yet. Transcribe speech above to save to secure cloud backups.
                </div>
              ) : (
                filteredTranscripts.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-xs text-white truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.transcriptText}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-mono">
                        <span>{item.detectedLanguage}</span>
                        <span>•</span>
                        <span>{item.wordsCount} words</span>
                        <span>•</span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => downloadSrtSubtitle(item)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        title="Download Subtitle"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTranscription(item.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
