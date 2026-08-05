import React from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Moon, 
  Sun, 
  CloudCheck, 
  CloudOff, 
  FileCode2, 
  Accessibility,
  Key,
  FolderKanban,
  History,
  Mic,
  FileText
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'tts' | 'projects' | 'history' | 'transcription' | 'developer';
  setActiveTab: (tab: 'tts' | 'projects' | 'history' | 'transcription' | 'developer') => void;
  isAndroidFrame: boolean;
  setIsAndroidFrame: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isOnline: boolean;
  onOpenArchDoc: () => void;
  onOpenAccessibility: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAndroidFrame,
  setIsAndroidFrame,
  isDarkMode,
  setIsDarkMode,
  isOnline,
  onOpenArchDoc,
  onOpenAccessibility
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#020617] backdrop-blur-md border-b border-slate-800 text-slate-200 px-3 sm:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              VoxSync <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">AI Studio</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
              Human-like Emotional TTS & Voice Cloning
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('tts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'tts'
                ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Lab
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'projects'
                ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Projects
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>

          <button
            onClick={() => setActiveTab('transcription')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'transcription'
                ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Transcription
          </button>

          <button
            onClick={() => setActiveTab('developer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'developer'
                ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            API & Dev
          </button>
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2">
          {/* Cloud Sync Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            {isOnline ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden lg:inline text-emerald-400 font-medium">Cloud Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline text-amber-300 font-medium">Offline</span>
              </>
            )}
          </div>

          {/* Android Mobile Frame Toggle */}
          <button
            onClick={() => setIsAndroidFrame(!isAndroidFrame)}
            title={isAndroidFrame ? "Switch to Full View" : "Switch to Mobile Frame"}
            className={`p-2 rounded-lg border transition-colors ${
              isAndroidFrame 
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {isAndroidFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Dark/Light Mode"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Architecture Tech Doc Modal Trigger */}
          <button
            onClick={onOpenArchDoc}
            title="Technical Architecture & Schema Document"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors"
          >
            <FileCode2 className="w-4 h-4" />
            <span className="hidden sm:inline">Arch Spec</span>
          </button>

          {/* Accessibility Settings */}
          <button
            onClick={onOpenAccessibility}
            title="Accessibility Settings"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Accessibility className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
