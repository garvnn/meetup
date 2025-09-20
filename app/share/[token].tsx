import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ShareScreen() {
  const { token } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Invite</Text>
      <Text style={styles.token}>Token: {token}</Text>
      {/* Share functionality will go here */}
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
  token: {
    fontSize: 16,
    color: '#666',
  },
});
