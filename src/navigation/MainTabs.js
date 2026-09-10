import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import HomeStack from './HomeStack';
import CreateJobScreen from '../screens/jobs/CreateJobScreen';
import AdminModerationScreen from '../screens/admin/AdminModerationScreen';
import ResumeBuilderScreen from '../screens/resume/ResumeBuilderScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FloatingTabBar from '../components/FloatingTabBar';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

// Screens pushed on top of HomeStack (job detail, apply form) shouldn't have
// the floating pill hovering over their header — it reads as a stray UI
// element once there's a back arrow right above it.
const HIDDEN_ON = ['JobDetail', 'ApplyToJob'];

export default function MainTabs() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={({ route }) => ({
          tabBarLabel: t('nav.home'),
          tabBarStyle: HIDDEN_ON.includes(getFocusedRouteNameFromRoute(route)) ? { display: 'none' } : undefined,
        })}
      />
      {/* Admins moderate instead of posting jobs — the second tab slot
          changes meaning by role rather than being a dead end for admins. */}
      {isAdmin ? (
        <Tab.Screen name="Moderation" component={AdminModerationScreen} options={{ tabBarLabel: 'Moderate' }} />
      ) : (
        <Tab.Screen name="CreateJob" component={CreateJobScreen} options={{ tabBarLabel: t('nav.createJob') }} />
      )}
      <Tab.Screen name="ResumeBuilder" component={ResumeBuilderScreen} options={{ tabBarLabel: t('nav.resume') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  );
}
