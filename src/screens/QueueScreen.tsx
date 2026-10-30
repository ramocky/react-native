import React, { useLayoutEffect, useMemo } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TrackRow } from '../components/TrackRow';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerActions, usePlayerState } from '../state/player';
import { useTheme } from '../theme';
import type { Theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Queue'>;

const QueueScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { queue, index } = usePlayerState();
  const { jumpTo, clearQueue, removeAt } = usePlayerActions();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        queue.length > 0 ? (
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="清空播放队列"
            onPress={() => {
              clearQueue();
              navigation.goBack();
            }}>
            <Text style={styles.clear}>清空</Text>
          </Pressable>
        ) : null,
    });
  }, [clearQueue, navigation, queue.length, styles]);

  const confirmRemove = (at: number, title: string) => {
    Alert.alert('移出队列', `确定把《${title}》从播放队列移除吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '移出', style: 'destructive', onPress: () => removeAt(at) },
    ]);
  };

  if (queue.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.empty}>播放队列为空</Text>
        <Text style={styles.hint}>在首页点一首歌就会加入队列</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={queue}
        keyExtractor={(item, at) => `${item.source}-${item.id}-${at}`}
        renderItem={({ item, index: at }) => (
          <View style={[styles.row, at === index && styles.rowActive]}>
            <TrackRow
              track={item}
              onPress={() => {
                jumpTo(at);
                navigation.navigate('Player');
              }}
              onLongPress={() => confirmRemove(at, item.title)}
            />
          </View>
        )}
        ListFooterComponent={<Text style={styles.footerHint}>长按可移出单曲</Text>}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      color: theme.text,
      fontSize: 15,
    },
    hint: {
      color: theme.muted,
      fontSize: 12,
      marginTop: 8,
    },
    clear: {
      color: theme.accent,
      fontSize: 14,
    },
    row: {
      borderLeftWidth: 2,
      borderLeftColor: 'transparent',
    },
    rowActive: {
      borderLeftColor: theme.accent,
      backgroundColor: theme.surface,
    },
    footerHint: {
      color: theme.muted,
      fontSize: 11,
      textAlign: 'center',
      paddingVertical: 16,
    },
  });

export default QueueScreen;