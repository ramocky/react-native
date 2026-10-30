import React, { useMemo } from 'react';
import { StatusBar } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import QueueScreen from './src/screens/QueueScreen';
import { LibraryProvider } from './src/state/library';
import { PlayerProvider } from './src/state/player';
import { ThemeProvider, useTheme } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Root: React.FC = () => {
  const theme = useTheme();
  const base = theme.dark ? DarkTheme : DefaultTheme;

  const navTheme = useMemo(
    () => ({
      ...base,
      dark: theme.dark,
      colors: {
        ...base.colors,
        background: theme.bg,
        card: theme.bg,
        text: theme.text,
        border: theme.border,
        primary: theme.accent,
      },
    }),
    [base, theme],
  );

  return (
    <>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.bg },
            headerTitleStyle: { color: theme.text, fontSize: 15 },
            headerTintColor: theme.accent,
            contentStyle: { backgroundColor: theme.bg },
          }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Player" component={PlayerScreen} options={{ title: '正在播放' }} />
          <Stack.Screen name="Queue" component={QueueScreen} options={{ title: '播放队列' }} />
          <Stack.Screen name="Library" component={LibraryScreen} options={{ title: '我的音乐' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const App: React.FC = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <LibraryProvider>
        <PlayerProvider>
          <Root />
        </PlayerProvider>
      </LibraryProvider>
    </ThemeProvider>
  </SafeAreaProvider>
);

export default App;