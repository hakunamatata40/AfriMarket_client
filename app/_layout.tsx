import { Colors } from '@/constants/colors';
import { getToken } from '@/services/api';
import { getMe } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts as useDMSans,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const [frauncesLoaded] = useFraunces({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_700Bold_Italic,
  });
  const [dmSansLoaded] = useDMSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const { setUser } = useAuthStore();

  useEffect(() => {
    async function init() {
      if (!frauncesLoaded || !dmSansLoaded) return;
      try {
        const token = await getToken();
        if (token) {
          const user = await getMe();
          setUser(user);
        }
      } catch {
        // Token expiré ou backend down → onboarding
      } finally {
        SplashScreen.hideAsync();
      }
    }
    init();
  }, [frauncesLoaded, dmSansLoaded]);

  if (!frauncesLoaded || !dmSansLoaded) return null;

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="offer/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="join/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}
