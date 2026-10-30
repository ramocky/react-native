import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DEFAULT_SOURCE, getProvider, providers } from '../api/music';
import type { Track, TrackSource } from '../api/music/types';
import { TrackRow } from '../components/TrackRow';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/library';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { favorites } = useLibrary();
  const [source, setSource] = useState<TrackSource>(DEFAULT_SOURCE);
  const [keyword, setKeyword] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (query: string) => {
      setLoading(true);
      setError('');
      try {
        const provider = getProvider(source);
        const result = query.trim() ? await provider.search(query.trim(), 30) : await provider.trending(30);
        setTracks(result);
      } catch (err) {
        setTracks([]);
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    },
    [source],
  );

  useEffect(() => {
    void load('');
  }, [load]);

  const openPlayer = (track: Track) => navigation.navigate('Player', { track });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.brand}>Ramocky Music</Text>
        <Pressable onPress={() => navigation.navigate('Library')} hitSlop={8}>
          <Text style={styles.link}>收藏 {favorites.length}</Text>
        </Pressable>
      </View>

      <View style={styles.sources}>
        {(Object.keys(providers) as TrackSource[]).map(id => (
          <Pressable
            key={id}
            onPress={() => setSource(id)}
            style={[styles.pill, source === id && styles.pillActive]}>
            <Text style={[styles.pillText, source === id && styles.pillTextActive]}>{providers[id].label}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={() => void load(keyword)}
        returnKeyType="search"
        placeholder="搜索歌曲、歌手"
        placeholderTextColor={theme.muted}
        style={styles.input}
      />

      {loading ? <ActivityIndicator style={styles.state} color={theme.accent} /> : null}
      {!loading && error ? (
        <Pressable style={styles.state} onPress={() => void load(keyword)}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry}>点击重试</Text>
        </Pressable>
      ) : null}
      {!loading && !error && tracks.length === 0 ? (
        <Text style={[styles.state, styles.empty]}>没有结果</Text>
      ) : null}

      <FlatList
        data={tracks}
        keyExtractor={item => `${item.source}-${item.id}`}
        renderItem={({ item }) => <TrackRow track={item} onPress={() => openPlayer(item)} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  brand: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  link: {
    color: theme.accent,
    fontSize: 13,
  },
  sources: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  pillActive: {
    backgroundColor: theme.surface,
    borderColor: theme.accent,
  },
  pillText: {
    color: theme.muted,
    fontSize: 12,
  },
  pillTextActive: {
    color: theme.text,
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    color: theme.text,
    fontSize: 14,
  },
  state: {
    marginTop: 32,
    alignItems: 'center',
  },
  error: {
    color: theme.danger,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retry: {
    color: theme.accent,
    fontSize: 12,
    marginTop: 8,
  },
  empty: {
    color: theme.muted,
    textAlign: 'center',
    fontSize: 13,
  },
});

export default HomeScreen;
