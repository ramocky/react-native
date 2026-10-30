import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TrackRow } from '../components/TrackRow';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/library';
import { usePlayerActions } from '../state/player';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

type Tab = 'favorites' | 'recent';

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const { favorites, recent, toggleFavorite } = useLibrary();
  const player = usePlayerActions();
  const [tab, setTab] = useState<Tab>('favorites');

  const list = tab === 'favorites' ? favorites : recent;

  const open = (track: (typeof list)[number]) => {
    player.play(track, list);
    navigation.navigate('Player');
  };

  const confirmRemove = (track: (typeof list)[number]) => {
    Alert.alert('取消收藏', `确定把《${track.title}》移出收藏吗？`, [
      { text: '再想想', style: 'cancel' },
      { text: '移出', style: 'destructive', onPress: () => toggleFavorite(track) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('favorites')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'favorites' }}
          style={[styles.tab, tab === 'favorites' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'favorites' && styles.tabTextActive]}>收藏 {favorites.length}</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('recent')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'recent' }}
          style={[styles.tab, tab === 'recent' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'recent' && styles.tabTextActive]}>最近播放 {recent.length}</Text>
        </Pressable>
      </View>

      {list.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{tab === 'favorites' ? '还没有收藏' : '还没有播放记录'}</Text>
          <Text style={styles.hint}>{tab === 'favorites' ? '在播放页点「收藏」即可加入' : '播放任意一首歌后会出现在这里'}</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => `${item.source}-${item.id}`}
          renderItem={({ item }) => (
            <TrackRow
              track={item}
              onPress={() => open(item)}
              onLongPress={tab === 'favorites' ? () => confirmRemove(item) : undefined}
            />
          )}
          ListFooterComponent={
            tab === 'favorites' && list.length > 0 ? <Text style={styles.footerHint}>长按可取消收藏</Text> : undefined
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  tabActive: {
    backgroundColor: theme.surface,
    borderColor: theme.accent,
  },
  tabText: {
    color: theme.muted,
    fontSize: 12,
  },
  tabTextActive: {
    color: theme.text,
  },
  center: {
    flex: 1,
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
  footerHint: {
    color: theme.muted,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default LibraryScreen;