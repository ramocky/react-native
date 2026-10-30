import { audiusProvider } from './audius';
import { itunesProvider } from './itunes';
import type { MusicProvider, TrackSource } from './types';

export const providers: Record<TrackSource, MusicProvider> = {
  audius: audiusProvider,
  itunes: itunesProvider,
};

/** 默认主源：Audius（免 Key、可完整播放） */
export const DEFAULT_SOURCE: TrackSource = 'audius';

export const getProvider = (source: TrackSource): MusicProvider => providers[source] ?? providers[DEFAULT_SOURCE];

export * from './types';
