import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS = {
  HomeTab: 'home',
  CreateJob: 'add-circle',
  Moderation: 'shield-checkmark',
  ResumeBuilder: 'document-text',
  Profile: 'person',
};

// Deliberately a custom tabBar (not the default React Navigation bottom bar)
// to get the floating pill look from the spec — absolute positioning with
// margin on all sides, rather than a bar docked flush to the screen edge.
export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;
  if (focusedOptions.tabBarStyle?.display === 'none') return null;

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 12 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const iconName = ICONS[route.name] || 'ellipse';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab}>
            <Ionicons name={iconName} size={22} color={isFocused ? '#2563EB' : '#9CA3AF'} />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {options.tabBarLabel ?? route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tab: { alignItems: 'center', gap: 2, minWidth: 60 },
  label: { fontSize: 11, color: '#9CA3AF' },
  labelActive: { color: '#2563EB', fontWeight: '600' },
});
