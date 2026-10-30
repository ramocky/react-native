import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Track } from '../api/music/types';
import { theme } from '../theme';

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) {
    return '--:--';
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface Props {
  track: Track;
  onPress: () => void;
}

export const TrackRow: React.FC<Props> = ({ track, onPress }) => (
  <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
    {track.artwork ? <Image source={{ uri: track.artwork }} style={styles.cover} /> : <View style={[styles.cover, styles.coverFallback]} />}
    <View style={styles.meta}>
      <Text style={styles.title} numberOfLines={1}>
        {track.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {track.artist}
      </Text>
    </View>
    <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pressed: {
    backgroundColor: theme.surface,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: theme.surface,
  },
  coverFallback: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  meta: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: theme.text,
    fontSize: 15,
  },
  artist: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 3,
  },
  duration: {
    color: theme.muted,
    fontSize: 12,
    marginLeft: 12,
    fontVariant: ['tabular-nums'],
  },
});
