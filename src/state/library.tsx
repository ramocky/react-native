import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Track } from '../api/music/types';

interface LibraryValue {
  favorites: Track[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (track: Track) => void;
}

const LibraryContext = createContext<LibraryValue | null>(null);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Track[]>([]);

  const toggleFavorite = useCallback((track: Track) => {
    setFavorites(prev => (prev.some(item => item.id === track.id) ? prev.filter(item => item.id !== track.id) : [track, ...prev]));
  }, []);

  const isFavorite = useCallback((id: string) => favorites.some(item => item.id === id), [favorites]);

  const value = useMemo(() => ({ favorites, isFavorite, toggleFavorite }), [favorites, isFavorite, toggleFavorite]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryValue => {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary 必须在 LibraryProvider 内部使用');
  }
  return ctx;
};
