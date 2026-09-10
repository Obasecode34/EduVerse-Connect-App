import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../context/AuthContext';
import { tokenStorage } from '../../api/client';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { login, unlockWithBiometrics } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const hasStoredSession = !!(await tokenStorage.getRefreshToken());
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasStoredSession && hasHardware && isEnrolled);
    })();
  }, []);

  async function handleLogin() {
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.message || 'Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBiometric() {
    const result = await unlockWithBiometrics();
    if (!result.success && result.reason !== 'cancelled') {
      Alert.alert('Unable to unlock', 'Please log in with your password.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.appName')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('auth.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? t('auth.loggingIn') : t('auth.login')}</Text>
      </TouchableOpacity>

      {biometricAvailable && (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBiometric}>
          <Text style={styles.secondaryButtonText}>{t('auth.unlockBiometric')}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>{t('auth.noAccount')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 32, textAlign: 'center', color: '#111827' },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    padding: 14, marginBottom: 12, fontSize: 16,
  },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14, marginTop: 8 },
  primaryButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  secondaryButton: { padding: 14, marginTop: 12 },
  secondaryButtonText: { color: '#2563EB', textAlign: 'center', fontWeight: '500' },
  link: { color: '#6B7280', textAlign: 'center', marginTop: 20 },
});
