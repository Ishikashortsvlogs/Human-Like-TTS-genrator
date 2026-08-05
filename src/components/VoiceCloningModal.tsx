import React, { useState, useRef } from 'react';
import { VoiceProfile } from '../types';
import { X, Mic, Square, Upload, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VoiceCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceCloned: (newVoice: VoiceProfile) => void;
}

export const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({
  isOpen,
  onClose,
  onVoiceCloned
}) => {
  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setErrorMessage(null);
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
          setFileName('Recorded_Mic_Sample.mp3');
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      setErrorMessage('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTrainAndClone = async () => {
    if (!voiceName.trim() || !audioBase64) return;
    setIsCloning(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: voiceName,
          sampleAudioBase64: audioBase64,
          description,
          sampleText
        })
      });

      const data = await res.json();
      if (data.success && data.voice) {
        onVoiceCloned(data.voice);
        onClose();
      } else {
        throw new Error(data.error || 'Cloning failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to clone voice profile.');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold">Clone AI Voice Profile</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Voice Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Voice Profile Name *</label>
          <input
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder="e.g. Rohit Personal Voice, Narrative Clone..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Audio Recording or Upload */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Audio Voice Sample (10-30s recommended) *</label>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Mic Record Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <Mic className="w-4 h-4 text-rose-400" />
                <span>Record Mic Audio</span>
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

            {/* File Upload Button */}
            <label className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Audio File</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {fileName && (
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span className="truncate max-w-[240px] font-medium">{fileName}</span>
              </div>
              <span className="text-[10px] text-purple-300">Sample Ready</span>
            </div>
          )}
        </div>

        {/* Description / Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Voice Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Warm Hindi-English conversational voice..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleTrainAndClone}
          disabled={isCloning || !voiceName.trim() || !audioBase64}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
        >
          {isCloning ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-white" />
              <span>Gemini Analyzing Timbre & Training Model...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Extract Voice Profile & Save</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
