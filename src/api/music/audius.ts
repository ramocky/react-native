import type { MusicProvider, Track } from './types';

const BASE = 'https://api.audius.co';
const APP_NAME = 'RamockyMusic';

interface AudiusApiTrack {
  id: string;
  title: string;
  duration?: number;
  artwork?: Record<string, string>;
  user?: { name?: string };
}

const toTrack = (raw: AudiusApiTrack): Track => ({
  id: raw.id,
  title: raw.title,
  artist: raw.user?.name ?? 'Unknown',
  artwork: raw.artwork?.['480x480'] ?? raw.artwork?.['150x150'] ?? '',
  duration: raw.duration ?? 0,
  streamUrl: `${BASE}/v1/tracks/${raw.id}/stream?app_name=${APP_NAME}`,
  source: 'audius',
});

const request = async (path: string): Promise<AudiusApiTrack[]> => {
  const separator = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${separator}app_name=${APP_NAME}`);
  if (!res.ok) {
    throw new Error(`Audius 请求失败：${res.status}`);
  }
  const json = (await res.json()) as { data?: AudiusApiTrack[] };
  return json.data ?? [];
};

export const audiusProvider: MusicProvider = {
  id: 'audius',
  label: 'Audius',
  trending: async (limit = 20) => (await request(`/v1/tracks/trending?limit=${limit}`)).map(toTrack),
  search: async (query, limit = 20) =>
    (await request(`/v1/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}`)).map(toTrack),
};
