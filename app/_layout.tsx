import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../utils/ThemeContext';

function TabNavigator() {
  const { colors, themeMode } = useTheme();
  
  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            display: 'none', // Hide the default tab bar
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="create-event"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="list"
          options={{
            title: 'Events',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 28, opacity: focused ? 1 : 0.6 }}>
                📋
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 28, opacity: focused ? 1 : 0.6 }}>
                🗺️
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 28, opacity: focused ? 1 : 0.6 }}>
                💬
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="past-events"
          options={{
            title: 'Past Meetups',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 28, opacity: focused ? 1 : 0.6 }}>
                📸
              </Text>
            ),
          }}
        />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TabNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
