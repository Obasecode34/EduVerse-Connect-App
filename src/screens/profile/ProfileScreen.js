import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ha', label: 'Hausa' },
  { value: 'yo', label: 'Yorùbá' },
  { value: 'ig', label: 'Igbo' },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout, logoutAllDevices, updateProfile, changePassword } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const nameChanged = fullName.trim() !== user?.fullName;
  const languageChanged = language !== user?.language;

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const payload = {};
      if (nameChanged) payload.fullName = fullName.trim();
      if (languageChanged) payload.language = language;
      await updateProfile(payload);
      Alert.alert(t('profile.saved'));
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      Alert.alert('Too short', 'New password must be at least 8 characters.');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Password updated', 'Other devices have been logged out for security.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not change password.');
    } finally {
      setChangingPassword(false);
    }
  }

  function handleLogoutAll() {
    Alert.alert(t('profile.logoutAllDevices'), 'This will sign you out everywhere, including this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: t('profile.logoutAllDevices'), style: 'destructive', onPress: logoutAllDevices },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{user?.fullName}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.badgeRow}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{user?.role}</Text>
        </View>
        {user?.role === 'employer' && (
          <View style={[styles.roleBadge, user.employerVerified ? styles.verifiedBadge : styles.pendingBadge]}>
            <Text style={styles.roleBadgeText}>
              {user.employerVerified ? t('profile.employerVerified') : t('profile.employerPending')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>{t('profile.editProfile')}</Text>
      <TextInput style={styles.input} placeholder={t('profile.fullName')} value={fullName} onChangeText={setFullName} />

      <Text style={styles.subLabel}>{t('profile.language')}</Text>
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

      <TouchableOpacity
        style={[styles.primaryButton, !(nameChanged || languageChanged) && styles.buttonDisabled]}
        onPress={handleSaveProfile}
        disabled={savingProfile || !(nameChanged || languageChanged)}
      >
        <Text style={styles.primaryButtonText}>{savingProfile ? t('common.saving') : t('profile.save')}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>{t('profile.changePassword')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('profile.currentPassword')}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder={t('profile.newPassword')}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TouchableOpacity
        style={[styles.primaryButton, (!currentPassword || !newPassword) && styles.buttonDisabled]}
        onPress={handleChangePassword}
        disabled={changingPassword || !currentPassword || !newPassword}
      >
        <Text style={styles.primaryButtonText}>{changingPassword ? t('common.saving') : t('profile.updatePassword')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleLogoutAll}>
        <Text style={styles.secondaryButtonText}>{t('profile.logoutAllDevices')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>{t('common.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 160 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 8 },
  email: { color: '#6B7280', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  roleBadge: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  verifiedBadge: { backgroundColor: '#DCFCE7' },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  roleBadgeText: { fontSize: 12, fontWeight: '600', color: '#374151', textTransform: 'capitalize' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginTop: 28, marginBottom: 10 },
  subLabel: { color: '#374151', fontWeight: '500', marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14 },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 15 },
  secondaryButton: { marginTop: 24, padding: 14 },
  secondaryButtonText: { color: '#374151', textAlign: 'center', fontWeight: '500' },
  logoutButton: { marginTop: 8, borderWidth: 1, borderColor: '#DC2626', borderRadius: 10, padding: 14 },
  logoutText: { color: '#DC2626', textAlign: 'center', fontWeight: '600' },
});
