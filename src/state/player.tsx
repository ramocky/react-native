import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import type { Track } from '../api/music/types';
import { useLibrary } from './library';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerValue {
  queue: Track[];
  index: number;
  current: Track | null;
  playing: boolean;
  position: number;
  duration: number;
  repeat: RepeatMode;
  rate: number;
  failed: boolean;
  play: (track: Track, queue?: Track[]) => void;
  jumpTo: (index: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  cycleRepeat: () => void;
  setRate: (rate: number) => void;
}

const PlayerContext = createContext<PlayerValue | null>(null);

/** 播放器实例只在内部使用，对外只暴露 seek 需要的最小接口 */
interface VideoHandle {
  seek: (seconds: number) => void;
}

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

  const current = index >= 0 && index < queue.length ? queue[index] : null;

  useEffect(() => {
    // 换曲后先按曲目自带时长展示，onLoad 拿到真实时长后再覆盖
    if (current) {
      setDuration(current.duration || 0);
      addRecent(current);
    }
  }, [current, addRecent]);

  const play = useCallback((track: Track, list?: Track[]) => {
    const nextQueue = list && list.length > 0 ? list : [track];
    const at = nextQueue.findIndex(item => item.source === track.source && item.id === track.id);
    setQueue(nextQueue);
    setIndex(at >= 0 ? at : 0);
    setPosition(0);
    setDuration(track.duration);
    setFailed(false);
    setPlaying(true);
  }, []);

  const jumpTo = useCallback(
    (target: number) => {
      if (target < 0 || target >= queue.length) {
        return;
      }
      setIndex(target);
      setPosition(0);
      setFailed(false);
      setPlaying(true);
    },
    [queue.length],
  );

  const next = useCallback(() => {
    if (queue.length === 0) {
      return;
    }
    if (index + 1 < queue.length) {
      setIndex(index + 1);
      setPosition(0);
      setFailed(false);
      setPlaying(true);
      return;
    }
    if (repeat === 'all') {
      setIndex(0);
      setPosition(0);
      setFailed(false);
      setPlaying(true);
      return;
    }
    setPlaying(false);
  }, [index, queue.length, repeat]);

  const prev = useCallback(() => {
    if (queue.length === 0) {
      return;
    }
    // 播放超过 3 秒时，「上一首」先回到本曲开头
    if (position > 3) {
      videoRef.current?.seek(0);
      setPosition(0);
      return;
    }
    if (index > 0) {
      setIndex(index - 1);
    } else if (repeat === 'all') {
      setIndex(queue.length - 1);
    }
    setPosition(0);
    setFailed(false);
    setPlaying(true);
  }, [index, position, queue.length, repeat]);

  const toggle = useCallback(() => setPlaying(prevState => !prevState), []);

  const seek = useCallback((seconds: number) => {
    const target = Math.max(0, Math.min(seconds, duration || seconds));
    videoRef.current?.seek(target);
    setPosition(target);
  }, [duration]);

  const cycleRepeat = useCallback(() => {
    setRepeat(prevState => (prevState === 'off' ? 'all' : prevState === 'all' ? 'one' : 'off'));
  }, []);

  const setRate = useCallback((value: number) => setRateState(value), []);

  const handleEnd = useCallback(() => {
    if (repeat === 'one') {
      videoRef.current?.seek(0);
      setPosition(0);
      return;
    }
    next();
  }, [next, repeat]);

  const value = useMemo(
    () => ({
      queue,
      index,
      current,
      playing,
      position,
      duration,
      repeat,
      rate,
      failed,
      play,
      jumpTo,
      toggle,
      next,
      prev,
      seek,
      cycleRepeat,
      setRate,
    }),
    [queue, index, current, playing, position, duration, repeat, rate, failed, play, jumpTo, toggle, next, prev, seek, cycleRepeat, setRate],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {current ? (
        <Video
          ref={videoRef as never}
          source={{ uri: current.streamUrl }}
          paused={!playing}
          rate={rate}
          playInBackground
          onLoad={(event: { duration: number }) => {
            setDuration(event.duration || current.duration);
            setFailed(false);
          }}
          onProgress={(event: { currentTime: number }) => setPosition(event.currentTime)}
          onEnd={handleEnd}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
          style={styles.hidden}
        />
      ) : null}
    </PlayerContext.Provider>
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

export const usePlayer = (): PlayerValue => {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer 必须在 PlayerProvider 内部使用');
  }
  return ctx;
};