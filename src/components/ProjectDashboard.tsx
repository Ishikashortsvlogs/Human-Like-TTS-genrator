import React, { useState } from 'react';
import { ProjectFolder, AudioClip } from '../types';
import { 
  FolderPlus, 
  FolderKanban, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Download, 
  Tag, 
  Search, 
  FileAudio,
  FolderOpen,
  PieChart
} from 'lucide-react';
import { formatDuration, formatBytes, createAudioFormatBlob } from '../lib/audioUtils';

interface ProjectDashboardProps {
  projects: ProjectFolder[];
  clips: AudioClip[];
  onCreateProject: (name: string, description: string, color: string) => void;
  onDeleteProject: (id: string) => void;
  onDeleteClip: (id: string) => void;
}

const COLOR_PRESETS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899'];

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  clips,
  onCreateProject,
  onDeleteProject,
  onDeleteClip
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(projects[0]?.id || 'folder-default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const activeProject = projects.find(p => p.id === selectedFolderId) || projects[0];

  const projectClips = clips.filter(clip => {
    const matchesFolder = clip.projectFolderId === selectedFolderId || selectedFolderId === 'all';
    const matchesSearch = searchQuery === '' || 
      clip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      clip.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateProject(newFolderName, newFolderDesc, newFolderColor);
    setNewFolderName('');
    setNewFolderDesc('');
    setShowNewFolderModal(false);
  };

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
          console.warn('Audio play error:', err);
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

  const handleDownloadClip = async (clip: AudioClip) => {
    const base64Data = clip.audioUrl.split(',')[1] || clip.audioUrl;
    const { blob } = await createAudioFormatBlob(base64Data, clip.format, clip.mimeType);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${clip.title.replace(/\s+/g, '_')}.${clip.format}`;
    link.click();
  };

  const totalWords = projectClips.reduce((acc, c) => acc + (c.wordsCount || 0), 0);
  const totalBytes = projectClips.reduce((acc, c) => acc + (c.sizeBytes || 0), 0);
  const totalDurationSeconds = projectClips.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Banner & Folder Stats */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            Project Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize voice clips into folders, track usage stats, and export projects.
          </p>
        </div>

        <button
          onClick={() => setShowNewFolderModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all self-start md:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project Folder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Folder List */}
        <div className="md:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Folders</span>
            <span className="text-xs text-slate-500 font-mono">{projects.length} Folders</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {projects.map((proj) => {
              const count = clips.filter(c => c.projectFolderId === proj.id).length;
              const isSelected = selectedFolderId === proj.id;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedFolderId(proj.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0" 
                      style={{ backgroundColor: proj.color || '#3b82f6' }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{proj.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{proj.description || 'No description'}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                    {count} clips
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Area: Project Clips & Search */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Search & Folder Summary Cards */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search audio clips by title or text content..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Folder Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Clips</div>
                <div className="text-sm font-bold text-indigo-300 font-mono">{projectClips.length}</div>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Duration</div>
                <div className="text-sm font-bold text-purple-300 font-mono">{formatDuration(totalDurationSeconds)}</div>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Words</div>
                <div className="text-sm font-bold text-emerald-300 font-mono">{totalWords}</div>
              </div>
            </div>
          </div>

          {/* Clips List */}
          <div className="space-y-3">
            {projectClips.length === 0 ? (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
                <FileAudio className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-xs font-semibold text-slate-400">No voice clips in this folder yet</h4>
                <p className="text-[11px] text-slate-500">
                  Generate speech in the TTS Studio and select this project folder as destination.
                </p>
              </div>
            ) : (
              projectClips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => togglePlay(clip)}
                      className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 mt-0.5"
                    >
                      {playingClipId === clip.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-white truncate">{clip.title}</h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 uppercase">
                          {clip.format}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{clip.text}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                        <span>Voice: {clip.voiceName}</span>
                        <span>•</span>
                        <span>{formatDuration(clip.durationSeconds)}</span>
                        <span>•</span>
                        <span>{clip.emotion}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDownloadClip(clip)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                      title="Download Audio"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteClip(clip.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                      title="Delete Clip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white space-y-4">
            <h3 className="text-base font-bold">Create New Project Folder</h3>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. YouTube Shorts, Hindi Audiobooks..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Description</label>
              <input
                type="text"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="Optional folder notes..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Folder Tag Color</label>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((col) => (
                  <button
                    key={col}
                    onClick={() => setNewFolderColor(col)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      newFolderColor === col ? 'border-white scale-110' : 'border-transparent opacity-80'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
