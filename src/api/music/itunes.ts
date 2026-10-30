import type { MusicProvider, Track } from './types';

const BASE = 'https://itunes.apple.com';
/** iTunes 没有热门榜单接口，用固定关键词兜底 */
const FALLBACK_TERM = 'top hits';

interface ItunesApiTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
  previewUrl?: string;
}

const toTrack = (raw: ItunesApiTrack): Track => ({
  id: String(raw.trackId),
  title: raw.trackName,
  artist: raw.artistName,
  artwork: (raw.artworkUrl100 ?? '').replace('100x100', '600x600'),
  duration: Math.round((raw.trackTimeMillis ?? 0) / 1000),
  streamUrl: raw.previewUrl ?? '',
  source: 'itunes',
});

const search = async (term: string, limit: number, offset = 0): Promise<Track[]> => {
  const url = `${BASE}/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`iTunes 请求失败：${res.status}`);
  }
  const json = (await res.json()) as { results?: ItunesApiTrack[] };
  return (json.results ?? []).filter(item => item.previewUrl).map(toTrack);
};

export const itunesProvider: MusicProvider = {
  id: 'itunes',
  label: 'iTunes（30 秒试听）',
  trending: async (limit = 20, offset = 0) => search(FALLBACK_TERM, limit, offset),
  search: (query, limit = 20, offset = 0) => search(query, limit, offset),
};
