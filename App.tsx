import React from 'react';
import { StatusBar } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { LibraryProvider } from './src/state/library';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.bg,
    card: theme.bg,
    text: theme.text,
    border: theme.border,
    primary: theme.accent,
  },
};

const App: React.FC = () => (
  <SafeAreaProvider>
    <LibraryProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
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
          <Stack.Screen name="Library" component={LibraryScreen} options={{ title: '我的收藏' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </LibraryProvider>
  </SafeAreaProvider>
);

export default App;
