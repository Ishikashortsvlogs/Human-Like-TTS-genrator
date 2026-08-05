import React, { useState } from 'react';
import { X, FileCode2, Layers, Database, ShieldCheck, Cpu, Zap, Server, Code, Download } from 'lucide-react';

interface ArchitectureDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocModal: React.FC<ArchitectureDocModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'schemas' | 'latency' | 'apis' | 'security'>('overview');

  if (!isOpen) return null;

  const downloadDocJson = () => {
    const docData = {
      title: "VoiceCraft AI Studio - Technical Architecture Document",
      version: "1.0.0",
      architectureOverview: {
        runtime: "Cloud Run Container Node.js + Express 4 + Vite React 19",
        speechEngine: "Google Gemini 3.1 Flash TTS Preview + Gemini 3.6 Flash Multimodal Audio",
        storageStrategy: "Dual-tier: IndexedDB (Client Offline First) + Server JSON Cloud Sync",
        apiGateway: "Express REST Proxy with x-api-key Developer Authentication"
      },
      schemas: {
        VoiceProfile: {
          id: "string (PK)",
          name: "string",
          gender: "male | female | neutral",
          accent: "string",
          languageCode: "hi-IN | en-US | en-IN | hinglish | es-ES | fr-FR",
          isCloned: "boolean",
          geminiVoiceName: "Kore | Puck | Charon | Fenrir | Zephyr",
          stabilityDefault: "float (0.0 - 1.0)",
          clarityDefault: "float (0.0 - 1.0)"
        },
        AudioClip: {
          id: "string (PK)",
          title: "string",
          text: "string",
          audioUrl: "base64 / blob URL",
          format: "mp3 | wav | aac | ogg",
          durationSeconds: "float",
          voiceId: "string (FK)",
          projectFolderId: "string (FK)",
          isFavorite: "boolean"
        },
        TranscriptionItem: {
          id: "string (PK)",
          transcriptText: "string",
          detectedLanguage: "string",
          emotionSummary: "string",
          speakerSegments: "Array<{ speaker, startTime, endTime, text }>"
        }
      },
      lowLatencyStrategy: [
        "Server-side stream buffer encoding with 24kHz 16-bit PCM waveform chunks",
        "Client optimistic local state updates with IndexedDB auto-sync",
        "Prebuilt voice model selection caching (Kore, Puck, Charon, Fenrir, Zephyr)"
      ]
    };

    const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'VoiceCraft_Technical_Architecture.json';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Technical Architecture & Schema Specification</h3>
              <p className="text-xs text-slate-400">System Design, Database Schemas, Low-Latency Optimization & API Integrations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadDocJson}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Spec JSON</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-2 text-xs overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: '1. System Overview', icon: Layers },
            { id: 'schemas', label: '2. Database Schemas', icon: Database },
            { id: 'latency', label: '3. Low-Latency Pipeline', icon: Zap },
            { id: 'apis', label: '4. REST API Endpoints', icon: Server },
            { id: 'security', label: '5. Security & Isolation', icon: ShieldCheck }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content Area */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6 text-xs sm:text-sm text-slate-200 leading-relaxed">
          
          {/* SECTION 1: SYSTEM OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-indigo-300 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                System Architecture & Component Topography
              </h4>

              <p className="text-slate-300">
                VoiceCraft AI Studio employs a full-stack, client-first offline-capable architecture backed by an Express 4 Node.js application container running on port 3000. Server-side Gemini API handlers interface with <strong>gemini-3.1-flash-tts-preview</strong> for emotional speech synthesis and <strong>gemini-3.6-flash</strong> for vocal timbre feature extraction and transcription.
              </p>

              {/* ASCII Diagram Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
{`+---------------------------------------------------------------------------------+
|                               CLIENT LAYER (React 19 + Vite)                    |
|  - Android Device Viewport Frame / Desktop Responsive Grid                     |
|  - ElevenLabs Control State Engine (Speed, Pitch, Stability, Clarity)           |
|  - IndexedDB Local Storage (Offline-First Cache for Clips, Voices, Projects)    |
|  - Web Audio API Waveform Visualizer & Multi-Format Encoders (MP3/WAV/AAC/OGG)  |
+----------------------------------------+----------------------------------------+
                                         | REST API (HTTP/JSON + Audio Base64)
                                         v
+---------------------------------------------------------------------------------+
|                            SERVER BACKEND LAYER (Express Node.js)                |
|  - /api/tts/generate       -> Prompt Engineering with Emotional Directives      |
|  - /api/voice/clone        -> Audio Feature Extraction & Cloned Voice Specs      |
|  - /api/transcribe         -> Gemini Multimodal Audio-to-Text Diarization       |
|  - /api/v1/tts/generate    -> Public REST API Gateway with x-api-key Auth        |
|  - /api/cloud/sync         -> Thread-Safe Cloud Storage State Persistence       |
+----------------------------------------+----------------------------------------+
                                         | Gemini SDK (@google/genai)
                                         v
+---------------------------------------------------------------------------------+
|                               GOOGLE GEMINI AI MODELS                           |
|  - gemini-3.1-flash-tts-preview : Audio Modality Prebuilt Voices & Synthesis   |
|  - gemini-3.6-flash             : Multimodal Timbre Analysis & Speech-to-Text  |
+---------------------------------------------------------------------------------+`}
              </div>
            </div>
          )}

          {/* SECTION 2: DATABASE SCHEMAS */}
          {activeSection === 'schemas' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-purple-300 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                Entity Schema Designs & Storage Models
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* VoiceProfile Schema */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h5 className="font-bold text-xs text-indigo-300 font-mono">VoiceProfile Entity</h5>
                  <pre className="text-[11px] font-mono text-slate-300">
{`{
  id: string (PK),
  name: string,
  gender: 'male' | 'female' | 'neutral',
  accent: string,
  languageCode: 'hi-IN' | 'hinglish' | 'en-US',
  isCloned: boolean,
  geminiVoiceName: 'Kore'|'Puck'|'Charon'|'Fenrir',
  stabilityDefault: number (0.0 - 1.0),
  clarityDefault: number (0.0 - 1.0)
}`}
                  </pre>
                </div>

                {/* AudioClip Schema */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h5 className="font-bold text-xs text-indigo-300 font-mono">AudioClip Entity</h5>
                  <pre className="text-[11px] font-mono text-slate-300">
{`{
  id: string (PK),
  title: string,
  text: string,
  audioUrl: string (Base64 / Data URL),
  format: 'mp3' | 'wav' | 'aac' | 'ogg',
  durationSeconds: number,
  sizeBytes: number,
  projectFolderId: string (FK),
  isFavorite: boolean
}`}
                  </pre>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 3: LOW-LATENCY PIPELINE */}
          {activeSection === 'latency' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Low-Latency Performance & Synthesis Strategy
              </h4>

              <ul className="space-y-2.5 text-slate-300 list-disc pl-5">
                <li>
                  <strong>Direct PCM Audio Buffer Processing:</strong> Model audio modality responses return raw 24kHz PCM / WAV base64 streams directly mapped to browser AudioBuffers, eliminating transcoding delays.
                </li>
                <li>
                  <strong>Optimistic Local State Cache:</strong> Generated voice clips are saved instantly to local IndexedDB before background sync with server cloud storage.
                </li>
                <li>
                  <strong>Fallback Audio Synthesis Engine:</strong> In cases of network fluctuation or rate limits, the server falls back seamlessly to multi-harmonic PCM audio synthesis, ensuring uninterrupted client productivity.
                </li>
              </ul>
            </div>
          )}

          {/* SECTION 4: REST API ENDPOINTS */}
          {activeSection === 'apis' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <Server className="w-5 h-5 text-rose-400" />
                REST API Integration Endpoints
              </h4>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold">POST</span> /api/tts/generate
                  <p className="text-slate-400 font-sans text-[11px] mt-1">Synthesizes human speech with emotion intensity, style controls, and format options.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-purple-400 font-bold">POST</span> /api/voice/clone
                  <p className="text-slate-400 font-sans text-[11px] mt-1">Analyzes mic/uploaded sample audio to extract pitch, timbre, and accent for voice cloning.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-blue-400 font-bold">POST</span> /api/transcribe
                  <p className="text-slate-400 font-sans text-[11px] mt-1">Converts speech audio to text with speaker segments, emotion summary, and SRT subtitle export.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SECURITY & ISOLATION */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Security & API Key Protection
              </h4>

              <p className="text-slate-300">
                All calls to the Gemini AI SDK occur strictly server-side inside <code>server.ts</code>. The <code>GEMINI_API_KEY</code> is injected securely via Cloud Run container environment variables and is never exposed to the client bundle or browser DevTools. External integrations access the TTS engine via generated <code>x-api-key</code> developer keys.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
          VoiceCraft AI Studio • Technical Architecture Document v1.0.0
        </div>

      </div>
    </div>
  );
};
