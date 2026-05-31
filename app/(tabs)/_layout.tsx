import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth.store';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Accueil" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="Découvrir" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📦" label="Commandes" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔔" label="Alertes" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(247,242,234,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  tabItem: { alignItems: 'center', gap: 2, paddingTop: 6 },
  tabEmoji: { fontSize: 22, opacity: 0.5 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: Colors.textDim,
  },
  tabLabelActive: {
    color: Colors.orange,
    fontFamily: 'DMSans_600SemiBold',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.orange,
    marginTop: 1,
  },
});
