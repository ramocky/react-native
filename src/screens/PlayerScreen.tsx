import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SeekBar } from '../components/SeekBar';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/library';
import { usePlayer } from '../state/player';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

const REPEAT_LABEL: Record<string, string> = {
  off: '顺序',
  all: '列表循环',
  one: '单曲循环',
};

const PlayerScreen: React.FC<Props> = ({ navigation }) => {
  const player = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const { current } = player;

  if (!current) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.empty}>还没有播放中的歌曲</Text>
      </View>
    );
  }

  const favorite = isFavorite(current);

  return (
    <View style={styles.container}>
      {current.artwork ? (
        <Image source={{ uri: current.artwork }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverFallback]} />
      )}

      <Text style={styles.title} numberOfLines={2}>
        {current.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {current.artist}
      </Text>

      <View style={styles.seekWrap}>
        <SeekBar position={player.position} duration={player.duration} onSeek={player.seek} />
      </View>

      {player.failed ? <Text style={styles.error}>音频加载失败，请换一首试试</Text> : null}

      <View style={styles.controls}>
        <Pressable onPress={player.cycleRepeat} hitSlop={10} style={styles.side}>
          <Text style={styles.sideText}>{REPEAT_LABEL[player.repeat]}</Text>
        </Pressable>

        <Pressable onPress={player.prev} hitSlop={10} style={styles.transport}>
          <Text style={styles.transportIcon}>⏮</Text>
        </Pressable>

        <Pressable onPress={player.toggle} style={styles.playButton}>
          <Text style={styles.playIcon}>{player.playing ? '❚❚' : '▶'}</Text>
        </Pressable>

        <Pressable onPress={player.next} hitSlop={10} style={styles.transport}>
          <Text style={styles.transportIcon}>⏭</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Queue')} hitSlop={10} style={styles.side}>
          <Text style={styles.sideText}>队列 {player.queue.length}</Text>
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
        <Pressable onPress={() => toggleFavorite(current)} hitSlop={10}>
          <Text style={[styles.favorite, favorite && styles.favoriteActive]}>{favorite ? '♥ 已收藏' : '♡ 收藏'}</Text>
        </Pressable>
        <Text style={styles.source}>{current.source}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  center: {
    justifyContent: 'center',
  },
  empty: {
    color: theme.muted,
    fontSize: 14,
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
    marginTop: 24,
    textAlign: 'center',
  },
  artist: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 8,
  },
  seekWrap: {
    width: '100%',
    marginTop: 20,
  },
  error: {
    color: theme.danger,
    fontSize: 12,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    paddingHorizontal: 4,
  },
  side: {
    width: 76,
    alignItems: 'center',
  },
  sideText: {
    color: theme.muted,
    fontSize: 11,
  },
  transport: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportIcon: {
    color: theme.text,
    fontSize: 20,
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 4,
  },
  favorite: {
    color: theme.muted,
    fontSize: 13,
  },
  favoriteActive: {
    color: theme.accent,
  },
  source: {
    color: theme.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PlayerScreen;