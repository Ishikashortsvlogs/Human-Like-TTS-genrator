import React, { useState, useEffect } from 'react';
import { 
  VoiceProfile, 
  ProjectFolder, 
  AudioClip, 
  TranscriptionItem, 
  ApiKeyItem, 
  TTSGenerationSettings 
} from './types';
import { DEFAULT_VOICES, INITIAL_PROJECT_FOLDERS } from './data/voices';
import { offlineDb } from './lib/offlineDb';
import { createAudioFormatBlob } from './lib/audioUtils';

// Components
import { Navbar } from './components/Navbar';
import { AndroidFrameWrapper } from './components/AndroidFrameWrapper';
import { TTSStudio } from './components/TTSStudio';
import { VoiceCloningModal } from './components/VoiceCloningModal';
import { ProjectDashboard } from './components/ProjectDashboard';
import { HistoryTab } from './components/HistoryTab';
import { TranscriptionStudio } from './components/TranscriptionStudio';
import { ApiDeveloperStudio } from './components/ApiDeveloperStudio';
import { ArchitectureDocModal } from './components/ArchitectureDocModal';
import { AccessibilityModal } from './components/AccessibilityModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tts' | 'projects' | 'history' | 'transcription' | 'developer'>('tts');
  const [isAndroidFrame, setIsAndroidFrame] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Data States
  const [voices, setVoices] = useState<VoiceProfile[]>(DEFAULT_VOICES);
  const [projects, setProjects] = useState<ProjectFolder[]>(INITIAL_PROJECT_FOLDERS);
  const [clips, setClips] = useState<AudioClip[]>([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);

  // Modals
  const [showVoiceCloneModal, setShowVoiceCloneModal] = useState<boolean>(false);
  const [showArchDocModal, setShowArchDocModal] = useState<boolean>(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState<boolean>(false);

  // Accessibility settings
  const [fontSize, setFontSize] = useState<number>(16);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Monitor Network Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'm') {
        setIsAndroidFrame(prev => !prev);
      } else if (e.altKey && e.key.toLowerCase() === 'd') {
        setIsDarkMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Data from IndexedDB & Sync Cloud
  useEffect(() => {
    async function loadData() {
      try {
        const loadedVoices = await offlineDb.getAllVoices();
        const loadedProjects = await offlineDb.getAllProjects();
        const loadedClips = await offlineDb.getAllClips();
        const loadedTranscriptions = await offlineDb.getAllTranscriptions();
        const loadedKeys = await offlineDb.getAllApiKeys();

        setVoices(loadedVoices);
        setProjects(loadedProjects);
        setClips(loadedClips);
        setTranscriptions(loadedTranscriptions);
        
        if (loadedKeys.length === 0) {
          const defaultKey: ApiKeyItem = {
            id: 'key-default-1',
            name: 'Primary Developer API Key',
            key: `vc_live_${Math.random().toString(36).substr(2, 16)}`,
            createdAt: new Date().toLocaleDateString(),
            lastUsedAt: 'Just now',
            requestsCount: 12,
            status: 'active'
          };
          await offlineDb.saveApiKey(defaultKey);
          setApiKeys([defaultKey]);
        } else {
          setApiKeys(loadedKeys);
        }

        // Try syncing with Cloud server
        try {
          const cloudRes = await fetch('/api/cloud/data');
          if (cloudRes.ok) {
            const cloudJson = await cloudRes.json();
            if (cloudJson.success && cloudJson.data) {
              if (cloudJson.data.clips?.length > 0) setClips(cloudJson.data.clips);
              if (cloudJson.data.projects?.length > 0) setProjects(cloudJson.data.projects);
            }
          }
        } catch (cloudErr) {
          console.warn('Cloud storage sync unreachable, using offline IndexedDB cache.');
        }

      } catch (err) {
        console.error('Failed to load storage database:', err);
      }
    }

    loadData();
  }, []);

  // Trigger background cloud sync whenever clips or projects change
  const triggerCloudSync = async (
    updatedClips = clips, 
    updatedProjects = projects, 
    updatedVoices = voices,
    updatedTranscriptions = transcriptions,
    updatedKeys = apiKeys
  ) => {
    try {
      await fetch('/api/cloud/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clips: updatedClips,
          projects: updatedProjects,
          voices: updatedVoices,
          transcriptions: updatedTranscriptions,
          apiKeys: updatedKeys
        })
      });
    } catch (err) {
      console.warn('Cloud sync background post failed.');
    }
  };

  // 1. Generate TTS Handler
  const handleGenerateSpeech = async (
    settings: TTSGenerationSettings, 
    selectedVoice: VoiceProfile
  ): Promise<AudioClip> => {
    const res = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: settings.text,
        voiceId: selectedVoice.id,
        languageCode: settings.languageCode,
        emotion: settings.emotion,
        emotionIntensity: settings.emotionIntensity,
        speed: settings.speed,
        pitch: settings.pitch,
        stability: settings.stability,
        clarity: settings.clarity,
        format: settings.format,
        geminiVoiceName: selectedVoice.geminiVoiceName || 'Kore'
      })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate speech audio.');
    }

    const base64Audio = data.audioBase64;
    const { dataUrl } = await createAudioFormatBlob(base64Audio, settings.format, data.mimeType);

    const newClip: AudioClip = {
      id: `clip-${Date.now()}`,
      title: settings.text.slice(0, 32) + (settings.text.length > 32 ? '...' : ''),
      text: settings.text,
      audioUrl: dataUrl,
      mimeType: data.mimeType || 'audio/wav',
      format: settings.format,
      durationSeconds: data.durationSeconds || 3.5,
      voiceId: selectedVoice.id,
      voiceName: selectedVoice.name,
      languageCode: settings.languageCode,
      emotion: settings.emotion,
      speed: settings.speed,
      pitch: settings.pitch,
      createdAt: new Date().toLocaleDateString(),
      sizeBytes: data.sizeBytes || 12000,
      wordsCount: data.wordsCount || settings.text.split(/\s+/).length,
      projectFolderId: settings.projectFolderId || 'folder-default',
      isFavorite: false,
      cloudSynced: true
    };

    await offlineDb.saveClip(newClip);
    const newClipsList = [newClip, ...clips];
    setClips(newClipsList);
    triggerCloudSync(newClipsList);

    return newClip;
  };

  // 2. Voice Cloned Handler
  const handleVoiceCloned = async (newVoice: VoiceProfile) => {
    await offlineDb.saveVoice(newVoice);
    const updated = [newVoice, ...voices];
    setVoices(updated);
    triggerCloudSync(clips, projects, updated);
  };

  // 3. Project Folder Handlers
  const handleCreateProject = async (name: string, description: string, color: string) => {
    const newProject: ProjectFolder = {
      id: `folder-${Date.now()}`,
      name,
      description,
      color,
      tags: ['Custom'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await offlineDb.saveProject(newProject);
    const updated = [...projects, newProject];
    setProjects(updated);
    triggerCloudSync(clips, updated);
  };

  const handleDeleteProject = async (id: string) => {
    await offlineDb.deleteProject(id);
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    triggerCloudSync(clips, updated);
  };

  // 4. Clip Favorites & Deletion Handlers
  const handleToggleFavorite = async (id: string) => {
    const updated = clips.map(c => {
      if (c.id === id) {
        const toggled = { ...c, isFavorite: !c.isFavorite };
        offlineDb.saveClip(toggled);
        return toggled;
      }
      return c;
    });
    setClips(updated);
    triggerCloudSync(updated);
  };

  const handleDeleteClip = async (id: string) => {
    await offlineDb.deleteClip(id);
    const updated = clips.filter(c => c.id !== id);
    setClips(updated);
    triggerCloudSync(updated);
  };

  // 5. Transcription Handlers
  const handleSaveTranscription = async (item: TranscriptionItem) => {
    await offlineDb.saveTranscription(item);
    const updated = [item, ...transcriptions];
    setTranscriptions(updated);
    triggerCloudSync(clips, projects, voices, updated);
  };

  const handleDeleteTranscription = async (id: string) => {
    await offlineDb.deleteTranscription(id);
    const updated = transcriptions.filter(t => t.id !== id);
    setTranscriptions(updated);
    triggerCloudSync(clips, projects, voices, updated);
  };

  // 6. API Key Handlers
  const handleCreateApiKey = async (name: string) => {
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name,
      key: `vc_live_${Math.random().toString(36).substr(2, 16)}`,
      createdAt: new Date().toLocaleDateString(),
      lastUsedAt: 'Never',
      requestsCount: 0,
      status: 'active'
    };
    await offlineDb.saveApiKey(newKey);
    const updated = [newKey, ...apiKeys];
    setApiKeys(updated);
    triggerCloudSync(clips, projects, voices, transcriptions, updated);
  };

  const handleRevokeApiKey = async (id: string) => {
    await offlineDb.deleteApiKey(id);
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    triggerCloudSync(clips, projects, voices, transcriptions, updated);
  };

  return (
    <div 
      style={{ fontSize: `${fontSize}px` }}
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-slate-950 text-slate-100' 
          : 'bg-slate-100 text-slate-900'
      } ${highContrast ? 'contrast-125 saturate-150' : ''}`}
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAndroidFrame={isAndroidFrame}
        setIsAndroidFrame={setIsAndroidFrame}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isOnline={isOnline}
        onOpenArchDoc={() => setShowArchDocModal(true)}
        onOpenAccessibility={() => setShowAccessibilityModal(true)}
      />

      {/* App Body Wrapped in Android Device Viewport or Desktop Grid */}
      <main className="p-3 sm:p-6">
        <AndroidFrameWrapper
          isAndroidFrame={isAndroidFrame}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {activeTab === 'tts' && (
            <TTSStudio
              voices={voices}
              projects={projects}
              onGenerate={handleGenerateSpeech}
              onOpenVoiceCloneModal={() => setShowVoiceCloneModal(true)}
              onSaveClipToProject={(clip) => {
                setClips(prev => [clip, ...prev]);
              }}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectDashboard
              projects={projects}
              clips={clips}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onDeleteClip={handleDeleteClip}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              clips={clips}
              onToggleFavorite={handleToggleFavorite}
              onDeleteClip={handleDeleteClip}
            />
          )}

          {activeTab === 'transcription' && (
            <TranscriptionStudio
              transcriptions={transcriptions}
              onSaveTranscription={handleSaveTranscription}
              onDeleteTranscription={handleDeleteTranscription}
            />
          )}

          {activeTab === 'developer' && (
            <ApiDeveloperStudio
              apiKeys={apiKeys}
              onCreateKey={handleCreateApiKey}
              onRevokeKey={handleRevokeApiKey}
            />
          )}
        </AndroidFrameWrapper>
      </main>

      {/* Modals */}
      <VoiceCloningModal
        isOpen={showVoiceCloneModal}
        onClose={() => setShowVoiceCloneModal(false)}
        onVoiceCloned={handleVoiceCloned}
      />

      <ArchitectureDocModal
        isOpen={showArchDocModal}
        onClose={() => setShowArchDocModal(false)}
      />

      <AccessibilityModal
        isOpen={showAccessibilityModal}
        onClose={() => setShowAccessibilityModal(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
      />
    </div>
  );
}
