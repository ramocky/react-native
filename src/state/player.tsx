import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import type { Track } from '../api/music/types';
import { useLibrary } from './library';

export type RepeatMode = 'off' | 'all' | 'one';

/** 只暴露操作，引用恒定：列表页订阅它不会因播放进度而变化 */
interface PlayerActions {
  play: (track: Track, queue?: Track[]) => void;
  jumpTo: (index: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  cycleRepeat: () => void;
  setRate: (rate: number) => void;
  clearQueue: () => void;
  removeAt: (index: number) => void;
  retry: () => void;
  /** 定时关闭：0 表示关闭，其余为分钟数 */
  setSleepMinutes: (minutes: number) => void;
}

/** 播放状态：播放进度每秒变化，只给播放页/队列页订阅 */
interface PlayerState {
  queue: Track[];
  index: number;
  current: Track | null;
  playing: boolean;
  position: number;
  duration: number;
  repeat: RepeatMode;
  rate: number;
  failed: boolean;
  reloadToken: number;
  /** 当前选择的定时关闭分钟数，0 表示未开启 */
  sleepMinutes: number;
  /** 定时关闭的到期时间戳（毫秒），null 表示未开启 */
  sleepDeadline: number | null;
}

export type PlayerValue = PlayerActions & PlayerState;

const ActionsContext = createContext<PlayerActions | null>(null);
const StateContext = createContext<PlayerState | null>(null);

/** 播放器实例只在内部使用，对外只暴露 seek 需要的最小接口 */
interface VideoHandle {
  seek: (seconds: number) => void;
}

/** 单曲连续失败达到该次数后不再自动跳过，避免整个列表被快速刷完 */
const MAX_AUTO_SKIP = 3;

const trackKey = (track: Track | null): string => (track ? `${track.source}-${track.id}` : '');

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addRecent } = useLibrary();
  const videoRef = useRef<VideoHandle | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState<RepeatMode>('all');
  const [rate, setRateState] = useState(1);
  const [failed, setFailed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [sleepMinutes, setSleepMinutesState] = useState(0);
  const [sleepDeadline, setSleepDeadline] = useState<number | null>(null);

  const current = index >= 0 && index < queue.length ? queue[index] : null;

  // actions 通过 ref 读取最新状态，这样操作函数的引用可以保持恒定
  const queueRef = useRef(queue);
  const indexRef = useRef(index);
  const repeatRef = useRef(repeat);
  const positionRef = useRef(position);
  const durationRef = useRef(duration);
  const currentRef = useRef(current);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failCountRef = useRef<Record<string, number>>({});
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  queueRef.current = queue;
  indexRef.current = index;
  repeatRef.current = repeat;
  positionRef.current = position;
  durationRef.current = duration;
  currentRef.current = current;

  useEffect(() => {
    // 换曲后先按曲目自带时长展示，onLoad 拿到真实时长后再覆盖
    if (current) {
      setDuration(current.duration || 0);
      addRecent(current);
    }
  }, [current, addRecent]);

  useEffect(
    () => () => {
      if (skipTimerRef.current) {
        clearTimeout(skipTimerRef.current);
      }
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
    },
    [],
  );

  const play = useCallback((track: Track, list?: Track[]) => {
    const nextQueue = list && list.length > 0 ? list : [track];
    const at = nextQueue.findIndex(item => item.source === track.source && item.id === track.id);
    failCountRef.current[trackKey(track)] = 0;
    setQueue(nextQueue);
    setIndex(at >= 0 ? at : 0);
    setPosition(0);
    setDuration(track.duration);
    setFailed(false);
    setPlaying(true);
  }, []);

  const jumpTo = useCallback((target: number) => {
    const length = queueRef.current.length;
    if (target < 0 || target >= length) {
      return;
    }
    const targetTrack = queueRef.current[target];
    failCountRef.current[trackKey(targetTrack)] = 0;
    setIndex(target);
    setPosition(0);
    setFailed(false);
    setPlaying(true);
  }, []);

  const next = useCallback(() => {
    const length = queueRef.current.length;
    if (length === 0) {
      return;
    }
    if (indexRef.current + 1 < length) {
      setIndex(indexRef.current + 1);
    } else if (repeatRef.current === 'all') {
      setIndex(0);
    } else {
      setPlaying(false);
      return;
    }
    setPosition(0);
    setFailed(false);
    setPlaying(true);
  }, []);

  const prev = useCallback(() => {
    const length = queueRef.current.length;
    if (length === 0) {
      return;
    }
    // 播放超过 3 秒时，「上一首」先回到本曲开头
    if (positionRef.current > 3) {
      videoRef.current?.seek(0);
      setPosition(0);
      return;
    }
    if (indexRef.current > 0) {
      setIndex(indexRef.current - 1);
    } else if (repeatRef.current === 'all') {
      setIndex(length - 1);
    }
    setPosition(0);
    setFailed(false);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => setPlaying(value => !value), []);

  const seek = useCallback((seconds: number) => {
    const total = durationRef.current;
    const target = Math.max(0, total > 0 ? Math.min(seconds, total) : seconds);
    videoRef.current?.seek(target);
    setPosition(target);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat(value => (value === 'off' ? 'all' : value === 'all' ? 'one' : 'off'));
  }, []);

  const setRate = useCallback((value: number) => setRateState(value), []);

  const setSleepMinutes = useCallback((minutes: number) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (minutes <= 0) {
      setSleepMinutesState(0);
      setSleepDeadline(null);
      return;
    }
    // 记绝对到期时间而不是递减计数：离开播放页或 JS 线程被挂起后仍按真实时间到点
    const deadline = Date.now() + minutes * 60000;
    setSleepMinutesState(minutes);
    setSleepDeadline(deadline);
    sleepTimerRef.current = setTimeout(() => {
      sleepTimerRef.current = null;
      setSleepMinutesState(0);
      setSleepDeadline(null);
      setPlaying(false);
    }, minutes * 60000);
  }, []);

  const clearQueue = useCallback(() => {
    setPlaying(false);
    setQueue([]);
    setIndex(-1);
    setPosition(0);
    setDuration(0);
    setFailed(false);
  }, []);

  const removeAt = useCallback(
    (at: number) => {
      const list = queueRef.current;
      if (at < 0 || at >= list.length) {
        return;
      }
      const rest = list.filter((_, idx) => idx !== at);
      if (rest.length === 0) {
        clearQueue();
        return;
      }
      const active = indexRef.current;
      setQueue(rest);
      if (at < active) {
        // 删的是当前曲之前的，索引整体前移一位
        setIndex(active - 1);
        return;
      }
      if (at > active) {
        return;
      }
      // 删掉正在播的：从同一位置续播，已在末尾则回落到最后一首
      setIndex(Math.min(at, rest.length - 1));
      setPosition(0);
      setFailed(false);
      setPlaying(true);
    },
    [clearQueue],
  );

  const retry = useCallback(() => {
    setFailed(false);
    setPosition(0);
    setPlaying(true);
    setReloadToken(value => value + 1);
  }, []);

  const nextRef = useRef(next);
  nextRef.current = next;

  const handleError = useCallback(() => {
    const track = currentRef.current;
    const key = trackKey(track);
    const count = (failCountRef.current[key] ?? 0) + 1;
    failCountRef.current[key] = count;
    setFailed(true);
    if (skipTimerRef.current) {
      clearTimeout(skipTimerRef.current);
    }
    // 单曲循环时不自动跳过，否则会绕开用户的循环意图
    if (count < MAX_AUTO_SKIP && queueRef.current.length > 1 && repeatRef.current !== 'one') {
      skipTimerRef.current = setTimeout(() => nextRef.current(), 800);
      return;
    }
    setPlaying(false);
  }, []);

  const handleLoad = useCallback(
    (event: { duration: number }) => {
      failCountRef.current[trackKey(currentRef.current)] = 0;
      setDuration(event.duration || currentRef.current?.duration || 0);
      setFailed(false);
    },
    [],
  );

  const handleEnd = useCallback(() => {
    if (repeatRef.current === 'one') {
      videoRef.current?.seek(0);
      setPosition(0);
      return;
    }
    nextRef.current();
  }, []);

  const actions = useMemo<PlayerActions>(
    () => ({ play, jumpTo, toggle, next, prev, seek, cycleRepeat, setRate, clearQueue, removeAt, retry, setSleepMinutes }),
    [play, jumpTo, toggle, next, prev, seek, cycleRepeat, setRate, clearQueue, removeAt, retry, setSleepMinutes],
  );

  const state = useMemo<PlayerState>(
    () => ({ queue, index, current, playing, position, duration, repeat, rate, failed, reloadToken, sleepMinutes, sleepDeadline }),
    [queue, index, current, playing, position, duration, repeat, rate, failed, reloadToken, sleepMinutes, sleepDeadline],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>
        {children}
        {current ? (
          <Video
            // reloadToken 递增时强制重建实例，用于「重试」重新拉流
            key={`${trackKey(current)}-${reloadToken}`}
            ref={videoRef as never}
            source={{ uri: current.streamUrl }}
            paused={!playing}
            rate={rate}
            playInBackground
            // 默认 250ms 会让整棵树每秒重渲染 4 次，这里降到 1 秒一次
            progressUpdateInterval={1000}
            onLoad={handleLoad}
            onProgress={(event: { currentTime: number }) => setPosition(event.currentTime)}
            onEnd={handleEnd}
            onError={handleError}
            style={styles.hidden}
          />
        ) : null}
      </StateContext.Provider>
    </ActionsContext.Provider>
  );
};

const styles = StyleSheet.create({
  hidden: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
    left: -10,
    top: -10,
  },
});

export const usePlayerActions = (): PlayerActions => {
  const ctx = useContext(ActionsContext);
  if (!ctx) {
    throw new Error('usePlayerActions 必须在 PlayerProvider 内部使用');
  }
  return ctx;
};

export const usePlayerState = (): PlayerState => {
  const ctx = useContext(StateContext);
  if (!ctx) {
    throw new Error('usePlayerState 必须在 PlayerProvider 内部使用');
  }
  return ctx;
};

/** 同时需要状态与操作的页面（播放页）使用；纯操作场景请用 usePlayerActions 避免跟着进度重渲染 */
export const usePlayer = (): PlayerValue => ({ ...usePlayerActions(), ...usePlayerState() });