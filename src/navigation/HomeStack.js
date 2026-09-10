import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeTopTabs from './HomeTopTabs';
import JobDetailScreen from '../screens/home/JobDetailScreen';
import ApplyToJobScreen from '../screens/home/ApplyToJobScreen';

const Stack = createNativeStackNavigator();

// HomeTopTabs has no header of its own (top tabs sit right below the app
// bar), so JobDetail and Apply get real headers with a back button once
// they're pushed on top of it.
export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeTopTabs" component={HomeTopTabs} options={{ title: 'EduVerse Connect' }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
      <Stack.Screen name="ApplyToJob" component={ApplyToJobScreen} options={{ title: 'Apply' }} />
    </Stack.Navigator>
  );
}
