import type { Track } from '../api/music/types';

export type RootStackParamList = {
  Home: undefined;
  Player: { track: Track };
  Library: undefined;
};
