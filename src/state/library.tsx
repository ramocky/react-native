import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Track } from '../api/music/types';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../storage';

const MAX_RECENT = 30;
const MAX_HISTORY = 10;

interface LibraryValue {
  favorites: Track[];
  recent: Track[];
  history: string[];
  ready: boolean;
  isFavorite: (track: Track) => boolean;
  toggleFavorite: (track: Track) => void;
  addRecent: (track: Track) => void;
  addHistory: (keyword: string) => void;
  clearHistory: () => void;
}

const LibraryContext = createContext<LibraryValue | null>(null);

const sameTrack = (a: Track, b: Track) => a.source === b.source && a.id === b.id;

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [recent, setRecent] = useState<Track[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      loadJSON<Track[]>(STORAGE_KEYS.favorites, []),
      loadJSON<Track[]>(STORAGE_KEYS.recent, []),
      loadJSON<string[]>(STORAGE_KEYS.searchHistory, []),
    ]).then(([fav, rec, his]) => {
      if (!alive) {
        return;
      }
      setFavorites(fav);
      setRecent(rec);
      setHistory(his);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // ready 之前不回写，避免用初始空数组覆盖已存储的数据
    if (ready) {
      void saveJSON(STORAGE_KEYS.favorites, favorites);
    }
  }, [favorites, ready]);

  useEffect(() => {
    if (ready) {
      void saveJSON(STORAGE_KEYS.recent, recent);
    }
  }, [recent, ready]);

  useEffect(() => {
    if (ready) {
      void saveJSON(STORAGE_KEYS.searchHistory, history);
    }
  }, [history, ready]);

  const isFavorite = useCallback((track: Track) => favorites.some(item => sameTrack(item, track)), [favorites]);

  const toggleFavorite = useCallback((track: Track) => {
    setFavorites(prev => (prev.some(item => sameTrack(item, track)) ? prev.filter(item => !sameTrack(item, track)) : [track, ...prev]));
  }, []);

  const addRecent = useCallback((track: Track) => {
    setRecent(prev => [track, ...prev.filter(item => !sameTrack(item, track))].slice(0, MAX_RECENT));
  }, []);

  const addHistory = useCallback((keyword: string) => {
    const word = keyword.trim();
    if (!word) {
      return;
    }
    setHistory(prev => [word, ...prev.filter(item => item !== word)].slice(0, MAX_HISTORY));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo(
    () => ({ favorites, recent, history, ready, isFavorite, toggleFavorite, addRecent, addHistory, clearHistory }),
    [favorites, recent, history, ready, isFavorite, toggleFavorite, addRecent, addHistory, clearHistory],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryValue => {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary 必须在 LibraryProvider 内部使用');
  }
  return ctx;
};