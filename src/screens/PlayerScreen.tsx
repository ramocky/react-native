import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SeekBar } from '../components/SeekBar';
import { ClockIcon, HeartIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, ShareIcon } from '../components/icons';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/library';
import { usePlayer } from '../state/player';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

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
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const player = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const [sleepStep, setSleepStep] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [artworkBroken, setArtworkBroken] = useState(false);
  const { current } = player;

  useEffect(() => {
    setRemaining(SLEEP_MINUTES[sleepStep] * 60);
  }, [sleepStep]);

  useEffect(() => {
    setArtworkBroken(false);
  }, [current?.source, current?.id]);

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
    // player 每秒都会变化，这里只关心播放状态的即时值
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
  const showArtwork = Boolean(current.artwork) && !artworkBroken;

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
      {showArtwork ? (
        <Image source={{ uri: current.artwork }} style={styles.cover} onError={() => setArtworkBroken(true)} />
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

      {player.failed ? (
        <View style={styles.errorRow}>
          <Text style={styles.error}>音频加载失败</Text>
          <Pressable onPress={player.retry} hitSlop={8} accessibilityRole="button" accessibilityLabel="重试播放">
            <Text style={styles.retry}>重试</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.controls}>
        <Pressable
          onPress={player.cycleRepeat}
          hitSlop={10}
          style={styles.side}
          accessibilityRole="button"
          accessibilityLabel={`循环模式：${REPEAT_LABEL[player.repeat]}`}>
          <Text style={styles.sideText}>{REPEAT_LABEL[player.repeat]}</Text>
        </Pressable>

        <Pressable onPress={player.prev} hitSlop={10} style={styles.transport} accessibilityRole="button" accessibilityLabel="上一首">
          <PrevIcon />
        </Pressable>

        <Pressable
          onPress={player.toggle}
          style={styles.playButton}
          accessibilityRole="button"
          accessibilityLabel={player.playing ? '暂停' : '播放'}>
          {player.playing ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
        </Pressable>

        <Pressable onPress={player.next} hitSlop={10} style={styles.transport} accessibilityRole="button" accessibilityLabel="下一首">
          <NextIcon />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Queue')}
          hitSlop={10}
          style={styles.side}
          accessibilityRole="button"
          accessibilityLabel={`播放队列，共 ${player.queue.length} 首`}>
          <Text style={styles.sideText}>队列 {player.queue.length}</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleFavorite(current)}
          hitSlop={8}
          style={styles.action}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          accessibilityLabel={favorite ? '取消收藏' : '收藏'}>
          <View style={styles.actionRow}>
            <HeartIcon color={favorite ? theme.accent : theme.muted} filled={favorite} />
            <Text style={[styles.actionText, favorite && styles.actionActive]}>{favorite ? '已收藏' : '收藏'}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={cycleRate}
          hitSlop={8}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={`播放倍速 ${player.rate} 倍`}>
          <Text style={[styles.actionText, player.rate !== 1 && styles.actionActive]}>{player.rate}x</Text>
        </Pressable>

        <Pressable
          onPress={cycleSleep}
          hitSlop={8}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={sleepStep > 0 ? `定时关闭，剩余 ${formatCountdown(remaining)}` : '定时关闭'}>
          <View style={styles.actionRow}>
            <ClockIcon color={sleepStep > 0 ? theme.accent : theme.muted} />
            <Text style={[styles.actionText, sleepStep > 0 && styles.actionActive]}>
              {sleepStep > 0 ? formatCountdown(remaining) : '定时'}
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={share} hitSlop={8} style={styles.action} accessibilityRole="button" accessibilityLabel="分享">
          <View style={styles.actionRow}>
            <ShareIcon color={theme.muted} />
            <Text style={styles.actionText}>分享</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.source}>{current.source}</Text>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 8,
    },
    error: {
      color: theme.danger,
      fontSize: 12,
    },
    retry: {
      color: theme.accent,
      fontSize: 12,
      textDecorationLine: 'underline',
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
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
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