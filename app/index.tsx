import { View, Text, StyleSheet } from 'react-native';
import { MapBubble } from '../components/MapBubble';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map with Pins/Bubbles</Text>
      {/* Map component will go here */}
      <MapBubble />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
