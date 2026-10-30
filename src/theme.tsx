import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { loadJSON, saveJSON, STORAGE_KEYS } from './storage';

export interface Theme {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  danger: string;
  /** 状态栏图标是否用浅色（深色背景下为 true） */
  dark: boolean;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export const darkTheme: Theme = {
  bg: '#0d1117',
  surface: '#161b22',
  border: '#21262d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#58a6ff',
  danger: '#f85149',
  dark: true,
};

export const lightTheme: Theme = {
  bg: '#f6f8fa',
  surface: '#ffffff',
  border: '#d0d7de',
  text: '#1f2328',
  muted: '#59636e',
  accent: '#0969da',
  danger: '#cf222e',
  dark: false,
};

interface ThemeValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeValue>({ theme: darkTheme, mode: 'system', setMode: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let alive = true;
    void loadJSON<ThemeMode>(STORAGE_KEYS.themeMode, 'system').then(saved => {
      if (alive) {
        setModeState(saved);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const setMode = useCallback((value: ThemeMode) => {
    setModeState(value);
    void saveJSON(STORAGE_KEYS.themeMode, value);
  }, []);

  const theme = useMemo(() => {
    const resolved = mode === 'system' ? (scheme === 'light' ? 'light' : 'dark') : mode;
    return resolved === 'light' ? lightTheme : darkTheme;
  }, [mode, scheme]);

  const value = useMemo(() => ({ theme, mode, setMode }), [theme, mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => useContext(ThemeContext).theme;

export const useThemeMode = (): { mode: ThemeMode; setMode: (mode: ThemeMode) => void } => {
  const { mode, setMode } = useContext(ThemeContext);
  return { mode, setMode };
};

export const nextThemeMode = (mode: ThemeMode): ThemeMode => (mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system');

export const THEME_MODE_LABEL: Record<ThemeMode, string> = {
  system: '跟系统',
  light: '浅色',
  dark: '深色',
};