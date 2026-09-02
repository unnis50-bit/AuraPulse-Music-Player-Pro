// IndexedDB Audio & Song Storage Service for Persistent Offline Music Playback
import { Song } from '../types';

const DB_NAME = 'AuraPulseDB';
const DB_VERSION = 1;
const STORE_SONGS = 'songs_metadata';
const STORE_AUDIO_BLOBS = 'audio_blobs';

class DBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_SONGS)) {
          db.createObjectStore(STORE_SONGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_AUDIO_BLOBS)) {
          db.createObjectStore(STORE_AUDIO_BLOBS);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Save multiple songs and their audio Blobs to IndexedDB
  public async saveSongsWithBlobs(songs: Song[], blobsMap?: Map<string, Blob>): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction([STORE_SONGS, STORE_AUDIO_BLOBS], 'readwrite');
      const songStore = tx.objectStore(STORE_SONGS);
      const blobStore = tx.objectStore(STORE_AUDIO_BLOBS);

      for (const song of songs) {
        // Strip out transient blob: URLs from metadata when saving
        const isBlobUrl = song.audioUrl?.startsWith('blob:');
        const songToSave = {
          ...song,
          audioUrl: isBlobUrl ? '' : song.audioUrl,
        };
        songStore.put(songToSave);

        // If a blob is provided for this song, save it
        if (blobsMap && blobsMap.has(song.id)) {
          const blob = blobsMap.get(song.id)!;
          blobStore.put(blob, song.id);
        }
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Error saving to IndexedDB:', e);
    }
  }

  // Save a single audio blob
  public async saveAudioBlob(songId: string, blob: Blob): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_AUDIO_BLOBS, 'readwrite');
      tx.objectStore(STORE_AUDIO_BLOBS).put(blob, songId);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Error saving audio blob:', e);
    }
  }

  // Load all songs from IndexedDB, rehydrating blob URLs
  public async loadAllSongs(): Promise<Song[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction([STORE_SONGS, STORE_AUDIO_BLOBS], 'readonly');
      const songStore = tx.objectStore(STORE_SONGS);
      const blobStore = tx.objectStore(STORE_AUDIO_BLOBS);

      const songsReq = songStore.getAll();
      const rawSongs: Song[] = await new Promise((resolve, reject) => {
        songsReq.onsuccess = () => resolve(songsReq.result || []);
        songsReq.onerror = () => reject(songsReq.error);
      });

      if (rawSongs.length === 0) return [];

      const hydratedSongs: Song[] = [];

      for (const song of rawSongs) {
        // If it doesn't have an online URL, check if we have a stored blob in IndexedDB
        if (!song.audioUrl || song.audioUrl.startsWith('blob:')) {
          const blobReq = blobStore.get(song.id);
          const blob: Blob | undefined = await new Promise((resolve) => {
            blobReq.onsuccess = () => resolve(blobReq.result);
            blobReq.onerror = () => resolve(undefined);
          });

          if (blob) {
            const activeUrl = URL.createObjectURL(blob);
            hydratedSongs.push({
              ...song,
              audioUrl: activeUrl,
            });
            continue;
          }
        }
        hydratedSongs.push(song);
      }

      return hydratedSongs;
    } catch (e) {
      console.warn('Error loading from IndexedDB:', e);
      return [];
    }
  }

  // Get single audio blob by songId
  public async getAudioBlob(songId: string): Promise<Blob | undefined> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_AUDIO_BLOBS, 'readonly');
      const blobStore = tx.objectStore(STORE_AUDIO_BLOBS);
      const req = blobStore.get(songId);
      return await new Promise<Blob | undefined>((resolve) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      });
    } catch {
      return undefined;
    }
  }

  // Delete a song and its audio blob
  public async deleteSong(songId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction([STORE_SONGS, STORE_AUDIO_BLOBS], 'readwrite');
      tx.objectStore(STORE_SONGS).delete(songId);
      tx.objectStore(STORE_AUDIO_BLOBS).delete(songId);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Error deleting from IndexedDB:', e);
    }
  }

  // Clear all stored data
  public async clearAll(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction([STORE_SONGS, STORE_AUDIO_BLOBS], 'readwrite');
      tx.objectStore(STORE_SONGS).clear();
      tx.objectStore(STORE_AUDIO_BLOBS).clear();
    } catch (e) {
      console.warn('Error clearing IndexedDB:', e);
    }
  }
}

export const dbStorage = new DBStorage();
