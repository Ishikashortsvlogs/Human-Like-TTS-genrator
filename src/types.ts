export type LanguageCode = 'hi-IN' | 'en-US' | 'en-IN' | 'hinglish' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ja-JP';

export type EmotionType = 
  | 'neutral' 
  | 'cheerful' 
  | 'empathetic' 
  | 'dramatic' 
  | 'whisper' 
  | 'excited' 
  | 'storyteller' 
  | 'newsroom' 
  | 'angry' 
  | 'calm';

export type AudioFormat = 'mp3' | 'wav' | 'aac' | 'ogg';

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  language: string;
  languageCode: LanguageCode;
  description: string;
  avatarUrl: string;
  isCloned?: boolean;
  clonedSampleText?: string;
  clonedDate?: string;
  recommendedEmotion?: EmotionType;
  stabilityDefault: number; // 0 to 1
  clarityDefault: number;   // 0 to 1
  speedDefault: number;     // 0.5 to 2
  pitchDefault: number;     // -12 to 12
  tags: string[];
  geminiVoiceName?: string; // Prebuilt voice mapping: Kore, Puck, Charon, Fenrir, Zephyr
}

export interface TTSGenerationSettings {
  text: string;
  voiceId: string;
  languageCode: LanguageCode;
  emotion: EmotionType;
  emotionIntensity: number; // 0 to 1
  speed: number;            // 0.5 to 2.0
  pitch: number;            // -12 to 12
  stability: number;        // 0 to 1
  clarity: number;          // 0 to 1
  pauseLength: number;      // 0 to 3s
  format: AudioFormat;
  projectFolderId?: string;
}

export interface AudioClip {
  id: string;
  title: string;
  text: string;
  audioUrl: string; // Base64 or Blob URL
  mimeType: string;
  format: AudioFormat;
  durationSeconds: number;
  voiceId: string;
  voiceName: string;
  languageCode: LanguageCode;
  emotion: EmotionType;
  speed: number;
  pitch: number;
  createdAt: string;
  sizeBytes: number;
  wordsCount: number;
  projectFolderId: string;
  isFavorite: boolean;
  cloudSynced: boolean;
  transcript?: string;
}

export interface ProjectFolder {
  id: string;
  name: string;
  description: string;
  color: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptionItem {
  id: string;
  title: string;
  originalFileName: string;
  transcriptText: string;
  detectedLanguage: string;
  emotionSummary: string;
  durationSeconds: number;
  wordsCount: number;
  speakerSegments: Array<{
    speaker: string;
    startTime: string;
    endTime: string;
    text: string;
    emotion?: string;
  }>;
  createdAt: string;
  cloudSynced: boolean;
  audioUrl?: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string;
  requestsCount: number;
  status: 'active' | 'revoked';
}

export interface CloudBackupState {
  lastBackupAt: string | null;
  totalClipsCount: number;
  totalTranscriptionsCount: number;
  totalStorageBytes: number;
  isSyncing: boolean;
}
