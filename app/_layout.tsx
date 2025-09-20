import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Map' }} />
      <Stack.Screen name="create" options={{ title: 'Create Meetup' }} />
      <Stack.Screen name="meetup/[id]" options={{ title: 'Meetup' }} />
      <Stack.Screen name="share/[token]" options={{ title: 'Share' }} />
      <Stack.Screen name="join/[token]" options={{ title: 'Join' }} />
    </Stack>
  );
}
