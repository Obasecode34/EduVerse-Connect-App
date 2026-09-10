import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import i18n from '../i18n';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/client';
import { registerForPushNotifications } from '../services/pushNotifications';

const AuthContext = createContext(null);

// The user's saved language preference is the source of truth once known —
// this just makes the UI catch up to it, in every place a user object
// arrives (initial load, login, register).
function applyUserLanguage(userObj) {
  if (userObj?.language && i18n.language !== userObj.language) {
    i18n.changeLanguage(userObj.language);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const { user: me } = await authApi.me();
      setUser(me);
      applyUserLanguage(me);
      registerForPushNotifications();
    } catch (err) {
      // Access token invalid/expired and refresh already failed upstream —
      // treat as logged out rather than surfacing a confusing error on launch.
      await tokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  async function register(payload) {
    const { user: newUser, accessToken, refreshToken } = await authApi.register(payload);
    await tokenStorage.setTokens({ accessToken, refreshToken });
    setUser(newUser);
    applyUserLanguage(newUser);
    registerForPushNotifications();
  }

  async function login(email, password) {
    const { user: loggedInUser, accessToken, refreshToken } = await authApi.login({ email, password });
    await tokenStorage.setTokens({ accessToken, refreshToken });
    setUser(loggedInUser);
    applyUserLanguage(loggedInUser);
    registerForPushNotifications();
  }

  // Biometric unlock does NOT re-authenticate with the server — it just
  // proves "this is the same person who logged in on this device" before
  // handing back a session that's already sitting in SecureStore. If there's
  // no valid refresh token stored, biometrics has nothing to unlock and the
  // user still falls back to password login. It's a lock on the token, not
  // a substitute for having one.
  async function unlockWithBiometrics() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      return { success: false, reason: 'unavailable' };
    }

    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return { success: false, reason: 'no_session' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock EduVerse Connect',
      fallbackLabel: 'Use password instead',
    });

    if (!result.success) return { success: false, reason: 'cancelled' };

    await loadSession();
    return { success: true };
  }

  async function updateProfile(payload) {
    const { user: updated } = await authApi.updateProfile(payload);
    setUser(updated);
    applyUserLanguage(updated);
    return updated;
  }

  async function changePassword(payload) {
    return authApi.changePassword(payload);
  }

  async function logout() {
    await tokenStorage.clear();
    setUser(null);
  }

  async function logoutAllDevices() {
    try {
      await authApi.logoutAll();
    } finally {
      await logout();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register,
        login,
        logout,
        logoutAllDevices,
        unlockWithBiometrics,
        updateProfile,
        changePassword,
        refreshUser: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
