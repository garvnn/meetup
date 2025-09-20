/**
 * Custom meetup pin with attendee bubble overlay
 * No native callouts - only triggers bottom sheet
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { getBubbleSize, getBubbleColor, getBubbleOpacity } from '../utils/theme';
import { COLORS, TYPOGRAPHY } from '../utils/theme';

interface MeetupPinProps {
  attendeeCount: number;
  title: string;
  isSelected?: boolean;
}

export const MeetupPin: React.FC<MeetupPinProps> = ({
  attendeeCount,
  title,
  isSelected = false,
}) => {
  const bubbleSize = getBubbleSize(attendeeCount);
  const bubbleColor = getBubbleColor(attendeeCount);
  const bubbleOpacity = getBubbleOpacity(attendeeCount);

  return (
    <View style={styles.container}>
      {/* Base pin marker */}
      <View style={[styles.pin, isSelected && styles.pinSelected]}>
        <View style={styles.pinInner} />
      </View>
      
      {/* Attendee bubble overlay */}
      <View style={[styles.bubbleContainer, { width: bubbleSize, height: bubbleSize }]}>
        <Svg width={bubbleSize} height={bubbleSize} style={styles.bubbleSvg}>
          <Circle
            cx={bubbleSize / 2}
            cy={bubbleSize / 2}
            r={bubbleSize / 2 - 2}
            fill={bubbleColor}
            fillOpacity={bubbleOpacity}
            stroke={COLORS.surface}
            strokeWidth={2}
          />
        </Svg>
        
        {/* Attendee count text */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>{attendeeCount}</Text>
        </View>
      </View>
      
      {/* Title label (shown on selection) */}
      {isSelected && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinSelected: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 1.2 }],
  },
  pinInner: {
    flex: 1,
    borderRadius: 7,
    backgroundColor: COLORS.surface,
    margin: 2,
  },
  bubbleContainer: {
    position: 'absolute',
    top: -10,
    left: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleSvg: {
    position: 'absolute',
  },
  countContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  countText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text,
    fontWeight: '600',
  },
  labelContainer: {
    position: 'absolute',
    top: 40,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    maxWidth: 120,
  },
  labelText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text,
    fontWeight: '500',
  },
});
