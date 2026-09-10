import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { resumesApi } from '../../api/resumes';
import { applicationsApi } from '../../api/applications';

export default function ApplyToJobScreen({ route, navigation }) {
  const { jobId, jobTitle } = route.params;

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [format, setFormat] = useState('pdf');
  const [coverNote, setCoverNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    resumesApi
      .list()
      .then(({ resumes: fetched }) => {
        setResumes(fetched);
        if (fetched.length > 0) setSelectedResumeId(fetched[0]._id);
      })
      .catch(() => Alert.alert('Error', 'Could not load your resumes.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    if (!selectedResumeId) {
      Alert.alert('No resume selected', 'Build a resume first, then come back to apply.');
      return;
    }

    setSubmitting(true);
    try {
      // resumeSnapshot is the resume's full data AS OF right now — the backend
      // stores this copy permanently, so if the resume is edited later the
      // employer still sees what was actually submitted with this application.
      const resume = resumes.find((r) => r._id === selectedResumeId);
      await applicationsApi.apply(jobId, {
        resumeSnapshot: resume,
        resumeFormat: format,
        coverNote: coverNote.trim() || undefined,
      });
      Alert.alert('Application sent', `Your application for "${jobTitle}" was submitted.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message =
        err.response?.status === 409
          ? 'You already applied to this job.'
          : err.response?.data?.message || 'Something went wrong.';
      Alert.alert('Could not apply', message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (resumes.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No resume yet</Text>
        <Text style={styles.emptyText}>
          Build a resume in the Resume tab before applying — employers need something to review.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Apply to "{jobTitle}"</Text>

      <Text style={styles.label}>Resume</Text>
      {resumes.map((r) => (
        <TouchableOpacity
          key={r._id}
          style={[styles.resumeOption, selectedResumeId === r._id && styles.resumeOptionActive]}
          onPress={() => setSelectedResumeId(r._id)}
        >
          <Text style={[styles.resumeOptionText, selectedResumeId === r._id && styles.resumeOptionTextActive]}>
            {r.title}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Format to submit</Text>
      <View style={styles.chipRow}>
        {['pdf', 'docx'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.formatChip, format === f && styles.formatChipActive]}
            onPress={() => setFormat(f)}
          >
            <Text style={[styles.formatChipText, format === f && styles.formatChipTextActive]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Cover note (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="A short note to the employer…"
        multiline
        value={coverNote}
        onChangeText={setCoverNote}
        maxLength={2000}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit application'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyText: { color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  heading: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
  label: { color: '#374151', fontWeight: '600', marginTop: 16, marginBottom: 8 },
  resumeOption: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, marginBottom: 8 },
  resumeOptionActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  resumeOptionText: { color: '#374151' },
  resumeOptionTextActive: { color: '#2563EB', fontWeight: '600' },
  chipRow: { flexDirection: 'row', gap: 8 },
  formatChip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  formatChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  formatChipText: { color: '#374151', fontWeight: '600' },
  formatChipTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, fontSize: 14 },
  multiline: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14, marginTop: 24 },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
