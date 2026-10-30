import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { theme } from '../theme';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const formatTime = (seconds: number): string => {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface Props {
  position: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export const SeekBar: React.FC<Props> = ({ position, duration, onSeek }) => {
  const [width, setWidth] = useState(0);
  const [draft, setDraft] = useState<number | null>(null);
  const widthRef = useRef(0);
  const durationRef = useRef(0);
  const draftRef = useRef<number | null>(null);
  // 按下时的进度比例，拖动过程用它加上位移增量，避免手指移出控件后 locationX 失真
  const startRatioRef = useRef(0);

  widthRef.current = width;
  durationRef.current = duration;

  const updateDraft = (seconds: number) => {
    draftRef.current = seconds;
    setDraft(seconds);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          const w = widthRef.current;
          if (!w || !durationRef.current) {
            return;
          }
          startRatioRef.current = clamp(event.nativeEvent.locationX / w, 0, 1);
          updateDraft(startRatioRef.current * durationRef.current);
        },
        onPanResponderMove: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
          const w = widthRef.current;
          if (!w || !durationRef.current) {
            return;
          }
          const ratio = clamp(startRatioRef.current + gesture.dx / w, 0, 1);
          updateDraft(ratio * durationRef.current);
        },
        onPanResponderRelease: () => {
          const seconds = draftRef.current;
          draftRef.current = null;
          setDraft(null);
          if (seconds != null) {
            onSeek(seconds);
          }
        },
        onPanResponderTerminate: () => {
          draftRef.current = null;
          setDraft(null);
        },
      }),
    [onSeek],
  );

  const shown = draft ?? position;
  const ratio = duration > 0 ? clamp(shown / duration, 0, 1) : 0;

  return (
    <View>
      <View style={styles.hitArea} onLayout={event => setWidth(event.nativeEvent.layout.width)} {...responder.panHandlers}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
        <View style={[styles.thumb, { left: `${ratio * 100}%` }, draft != null && styles.thumbActive]} />
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(shown)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hitArea: {
    paddingVertical: 14,
    justifyContent: 'center',
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.accent,
  },
  thumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    backgroundColor: theme.accent,
  },
  thumbActive: {
    transform: [{ scale: 1.4 }],
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: theme.muted,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});