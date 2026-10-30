import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DEFAULT_SOURCE, getProvider, providers } from '../api/music';
import type { Track, TrackSource } from '../api/music/types';
import { TrackRowSkeleton } from '../components/Skeleton';
import { TrackRow } from '../components/TrackRow';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../state/library';
import { usePlayer } from '../state/player';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];
const PAGE_SIZE = 30;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { favorites, recent, history, addHistory, clearHistory } = useLibrary();
  const player = usePlayer();
  const [source, setSource] = useState<TrackSource>(DEFAULT_SOURCE);
  const [keyword, setKeyword] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  // 已加载页数，翻页游标以它为基准，不随列表内容变化
  const pageRef = useRef(0);

  const load = useCallback(
    async (query: string, mode: 'initial' | 'refresh' | 'more' = 'initial') => {
      const word = query.trim();
      if (mode === 'more' && (!hasMore || loading || loadingMore || refreshing)) {
        return;
      }
      if (mode === 'refresh') {
        setRefreshing(true);
      } else if (mode === 'more') {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');
      try {
        const provider = getProvider(source);
        const offset = mode === 'more' ? pageRef.current * PAGE_SIZE : 0;
        const result = word ? await provider.search(word, PAGE_SIZE, offset) : await provider.trending(PAGE_SIZE, offset);
        if (mode === 'more') {
          setTracks(prev => {
            const seen = new Set(prev.map(item => `${item.source}-${item.id}`));
            return [...prev, ...result.filter(item => !seen.has(`${item.source}-${item.id}`))];
          });
          pageRef.current += 1;
        } else {
          setTracks(result);
          pageRef.current = 1;
        }
        setHasMore(result.length >= PAGE_SIZE);
        if (word && mode !== 'more') {
          addHistory(word);
        }
      } catch (err) {
        if (mode !== 'more') {
          setTracks([]);
        }
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [addHistory, hasMore, loading, loadingMore, refreshing, source],
  );

  useEffect(() => {
    // 切源后从头加载，翻页游标一并重置
    pageRef.current = 0;
    setHasMore(true);
    void load(keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const openPlayer = (track: Track, list?: Track[]) => {
    player.play(track, list ?? tracks);
    navigation.navigate('Player');
  };

  const showRecent = recent.length > 0 && !keyword.trim();

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
          <Pressable key={id} onPress={() => setSource(id)} style={[styles.pill, source === id && styles.pillActive]}>
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

      {history.length > 0 && !keyword ? (
        <View style={styles.historyRow}>
          {history.slice(0, 5).map(word => (
            <Pressable
              key={word}
              style={styles.chip}
              onPress={() => {
                setKeyword(word);
                void load(word);
              }}>
              <Text style={styles.chipText}>{word}</Text>
            </Pressable>
          ))}
          <Pressable onPress={clearHistory} hitSlop={6}>
            <Text style={styles.clear}>清除</Text>
          </Pressable>
        </View>
      ) : null}

      {showRecent ? (
        <View style={styles.recentBlock}>
          <Text style={styles.section}>最近播放</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {recent.slice(0, 12).map(item => (
              <Pressable
                key={`${item.source}-${item.id}`}
                style={styles.recentCard}
                onPress={() => openPlayer(item, [item, ...recent.filter(track => track !== item)])}>
                {item.artwork ? (
                  <Image source={{ uri: item.artwork }} style={styles.recentCover} />
                ) : (
                  <View style={[styles.recentCover, styles.coverFallback]} />
                )}
                <Text style={styles.recentTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {loading
        ? SKELETON_ROWS.map(row => <TrackRowSkeleton key={row} />)
        : null}

      {!loading && error ? (
        <Pressable style={styles.state} onPress={() => void load(keyword)}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry}>点击重试</Text>
        </Pressable>
      ) : null}

      {!loading && !error && tracks.length === 0 ? (
        <View style={styles.state}>
          <Text style={styles.empty}>没有结果</Text>
          <Text style={styles.emptyHint}>换个关键词，或切换音乐源试试</Text>
        </View>
      ) : null}

      {!loading ? (
        <FlatList
          data={tracks}
          keyExtractor={item => `${item.source}-${item.id}`}
          renderItem={({ item }) => <TrackRow track={item} onPress={() => openPlayer(item)} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.4}
          onEndReached={() => void load(keyword, 'more')}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(keyword, 'refresh')} tintColor={theme.muted} />}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footer} color={theme.muted} />
            ) : !hasMore && tracks.length > 0 ? (
              <Text style={[styles.footer, styles.footerText]}>已经到底了</Text>
            ) : null
          }
        />
      ) : null}
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
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    color: theme.text,
    fontSize: 14,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: theme.surface,
  },
  chipText: {
    color: theme.muted,
    fontSize: 11,
  },
  clear: {
    color: theme.muted,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  recentBlock: {
    marginBottom: 8,
  },
  section: {
    color: theme.muted,
    fontSize: 11,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  recentRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentCard: {
    width: 84,
  },
  recentCover: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: theme.surface,
  },
  coverFallback: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  recentTitle: {
    color: theme.muted,
    fontSize: 11,
    marginTop: 6,
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
    color: theme.text,
    fontSize: 14,
  },
  emptyHint: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    color: theme.muted,
    fontSize: 11,
    textAlign: 'center',
  },
});

export default HomeScreen;