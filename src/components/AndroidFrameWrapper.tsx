import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Mic, FolderKanban, History, FileText, Key } from 'lucide-react';

interface AndroidFrameWrapperProps {
  isAndroidFrame: boolean;
  children: React.ReactNode;
  activeTab: 'tts' | 'projects' | 'history' | 'transcription' | 'developer';
  setActiveTab: (tab: 'tts' | 'projects' | 'history' | 'transcription' | 'developer') => void;
}

export const AndroidFrameWrapper: React.FC<AndroidFrameWrapperProps> = ({
  isAndroidFrame,
  children,
  activeTab,
  setActiveTab
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isAndroidFrame) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-950 py-4 sm:py-8 px-2 flex justify-center items-center">
      {/* Android Device Mockup Container */}
      <div className="relative w-full max-w-[420px] h-[860px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 shadow-indigo-500/10 flex flex-col overflow-hidden">
        
        {/* Device Outer Frame Volume / Power Accents */}
        <div className="absolute -left-[7px] top-28 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[7px] top-44 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-[7px] top-36 w-[3px] h-16 bg-slate-700 rounded-r-sm" />

        {/* Device Inner Display Screen */}
        <div className="relative w-full h-full bg-slate-950 rounded-[38px] flex flex-col overflow-hidden border border-slate-800 text-white">
          
          {/* Top Status Bar & Camera Island */}
          <div className="w-full px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-300 font-medium z-30 select-none bg-slate-900/60 backdrop-blur-sm border-b border-slate-800/50">
            <span>{currentTime || '09:41'}</span>
            
            {/* Punch Hole Camera Island */}
            <div className="w-20 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center gap-1.5 px-2 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-900/80" />
            </div>

            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 text-slate-300" />
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Main App Content View inside Phone Frame */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4">
            {children}
          </div>

          {/* Android Mobile Navigation Bottom Bar */}
          <div className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2 flex items-center justify-around z-30">
            <button
              onClick={() => setActiveTab('tts')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                activeTab === 'tts' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span className="text-[10px]">Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                activeTab === 'projects' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span className="text-[10px]">Projects</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                activeTab === 'history' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-[10px]">History</span>
            </button>

            <button
              onClick={() => setActiveTab('transcription')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                activeTab === 'transcription' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[10px]">STT</span>
            </button>

            <button
              onClick={() => setActiveTab('developer')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                activeTab === 'developer' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="text-[10px]">API</span>
            </button>
          </div>

          {/* Android Home Gesture Pill */}
          <div className="w-full py-1.5 bg-slate-950 flex justify-center items-center">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
};
