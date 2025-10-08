import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { ThemeMode, getThemeColors } from './theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  colors: ReturnType<typeof getThemeColors>;
  isDarkMode: boolean;
  isSystemTheme: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  enableSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_mode';
const SYSTEM_THEME_KEY = 'use_system_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [useSystemTheme, setUseSystemThemeState] = useState<boolean>(true);

  // Load saved theme or use system preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedSystemTheme = await AsyncStorage.getItem(SYSTEM_THEME_KEY);
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        
        if (savedSystemTheme !== null) {
          const useSystem = JSON.parse(savedSystemTheme);
          setUseSystemThemeState(useSystem);
          
          if (useSystem) {
            setThemeModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
          } else if (savedTheme === 'light' || savedTheme === 'dark') {
            setThemeModeState(savedTheme);
          }
        } else {
          // Use system preference as default
          setThemeModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
        setThemeModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  // Update theme when system theme changes and we're using system theme
  useEffect(() => {
    if (useSystemTheme) {
      setThemeModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, useSystemTheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      await AsyncStorage.setItem(SYSTEM_THEME_KEY, JSON.stringify(false));
      setUseSystemThemeState(false);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const enableSystemTheme = async () => {
    try {
      await AsyncStorage.setItem(SYSTEM_THEME_KEY, JSON.stringify(true));
      setUseSystemThemeState(true);
      setThemeModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save system theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const colors = useMemo(() => getThemeColors(themeMode), [themeMode]);

  const value: ThemeContextType = useMemo(() => ({
    themeMode,
    colors,
    isDarkMode: themeMode === 'dark',
    isSystemTheme: useSystemTheme,
    toggleTheme,
    setThemeMode,
    enableSystemTheme,
  }), [themeMode, colors, useSystemTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
