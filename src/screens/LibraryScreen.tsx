import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TrackRow } from '../components/TrackRow';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/library';
import { usePlayer } from '../state/player';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const { favorites } = useLibrary();
  const player = usePlayer();

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.empty}>还没有收藏</Text>
        <Text style={styles.hint}>在播放页点「收藏」即可加入</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={item => `${item.source}-${item.id}`}
        renderItem={({ item }) => (
          <TrackRow
            track={item}
            onPress={() => {
              player.play(item, favorites);
              navigation.navigate('Player');
            }}
          />
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
    color: theme.text,
    fontSize: 15,
  },
  hint: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 8,
  },
});

export default LibraryScreen;