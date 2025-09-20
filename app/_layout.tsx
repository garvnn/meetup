import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'My Meetups' }} />
      <Stack.Screen name="create" options={{ title: 'Create Meetup' }} />
      <Stack.Screen name="meetup/[id]" options={{ title: 'Meetup' }} />
      <Stack.Screen name="share/[token]" options={{ title: 'Share Invite' }} />
      <Stack.Screen name="join/[token]" options={{ title: 'Join Meetup' }} />
    </Stack>
  );
}
