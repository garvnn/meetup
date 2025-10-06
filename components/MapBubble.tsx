import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapBubbleProps {
  title?: string;
  description?: string;
}

export function MapBubble({ title = 'Sample Bubble', description = 'This is a map bubble' }: MapBubbleProps) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});
