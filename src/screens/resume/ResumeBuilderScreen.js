import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import { resumesApi } from '../../api/resumes';
import { API_BASE_URL, tokenStorage, refreshAccessToken } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ALLOWED_FONTS, ALLOWED_ACCENT_COLORS, SECTION_TYPES, blankSection } from '../../constants/resumeOptions';
import SectionEditor from '../../components/resume/SectionEditor';

function buildDefaultResume(user) {
  return {
    title: 'My Resume',
    personalInfo: { fullName: user?.fullName || '', email: user?.email || '', phone: '', location: '', links: [] },
    theme: { font: ALLOWED_FONTS[0], accentColor: ALLOWED_ACCENT_COLORS[0] },
    sections: SECTION_TYPES.map((type, index) => blankSection(type, index)),
  };
}

export default function ResumeBuilderScreen() {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(null); // 'pdf' | 'docx' | null

  // Loaded on focus (not just mount) so returning to this tab after editing
  // elsewhere doesn't show stale data — cheap given it's a single-user fetch.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const { resumes } = await resumesApi.list();
          if (cancelled) return;
          if (resumes.length > 0) {
            setResume(resumes[0]);
          } else {
            // No resume yet — start from a fresh default in memory, only
            // persisted to the server once the user hits Save.
            setResume((prev) => prev || buildDefaultResume(user));
          }
        } catch (err) {
          Alert.alert('Error', 'Could not load your resume.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  function updatePersonalInfo(field, value) {
    setResume((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  }

  function updateSection(index, updatedSection) {
    setResume((prev) => {
      const sections = [...prev.sections];
      sections[index] = updatedSection;
      return { ...prev, sections };
    });
  }

  function moveSection(index, direction) {
    setResume((prev) => {
      const sections = [...prev.sections].sort((a, b) => a.order - b.order);
      const target = index + direction;
      if (target < 0 || target >= sections.length) return prev;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      sections.forEach((s, i) => (s.order = i));
      return { ...prev, sections };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (resume._id) {
        const { resume: updated } = await resumesApi.update(resume._id, resume);
        setResume(updated);
      } else {
        const { resume: created } = await resumesApi.create(resume);
        setResume(created);
      }
      Alert.alert('Saved', 'Your resume has been updated.');
    } catch (err) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : err.response?.data?.message || 'Something went wrong.';
      Alert.alert('Could not save', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload(format) {
    if (!resume._id) {
      Alert.alert('Save first', 'Save your resume before downloading it.');
      return;
    }
    setDownloading(format);
    try {
      const url = `${API_BASE_URL}/resumes/${resume._id}/download?format=${format}`;
      const fileUri = `${FileSystem.cacheDirectory}${resume.title.replace(/\s+/g, '_')}.${format}`;

      // downloadAsync streams straight to disk with the auth header attached —
      // no manual base64/Buffer conversion needed. But it bypasses the axios
      // response interceptor entirely, so a token that expired since the user
      // opened this screen won't auto-refresh the way every other request in
      // the app does — hence the manual 401-then-retry-once below.
      async function attemptDownload() {
        const token = await tokenStorage.getAccessToken();
        return FileSystem.downloadAsync(url, fileUri, { headers: { Authorization: `Bearer ${token}` } });
      }

      let { uri, status } = await attemptDownload();

      if (status === 401) {
        await refreshAccessToken();
        ({ uri, status } = await attemptDownload());
      }

      if (status !== 200) {
        throw new Error(`Download failed with status ${status}`);
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Saved', `File saved to ${uri}`);
      }
    } catch (err) {
      Alert.alert('Download failed', 'Could not generate the file. Please try again.');
    } finally {
      setDownloading(null);
    }
  }

  if (loading || !resume) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const sortedSections = [...resume.sections].sort((a, b) => a.order - b.order);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Resume Builder</Text>

      <Text style={styles.sectionLabel}>Personal Info</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={resume.personalInfo.fullName}
        onChangeText={(v) => updatePersonalInfo('fullName', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={resume.personalInfo.email}
        onChangeText={(v) => updatePersonalInfo('email', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone (optional)"
        value={resume.personalInfo.phone}
        onChangeText={(v) => updatePersonalInfo('phone', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Location (optional)"
        value={resume.personalInfo.location}
        onChangeText={(v) => updatePersonalInfo('location', v)}
      />

      <Text style={styles.sectionLabel}>Theme</Text>
      <Text style={styles.subLabel}>Font</Text>
      <View style={styles.chipRow}>
        {ALLOWED_FONTS.map((font) => (
          <TouchableOpacity
            key={font}
            style={[styles.fontChip, resume.theme.font === font && styles.fontChipActive]}
            onPress={() => setResume((prev) => ({ ...prev, theme: { ...prev.theme, font } }))}
          >
            <Text style={[{ fontFamily: undefined }, resume.theme.font === font && styles.fontChipTextActive]}>
              {font}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subLabel}>Accent color</Text>
      <View style={styles.chipRow}>
        {ALLOWED_ACCENT_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              resume.theme.accentColor === color && styles.colorSwatchActive,
            ]}
            onPress={() => setResume((prev) => ({ ...prev, theme: { ...prev.theme, accentColor: color } }))}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Sections</Text>
      <Text style={styles.hint}>Toggle visibility and reorder with the arrows — order here is the order on the document.</Text>
      {sortedSections.map((section, index) => (
        <SectionEditor
          key={section.type}
          section={section}
          onChange={(updated) => updateSection(resume.sections.indexOf(section), updated)}
          onMoveUp={() => moveSection(index, -1)}
          onMoveDown={() => moveSection(index, 1)}
          isFirst={index === 0}
          isLast={index === sortedSections.length - 1}
        />
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save resume'}</Text>
      </TouchableOpacity>

      <View style={styles.downloadRow}>
        <TouchableOpacity
          style={[styles.downloadButton, styles.pdfButton]}
          onPress={() => handleDownload('pdf')}
          disabled={!!downloading}
        >
          <Text style={styles.downloadText}>{downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.downloadButton, styles.docxButton]}
          onPress={() => handleDownload('docx')}
          disabled={!!downloading}
        >
          <Text style={styles.downloadText}>{downloading === 'docx' ? 'Preparing…' : 'Download DOCX'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 160 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  subLabel: { color: '#374151', marginBottom: 8, fontWeight: '500' },
  hint: { color: '#9CA3AF', fontSize: 12, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  fontChip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  fontChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  fontChipTextActive: { color: '#fff' },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: '#111827' },
  saveButton: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14, marginTop: 16 },
  saveText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  downloadRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  downloadButton: { flex: 1, borderRadius: 10, padding: 14 },
  pdfButton: { backgroundColor: '#DC2626' },
  docxButton: { backgroundColor: '#2563EB' },
  downloadText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 14 },
});
