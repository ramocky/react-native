import AsyncStorage from '@react-native-async-storage/async-storage';

/** 读取 JSON，失败时返回兜底值，避免存储损坏导致启动崩溃 */
export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 持久化失败不影响主流程
  }
}

export const STORAGE_KEYS = {
  favorites: 'library:favorites',
  recent: 'library:recent',
  searchHistory: 'search:history',
  themeMode: 'settings:theme-mode',
} as const;