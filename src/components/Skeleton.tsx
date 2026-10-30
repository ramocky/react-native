import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { DimensionValue } from 'react-native';
import { theme } from '../theme';

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}

/** 骨架块：加载态占位，用透明度呼吸模拟内容即将出现 */
export const Skeleton: React.FC<Props> = ({ width = '100%', height = 12, radius = 4 }) => {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.75, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return <Animated.View style={[styles.block, { width, height, borderRadius: radius, opacity: pulse }]} />;
};

/** 曲目行骨架，尺寸与 TrackRow 对齐，避免加载完成后布局跳动 */
export const TrackRowSkeleton: React.FC = () => (
  <View style={styles.row}>
    <View style={styles.cover} />
    <View style={styles.meta}>
      <Skeleton width="70%" height={14} />
      <View style={styles.gap} />
      <Skeleton width="45%" height={10} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: theme.surface,
  },
  meta: {
    flex: 1,
    marginLeft: 12,
  },
  gap: {
    height: 8,
  },
});