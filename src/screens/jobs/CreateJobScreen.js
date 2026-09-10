import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { jobsApi } from '../../api/jobs';
import { JOB_TYPES as TYPES, SCHOLARSHIP_CLASSIFICATIONS } from '../../constants/jobOptions';

const EMPTY_FORM = { title: '', description: '', company: '', location: '', type: 'onsite', classification: '' };

export default function CreateJobScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // The server enforces this too (requireRole('employer') on the route) —
  // this check exists so a jobseeker sees an explanation instead of landing
  // on a form that will just fail on submit. Belt and suspenders, not
  // either/or: the real gate is server-side, this is just better UX.
  if (user?.role !== 'employer') {
    return (
      <View style={styles.center}>
        <Text style={styles.blockedTitle}>Employers only</Text>
        <Text style={styles.blockedText}>
          Job posting is available to employer accounts. Contact support if you believe this is a mistake.
        </Text>
      </View>
    );
  }

  if (!user.employerVerified) {
    return (
      <View style={styles.center}>
        <Text style={styles.blockedTitle}>Verification pending</Text>
        <Text style={styles.blockedText}>
          Your employer account is awaiting admin verification before you can post jobs.
        </Text>
      </View>
    );
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.title || !form.description || !form.company) {
      Alert.alert('Missing fields', 'Title, description, and company are required.');
      return;
    }
    if (form.type === 'scholarship' && !form.classification.trim()) {
      Alert.alert('Missing classification', 'Scholarships need a classification (e.g. Undergraduate).');
      return;
    }

    setSubmitting(true);
    try {
      await jobsApi.create({
        ...form,
        classification: form.type === 'scholarship' ? form.classification.trim() : undefined,
      });
      Alert.alert('Submitted', 'Your job has been sent for admin review.');
      setForm(EMPTY_FORM);
    } catch (err) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : err.response?.data?.message || 'Something went wrong.';
      Alert.alert('Could not post job', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Post a job</Text>

      <TextInput style={styles.input} placeholder="Job title" value={form.title} onChangeText={(v) => update('title', v)} />
      <TextInput style={styles.input} placeholder="Company" value={form.company} onChangeText={(v) => update('company', v)} />
      <TextInput style={styles.input} placeholder="Location (optional)" value={form.location} onChangeText={(v) => update('location', v)} />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        multiline
        numberOfLines={5}
        value={form.description}
        onChangeText={(v) => update('description', v)}
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.chip, form.type === t.value && styles.chipActive]}
            onPress={() => update('type', t.value)}
          >
            <Text style={[styles.chipText, form.type === t.value && styles.chipTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {form.type === 'scholarship' && (
        <>
          <Text style={styles.label}>Classification</Text>
          <View style={styles.chipRow}>
            {SCHOLARSHIP_CLASSIFICATIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, form.classification === c && styles.chipActive]}
                onPress={() => update('classification', c)}
              >
                <Text style={[styles.chipText, form.classification === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.disclaimer}>Submitted jobs go to admin review before appearing publicly.</Text>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit for review'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 160 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  blockedTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  blockedText: { color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  heading: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    padding: 14, marginBottom: 12, fontSize: 15,
  },
  multiline: { height: 110, textAlignVertical: 'top' },
  label: { color: '#374151', fontWeight: '500', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  disclaimer: { color: '#9CA3AF', fontSize: 12, marginBottom: 16 },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14 },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
