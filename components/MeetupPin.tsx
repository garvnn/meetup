/**
 * Custom meetup pin with attendee bubble overlay and event image
 * Features proximity-based expansion effect for visual appeal
 * Optimized for consistent rendering and reduced glitching
 */

import React, { useEffect, useRef, memo, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, TouchableOpacity } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { getBubbleSize, getBubbleColor, getBubbleOpacity } from '../utils/theme';
import { COLORS, TYPOGRAPHY } from '../utils/theme';

interface MeetupPinProps {
  attendeeCount: number;
  title: string;
  isSelected?: boolean;
  eventImage?: string;
  // Proximity effect props
  mapZoom?: number;
  distanceFromCenter?: number;
  isNearby?: boolean;
  // Interaction props
  onPress?: () => void;
}

const MeetupPinComponent: React.FC<MeetupPinProps> = ({
  attendeeCount,
  title,
  isSelected = false,
  eventImage,
  mapZoom = 1,
  distanceFromCenter = 0,
  isNearby = false,
  onPress,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  const bubbleSize = getBubbleSize(attendeeCount);
  const bubbleColor = getBubbleColor(attendeeCount);
  const bubbleOpacity = getBubbleOpacity(attendeeCount);
  
  // State to track image loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Initialize image loaded state when eventImage changes
  useEffect(() => {
    if (eventImage && !imageError) {
      setImageLoaded(false); // Reset when image changes
    }
  }, [eventImage, imageError]);
  
  // Simplified animation values to prevent glitching
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  // Calculate expansion based on proximity and zoom - simplified
  const calculateExpansionScale = useMemo(() => {
    if (!isNearby) return 1;
    
    // More conservative scaling to reduce glitching
    const zoomScale = Math.min(mapZoom * 0.15, 1.2);
    const distanceFactor = Math.max(0.7, 1 - (distanceFromCenter / 200));
    
    return Math.min(zoomScale * distanceFactor, 1.3);
  }, [isNearby, mapZoom, distanceFromCenter]);

  // Calculate image visibility - prioritize showing images when available
  const shouldShowImage = useMemo(() => {
    if (!eventImage || imageError) {
      return false;
    }
    // Show image when we have one - use very lenient thresholds
    // Show images at almost any zoom level and distance
    const shouldShow = distanceFromCenter < 2000 && mapZoom > 0.8;
    return shouldShow;
  }, [eventImage, distanceFromCenter, mapZoom, imageError]);

  // Calculate bubble visibility - always show as fallback
  const shouldShowBubble = useMemo(() => {
    // Always show bubble as fallback when image is not showing
    // This ensures there's always something visible
    const showBubble = !shouldShowImage;
    return showBubble;
  }, [shouldShowImage]);

  // Simplified animations to prevent glitching
  useEffect(() => {
    const targetScale = calculateExpansionScale;
    const targetOpacity = isNearby ? 1 : 0.8;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: targetScale,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isNearby, calculateExpansionScale]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      {/* Event Image - Show when conditions are met and image is loaded */}
      {shouldShowImage && (
        <View style={styles.imageContainer}>
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={styles.imageTouchable}
          >
            <Image
              source={{ 
                uri: eventImage,
                cache: 'force-cache'
              }}
              style={styles.eventImage}
              resizeMode="cover"
              fadeDuration={0} // Disable fade to prevent glitching
              loadingIndicatorSource={require('../assets/icon.png')}
              defaultSource={require('../assets/icon.png')}
              // Optimized image settings
              progressiveRenderingEnabled={false} // Disable for consistency
              onLoadStart={() => setImageLoaded(false)}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {/* Clean border overlay */}
            <View style={styles.imageBorder} />
            
            {/* Attendee count on bottom left of image */}
            <View style={styles.imageAttendeeCount}>
              <Text style={styles.imageCountText}>{attendeeCount}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Base pin marker - only show when image is visible (close distances) */}
      {shouldShowImage && (
        <View style={[styles.pin, isSelected && styles.pinSelected]}>
          <View style={styles.pinInner} />
        </View>
      )}
      
      {/* Attendee bubble overlay - show when zoomed out or far away */}
      {shouldShowBubble && (
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={[styles.bubbleContainer, { width: bubbleSize, height: bubbleSize }]}
        >
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
        </TouchableOpacity>
      )}
      
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Event image styles - Increased size for better quality and visibility
  imageContainer: {
    position: 'absolute',
    top: -80, // Increased from -60
    left: -50, // Center: (100-20)/2 = 40, so -50 centers it
    width: 100, // Increased from 80
    height: 75, // Increased from 60
    borderRadius: 16, // Increased from 12 for better proportions
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // Increased shadow
    shadowOpacity: 0.4, // Increased shadow opacity
    shadowRadius: 10, // Increased shadow radius
    elevation: 15, // Increased elevation
    zIndex: 10,
  },
  imageTouchable: {
    width: '100%',
    height: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16, // Updated to match container
    borderWidth: 3,
    borderColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, // Increased for better visibility
    shadowRadius: 6, // Increased shadow radius
  },
  imageAttendeeCount: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCountText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 11,
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
});

// Memoize the component with custom comparison to prevent unnecessary re-renders
export const MeetupPin = memo(MeetupPinComponent, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  // Note: isSelected is intentionally excluded to prevent re-renders when selection changes
  // since it only affects pin styling, not visibility logic
  
  // Use more lenient comparison for mapZoom and distanceFromCenter to prevent flickering
  const mapZoomChanged = Math.abs((prevProps.mapZoom || 0) - (nextProps.mapZoom || 0)) > 0.5;
  const distanceChanged = Math.abs((prevProps.distanceFromCenter || 0) - (nextProps.distanceFromCenter || 0)) > 50;
  
  return (
    prevProps.attendeeCount === nextProps.attendeeCount &&
    prevProps.title === nextProps.title &&
    prevProps.eventImage === nextProps.eventImage &&
    !mapZoomChanged &&
    !distanceChanged &&
    prevProps.isNearby === nextProps.isNearby
  );
});
