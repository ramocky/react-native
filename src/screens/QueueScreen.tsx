import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TrackRow } from '../components/TrackRow';
import type { RootStackParamList } from '../navigation/types';
import { usePlayer } from '../state/player';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Queue'>;

const QueueScreen: React.FC<Props> = ({ navigation }) => {
  const { queue, index, jumpTo } = usePlayer();

  if (queue.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.empty}>播放队列为空</Text>
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
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: theme.muted,
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
});

export default QueueScreen;