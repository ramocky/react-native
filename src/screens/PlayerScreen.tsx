import React, { useEffect, useState } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
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

const RATES = [0.75, 1, 1.25, 1.5, 2];
/** 定时关闭的可选分钟数，0 表示不开启 */
const SLEEP_MINUTES = [0, 15, 30, 60];

const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const PlayerScreen: React.FC<Props> = ({ navigation }) => {
  const player = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [sleepStep, setSleepStep] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const { current } = player;

  useEffect(() => {
    setRemaining(SLEEP_MINUTES[sleepStep] * 60);
  }, [sleepStep]);

  useEffect(() => {
    if (SLEEP_MINUTES[sleepStep] === 0) {
      return;
    }
    if (remaining <= 0) {
      // 倒计时结束：关闭定时并暂停播放
      setSleepStep(0);
      if (player.playing) {
        player.toggle();
      }
      return;
    }
    const timer = setTimeout(() => setRemaining(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
    // player 每秒都会变化，只关心 playing 的即时值
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, sleepStep]);

  if (!current) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.empty}>还没有播放中的歌曲</Text>
      </View>
    );
  }

  const favorite = isFavorite(current);

  const cycleRate = () => {
    const next = (RATES.indexOf(player.rate) + 1) % RATES.length;
    player.setRate(RATES[next]);
  };

  const cycleSleep = () => setSleepStep(prev => (prev + 1) % SLEEP_MINUTES.length);

  const share = () => {
    void Share.share({
      message: `正在听 ${current.title} - ${current.artist}\n${current.streamUrl}`,
    });
  };

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

      <View style={styles.actions}>
        <Pressable onPress={() => toggleFavorite(current)} hitSlop={8} style={styles.action}>
          <Text style={[styles.actionText, favorite && styles.actionActive]}>{favorite ? '♥ 已收藏' : '♡ 收藏'}</Text>
        </Pressable>
        <Pressable onPress={cycleRate} hitSlop={8} style={styles.action}>
          <Text style={[styles.actionText, player.rate !== 1 && styles.actionActive]}>{player.rate}x</Text>
        </Pressable>
        <Pressable onPress={cycleSleep} hitSlop={8} style={styles.action}>
          <Text style={[styles.actionText, sleepStep > 0 && styles.actionActive]}>
            {sleepStep > 0 ? `定时 ${formatCountdown(remaining)}` : '定时'}
          </Text>
        </Pressable>
        <Pressable onPress={share} hitSlop={8} style={styles.action}>
          <Text style={styles.actionText}>分享</Text>
        </Pressable>
      </View>

      <Text style={styles.source}>{current.source}</Text>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 4,
  },
  action: {
    paddingVertical: 6,
  },
  actionText: {
    color: theme.muted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  actionActive: {
    color: theme.accent,
  },
  source: {
    color: theme.muted,
    fontSize: 11,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PlayerScreen;