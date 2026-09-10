import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import JobListScreen from '../screens/home/JobListScreen';

const TopTab = createMaterialTopTabNavigator();

// The 'Classification' sub-filter for scholarships (undergraduate, postgraduate,
// etc.) lives inside JobListScreen as a secondary filter row when type is
// 'scholarship' — it isn't its own top-tab, since it only applies to one of
// the four tabs and would look like a broken filter on the other three.
export default function HomeTopTabs() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarIndicatorStyle: { backgroundColor: '#2563EB' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', textTransform: 'none' },
        tabBarScrollEnabled: true,
      }}
    >
      <TopTab.Screen
        name="OnSite"
        component={JobListScreen}
        initialParams={{ type: 'onsite', label: 'On-Site' }}
        options={{ title: 'On-Site' }}
      />
      <TopTab.Screen
        name="Remote"
        component={JobListScreen}
        initialParams={{ type: 'remote', label: 'Remote' }}
        options={{ title: 'Remote' }}
      />
      <TopTab.Screen
        name="Hybrid"
        component={JobListScreen}
        initialParams={{ type: 'hybrid', label: 'Hybrid' }}
        options={{ title: 'Hybrid' }}
      />
      <TopTab.Screen
        name="Scholarships"
        component={JobListScreen}
        initialParams={{ type: 'scholarship', label: 'Scholarships' }}
        options={{ title: 'Scholarships' }}
      />
    </TopTab.Navigator>
  );
}
