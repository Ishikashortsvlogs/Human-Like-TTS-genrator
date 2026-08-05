import { AudioClip, ProjectFolder, VoiceProfile, TranscriptionItem, ApiKeyItem } from '../types';
import { DEFAULT_VOICES, INITIAL_PROJECT_FOLDERS } from '../data/voices';

const DB_NAME = 'VoiceCraftStudioDB';
const DB_VERSION = 1;

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('clips')) {
          db.createObjectStore('clips', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('voices')) {
          db.createObjectStore('voices', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transcriptions')) {
          db.createObjectStore('transcriptions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('apikeys')) {
          db.createObjectStore('apikeys', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // Clips
  async getAllClips(): Promise<AudioClip[]> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('clips', 'readonly');
      const store = tx.objectStore('clips');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async saveClip(clip: AudioClip): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('clips', 'readwrite');
      const store = tx.objectStore('clips');
      const req = store.put(clip);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteClip(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('clips', 'readwrite');
      const store = tx.objectStore('clips');
      store.delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  // Projects
  async getAllProjects(): Promise<ProjectFolder[]> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        if (list.length === 0) {
          // Seed defaults
          this.seedInitialProjects().then(() => resolve(INITIAL_PROJECT_FOLDERS));
        } else {
          resolve(list);
        }
      };
      req.onerror = () => resolve(INITIAL_PROJECT_FOLDERS);
    });
  }

  async seedInitialProjects(): Promise<void> {
    for (const proj of INITIAL_PROJECT_FOLDERS) {
      await this.saveProject(proj);
    }
  }

  async saveProject(project: ProjectFolder): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('projects', 'readwrite');
      const store = tx.objectStore('projects');
      store.put(project);
      tx.oncomplete = () => resolve();
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('projects', 'readwrite');
      const store = tx.objectStore('projects');
      store.delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  // Voice Profiles
  async getAllVoices(): Promise<VoiceProfile[]> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('voices', 'readonly');
      const store = tx.objectStore('voices');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        // Combine default voices with user-cloned voices
        const clonedVoices = list.filter((v: VoiceProfile) => v.isCloned);
        resolve([...DEFAULT_VOICES, ...clonedVoices]);
      };
      req.onerror = () => resolve(DEFAULT_VOICES);
    });
  }

  async saveVoice(voice: VoiceProfile): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('voices', 'readwrite');
      const store = tx.objectStore('voices');
      store.put(voice);
      tx.oncomplete = () => resolve();
    });
  }

  // Transcriptions
  async getAllTranscriptions(): Promise<TranscriptionItem[]> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('transcriptions', 'readonly');
      const store = tx.objectStore('transcriptions');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async saveTranscription(item: TranscriptionItem): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('transcriptions', 'readwrite');
      const store = tx.objectStore('transcriptions');
      store.put(item);
      tx.oncomplete = () => resolve();
    });
  }

  async deleteTranscription(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('transcriptions', 'readwrite');
      const store = tx.objectStore('transcriptions');
      store.delete(id);
      tx.oncomplete = () => resolve();
    });
  }

  // API Keys
  async getAllApiKeys(): Promise<ApiKeyItem[]> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('apikeys', 'readonly');
      const store = tx.objectStore('apikeys');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async saveApiKey(key: ApiKeyItem): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('apikeys', 'readwrite');
      const store = tx.objectStore('apikeys');
      store.put(key);
      tx.oncomplete = () => resolve();
    });
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('apikeys', 'readwrite');
      const store = tx.objectStore('apikeys');
      store.delete(id);
      tx.oncomplete = () => resolve();
    });
  }
}

export const offlineDb = new OfflineDB();
