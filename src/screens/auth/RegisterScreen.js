import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ha', label: 'Hausa' },
  { value: 'yo', label: 'Yorùbá' },
  { value: 'ig', label: 'Igbo' },
];

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('jobseeker');
  const [language, setLanguage] = useState('en');
  const [submitting, setSubmitting] = useState(false);

  const ROLES = [
    { value: 'jobseeker', label: t('auth.jobSeeker') },
    { value: 'employer', label: t('auth.employer') },
  ];

  async function handleRegister() {
    setSubmitting(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password, role, language });
    } catch (err) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : err.response?.data?.message || 'Something went wrong.';
      Alert.alert('Registration failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('auth.createAccountTitle')}</Text>

      <TextInput style={styles.input} placeholder={t('auth.fullName')} value={fullName} onChangeText={setFullName} />
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

      <Text style={styles.label}>{t('auth.iAmA')}</Text>
      <View style={styles.chipRow}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[styles.chip, role === r.value && styles.chipActive]}
            onPress={() => setRole(r.value)}
          >
            <Text style={[styles.chipText, role === r.value && styles.chipTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {role === 'employer' && <Text style={styles.note}>{t('auth.employerNote')}</Text>}

      <Text style={styles.label}>{t('profile.language')}</Text>
      <View style={styles.chipRow}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.value}
            style={[styles.chip, language === l.value && styles.chipActive]}
            onPress={() => setLanguage(l.value)}
          >
            <Text style={[styles.chipText, language === l.value && styles.chipTextActive]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={submitting}>
        <Text style={styles.primaryButtonText}>{submitting ? t('auth.creating') : t('auth.createAccount')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>{t('auth.haveAccount')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center', color: '#111827' },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    padding: 14, marginBottom: 12, fontSize: 16,
  },
  label: { color: '#374151', marginBottom: 8, marginTop: 4, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  chip: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  note: { color: '#B45309', fontSize: 13, marginBottom: 12 },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14, marginTop: 12 },
  primaryButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  link: { color: '#6B7280', textAlign: 'center', marginTop: 20 },
});
