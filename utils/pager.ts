/**
 * Simplified pager utilities for Camera-style mode switching
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PAGER_CONFIG = {
  SCREEN_WIDTH,
  MODE_WIDTH: 120,
  MODE_COUNT: 3,
};

export const getModeIndex = (offset: number): number => {
  return Math.round(offset / SCREEN_WIDTH);
};

export const getModeOffset = (index: number): number => {
  return index * SCREEN_WIDTH;
};

export const getModeLabel = (index: number): string => {
  const modes = ['MAP', 'MESSAGES', 'LIST'];
  return modes[index] || '';
};

export const clampOffset = (offset: number): number => {
  const maxOffset = (PAGER_CONFIG.MODE_COUNT - 1) * SCREEN_WIDTH;
  return Math.max(0, Math.min(offset, maxOffset));
};
