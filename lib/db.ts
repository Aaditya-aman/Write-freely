import { useEffect, useState, useCallback } from 'react';

interface HistoryEntry {
  text: string;
  timestamp: number;
}

// Use indexedDB instead of SQLite for better browser compatibility
const DB_NAME = 'writing-app';
const STORE_NAME = 'history';
const DB_VERSION = 1;

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const addRequest = store.add(entry);
    
    addRequest.onsuccess = () => {
      // Keep only the most recent 10 entries
      const getAllRequest = store.index('timestamp').openCursor(null, 'prev');
      let count = 0;
      
      getAllRequest.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result;
        if (cursor) {
          count++;
          if (count > 10) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
    };
    
    addRequest.onerror = () => {
      reject(new Error('Failed to save entry'));
    };
  });
}

export async function deleteHistoryEntry(timestamp: number): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const deleteRequest = store.delete(timestamp);
    
    deleteRequest.onsuccess = () => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
    };
    
    deleteRequest.onerror = () => {
      reject(new Error('Failed to delete entry'));
    };
  });
}

export async function clearAllHistory(): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      transaction.oncomplete = () => {
        db.close();
        // Also clear localStorage backup
        localStorage.removeItem('writing-history');
        resolve();
      };
    };
    
    clearRequest.onerror = () => {
      reject(new Error('Failed to clear history'));
    };
  });
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.index('timestamp').getAll();
    
    request.onsuccess = () => {
      const entries = request.result;
      // Sort by most recent first
      entries.sort((a, b) => b.timestamp - a.timestamp);
      db.close();
      resolve(entries);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to load history'));
    };
  });
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadHistoryData = useCallback(async () => {
    setIsLoading(true);
    try {
      const entries = await loadHistory();
      setHistory(entries);
    } catch (error) {
      console.error('Error loading history:', error);
      // Fallback to localStorage if indexedDB fails
      try {
        const savedHistory = localStorage.getItem('writing-history');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);
  
  const addEntry = async (entry: HistoryEntry) => {
    try {
      await saveHistoryEntry(entry);
      setHistory(prev => [entry, ...prev.slice(0, 9)]);
      
      // Also save to localStorage as fallback
      const updatedHistory = [entry, ...history].slice(0, 10);
      localStorage.setItem('writing-history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving history entry:', error);
    }
  };
  
  const deleteEntry = async (timestamp: number) => {
    try {
      await deleteHistoryEntry(timestamp);
      setHistory(prev => prev.filter(entry => entry.timestamp !== timestamp));
      
      // Update localStorage backup
      const updatedHistory = history.filter(entry => entry.timestamp !== timestamp);
      localStorage.setItem('writing-history', JSON.stringify(updatedHistory));
      
      return true;
    } catch (error) {
      console.error('Error deleting history entry:', error);
      return false;
    }
  };
  
  const clearHistory = async () => {
    try {
      await clearAllHistory();
      setHistory([]);
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  };
  
  return { history, isLoading, addEntry, deleteEntry, clearHistory, refreshHistory: loadHistoryData };
} 