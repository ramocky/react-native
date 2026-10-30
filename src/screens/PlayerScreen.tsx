import React, { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Video from 'react-native-video';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/library';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

const formatTime = (seconds: number): string => {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const PlayerScreen: React.FC<Props> = ({ route }) => {
  const { track } = route.params;
  const { isFavorite, toggleFavorite } = useLibrary();
  const [playing, setPlaying] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(track.duration);
  const [failed, setFailed] = useState('');

  const onProgress = useCallback((event: { currentTime: number }) => {
    setPosition(event.currentTime);
  }, []);

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const favorite = isFavorite(track.id);

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: track.streamUrl }}
        paused={!playing}
        onLoad={(event: { duration: number }) => setDuration(event.duration || track.duration)}
        onProgress={onProgress}
        onEnd={() => {
          setPlaying(false);
          setPosition(0);
        }}
        onError={() => setFailed('音频加载失败，请换一首试试')}
        style={styles.hiddenPlayer}
        playInBackground
      />

      {track.artwork ? <Image source={{ uri: track.artwork }} style={styles.cover} /> : <View style={[styles.cover, styles.coverFallback]} />}

      <Text style={styles.title} numberOfLines={2}>
        {track.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {track.artist}
      </Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      {failed ? <Text style={styles.error}>{failed}</Text> : null}

      <View style={styles.controls}>
        <Pressable onPress={() => toggleFavorite(track)} hitSlop={10}>
          <Text style={[styles.sideButton, favorite && styles.sideButtonActive]}>{favorite ? '♥ 已收藏' : '♡ 收藏'}</Text>
        </Pressable>

        <Pressable onPress={() => setPlaying(prev => !prev)} style={styles.playButton}>
          <Text style={styles.playIcon}>{playing ? '❚❚' : '▶'}</Text>
        </Pressable>

        <Text style={styles.source}>{track.source}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  hiddenPlayer: {
    width: 1,
    height: 1,
    opacity: 0,
  },
  cover: {
    width: 260,
    height: 260,
    borderRadius: 12,
    backgroundColor: theme.surface,
  },
  coverFallback: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  title: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 28,
    textAlign: 'center',
  },
  artist: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 8,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.border,
    marginTop: 32,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.accent,
  },
  timeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    color: theme.muted,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  error: {
    color: theme.danger,
    fontSize: 12,
    marginTop: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 36,
  },
  sideButton: {
    color: theme.muted,
    fontSize: 13,
    width: 80,
  },
  sideButtonActive: {
    color: theme.accent,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: theme.text,
    fontSize: 20,
  },
  source: {
    color: theme.muted,
    fontSize: 11,
    width: 80,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PlayerScreen;
