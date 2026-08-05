import { VoiceProfile } from '../types';

export const DEFAULT_VOICES: VoiceProfile[] = [
  {
    id: 'voice-aarav',
    name: 'Aarav (आरव)',
    gender: 'male',
    accent: 'Indian Hindi & Hinglish',
    language: 'Hindi / English',
    languageCode: 'hi-IN',
    description: 'Deep, warm, and natural conversational Hindi & Hinglish voice. Perfect for podcasts, news, and storytelling.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    stabilityDefault: 0.75,
    clarityDefault: 0.85,
    speedDefault: 1.0,
    pitchDefault: 0,
    recommendedEmotion: 'empathetic',
    tags: ['Hindi', 'Hinglish', 'Narrative', 'Warm', 'Podcast'],
    geminiVoiceName: 'Fenrir'
  },
  {
    id: 'voice-ananya',
    name: 'Ananya (अनन्या)',
    gender: 'female',
    accent: 'Indian Hindi',
    language: 'Hindi / Hinglish',
    languageCode: 'hi-IN',
    description: 'Clear, expressive, and cheerful female Hindi voice. Ideal for YouTube audio, audiobooks, and ads.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    stabilityDefault: 0.8,
    clarityDefault: 0.9,
    speedDefault: 1.0,
    pitchDefault: 2,
    recommendedEmotion: 'cheerful',
    tags: ['Hindi', 'Cheerful', 'Audiobooks', 'Commercial'],
    geminiVoiceName: 'Kore'
  },
  {
    id: 'voice-rishi',
    name: 'Rishi (ऋषि)',
    gender: 'male',
    accent: 'Energetic Hinglish',
    language: 'Hinglish / English',
    languageCode: 'hinglish',
    description: 'Upbeat, friendly youth voice fluent in Hinglish. Perfect for tech reviews, vlogs, and reels.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    stabilityDefault: 0.7,
    clarityDefault: 0.8,
    speedDefault: 1.05,
    pitchDefault: 1,
    recommendedEmotion: 'excited',
    tags: ['Hinglish', 'Youth', 'Vlog', 'Social Media', 'Tech'],
    geminiVoiceName: 'Puck'
  },
  {
    id: 'voice-priya',
    name: 'Priya (प्रिया)',
    gender: 'female',
    accent: 'Indian English',
    language: 'English (India)',
    languageCode: 'en-IN',
    description: 'Professional, smooth Indian English corporate and educational tone.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    stabilityDefault: 0.85,
    clarityDefault: 0.95,
    speedDefault: 1.0,
    pitchDefault: 0,
    recommendedEmotion: 'neutral',
    tags: ['Indian English', 'Corporate', 'E-Learning', 'News'],
    geminiVoiceName: 'Zephyr'
  },
  {
    id: 'voice-zephyr',
    name: 'Zephyr',
    gender: 'female',
    accent: 'US Natural',
    language: 'English (US)',
    languageCode: 'en-US',
    description: 'Silky, calming US female voice with rich dynamic modulation.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    stabilityDefault: 0.75,
    clarityDefault: 0.9,
    speedDefault: 1.0,
    pitchDefault: 0,
    recommendedEmotion: 'calm',
    tags: ['US English', 'Smooth', 'Meditation', 'Narrator'],
    geminiVoiceName: 'Zephyr'
  },
  {
    id: 'voice-charon',
    name: 'Charon',
    gender: 'male',
    accent: 'Deep Authoritative US',
    language: 'English (US)',
    languageCode: 'en-US',
    description: 'Resonant, cinematic deep voice for trailers, documentaries, and news commentary.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    stabilityDefault: 0.9,
    clarityDefault: 0.88,
    speedDefault: 0.95,
    pitchDefault: -4,
    recommendedEmotion: 'dramatic',
    tags: ['US English', 'Deep', 'Cinematic', 'Documentary'],
    geminiVoiceName: 'Charon'
  }
];

export const INITIAL_PROJECT_FOLDERS = [
  {
    id: 'folder-default',
    name: 'General Clips',
    description: 'Default folder for miscellaneous generated voice clips.',
    color: '#3b82f6',
    tags: ['General', 'Drafts'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'folder-youtube',
    name: 'YouTube Shorts & Reels',
    description: 'Voiceovers for short videos, Instagram reels, and viral content.',
    color: '#ef4444',
    tags: ['YouTube', 'Shorts', 'Hinglish'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'folder-podcasts',
    name: 'Hindi Podcasts & Stories',
    description: 'Longer format stories, interview intros, and podcast narration.',
    color: '#8b5cf6',
    tags: ['Podcast', 'Storytelling', 'Hindi'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
