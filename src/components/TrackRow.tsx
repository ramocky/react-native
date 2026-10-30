import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Track } from '../api/music/types';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

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
  onLongPress?: () => void;
}

export const TrackRow: React.FC<Props> = ({ track, onPress, onLongPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  // 封面 URL 会过期，加载失败时退回占位块，避免出现空白方块
  const [artworkBroken, setArtworkBroken] = useState(false);
  const showArtwork = Boolean(track.artwork) && !artworkBroken;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityRole="button"
      accessibilityLabel={`${track.title}，${track.artist}`}>
      {showArtwork ? (
        <Image source={{ uri: track.artwork }} style={styles.cover} onError={() => setArtworkBroken(true)} />
      ) : (
        <View style={[styles.cover, styles.coverFallback]} />
      )}
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
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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