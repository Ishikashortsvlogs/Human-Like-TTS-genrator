import React, { useState } from 'react';
import { ApiKeyItem } from '../types';
import { Key, Copy, Check, Plus, Trash2, Code, Terminal, Send, Sparkles } from 'lucide-react';
import { createAudioFormatBlob } from '../lib/audioUtils';

interface ApiDeveloperStudioProps {
  apiKeys: ApiKeyItem[];
  onCreateKey: (name: string) => void;
  onRevokeKey: (id: string) => void;
}

export const ApiDeveloperStudio: React.FC<ApiDeveloperStudioProps> = ({
  apiKeys,
  onCreateKey,
  onRevokeKey
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // API Tester Form
  const [testText, setTestText] = useState('Welcome to VoiceCraft REST API integration.');
  const [testVoice, setTestVoice] = useState('Kore');
  const [testResultAudio, setTestResultAudio] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const activeKey = apiKeys.find(k => k.status === 'active')?.key || 'vc_live_demo_9876543210';

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    onCreateKey(newKeyName);
    setNewKeyName('');
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const snippets = {
    curl: `curl -X POST "${window.location.origin}/api/v1/tts/generate" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${activeKey}" \\
  -d '{
    "text": "Namaste! VoiceCraft AI Studio me aapka swagat hai.",
    "languageCode": "hi-IN",
    "emotion": "empathetic",
    "speed": 1.0,
    "format": "mp3"
  }'`,

    javascript: `const response = await fetch("${window.location.origin}/api/v1/tts/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${activeKey}"
  },
  body: JSON.stringify({
    text: "Welcome to VoiceCraft REST API speech synthesis.",
    languageCode: "en-US",
    emotion: "cheerful",
    speed: 1.0,
    format: "mp3"
  })
});

const data = await response.json();
console.log("Audio Base64:", data.audioBase64);`,

    python: `import requests

url = "${window.location.origin}/api/v1/tts/generate"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${activeKey}"
}
payload = {
    "text": "Human-like emotional text-to-speech generated via REST API.",
    "languageCode": "hi-IN",
    "emotion": "dramatic",
    "speed": 1.0,
    "format": "mp3"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Generated audio size:", data["sizeBytes"])`
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(snippets[selectedSnippet]);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleTestApi = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/v1/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey
        },
        body: JSON.stringify({
          text: testText,
          languageCode: 'hi-IN',
          emotion: 'cheerful',
          geminiVoiceName: testVoice,
          format: 'mp3'
        })
      });

      const data = await res.json();
      if (data.audioBase64) {
        const { dataUrl } = await createAudioFormatBlob(data.audioBase64, 'wav', data.mimeType || 'audio/wav');
        setTestResultAudio(dataUrl);
      }
    } catch (err) {
      console.error('API Test error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-400" />
            Developer API & Integration Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate REST API keys and export human-like speech clips directly into external applications.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Endpoint: <strong className="text-indigo-300">/api/v1/tts/generate</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: API Key Management */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Create Key */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Create New Developer API Key
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key label e.g. Mobile App Backend..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleCreate}
                disabled={!newKeyName.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
              >
                Create
              </button>
            </div>
          </div>

          {/* Active Keys List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Your API Credentials ({apiKeys.length})
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {apiKeys.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No active API keys. Create one above to get started.
                </div>
              ) : (
                apiKeys.map((k) => (
                  <div key={k.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-indigo-300">{k.name}</span>
                      <button
                        onClick={() => onRevokeKey(k.id)}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Revoke Key
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                      <span className="truncate max-w-[200px]">{k.key}</span>
                      <button
                        onClick={() => copyKey(k.id, k.key)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Code Snippets & Live API Tester */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Code Snippets Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Integration Code Snippets
                </h3>
              </div>

              {/* Language Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['curl', 'javascript', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedSnippet(lang)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-mono text-[11px] transition-all ${
                      selectedSnippet === lang ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code View */}
            <div className="relative">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-indigo-200 font-mono overflow-x-auto leading-relaxed">
                {snippets[selectedSnippet]}
              </pre>

              <button
                onClick={copySnippet}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-slate-700"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Interactive REST API Tester */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Interactive REST API Tester
            </h3>

            <div className="space-y-2">
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white resize-none focus:outline-none"
              />

              <div className="flex items-center justify-between gap-2">
                <select
                  value={testVoice}
                  onChange={(e) => setTestVoice(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300"
                >
                  <option value="Kore">Kore (Hindi / English Female)</option>
                  <option value="Fenrir">Fenrir (Deep Hindi / English Male)</option>
                  <option value="Puck">Puck (Energetic Youth)</option>
                  <option value="Zephyr">Zephyr (Smooth Natural)</option>
                </select>

                <button
                  onClick={handleTestApi}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {isTesting ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Test API Request</span>
                </button>
              </div>
            </div>

            {testResultAudio && (
              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-mono">200 OK — Speech Generated</span>
                <audio controls src={testResultAudio} className="h-8" />
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
