import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { jobsApi } from '../../api/jobs';
import { adminApi } from '../../api/admin';

function JobModerationCard({ job, onDecide }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{job.title}</Text>
      <Text style={styles.cardMeta}>{job.company} · {job.type}{job.classification ? ` · ${job.classification}` : ''}</Text>
      <Text style={styles.cardMeta}>By {job.employer?.fullName} ({job.employer?.email})</Text>
      <Text style={styles.cardDescription} numberOfLines={3}>{job.description}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => onDecide(job._id, 'reject')}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton} onPress={() => onDecide(job._id, 'approve')}>
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmployerVerificationCard({ employer, onVerify, onReject }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{employer.fullName}</Text>
      <Text style={styles.cardMeta}>{employer.email}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => onReject(employer._id)}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton} onPress={() => onVerify(employer._id)}>
          <Text style={styles.approveText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminModerationScreen() {
  const [tab, setTab] = useState('jobs'); // 'jobs' | 'employers'
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ jobs: pendingJobs }, { employers: pendingEmployers }] = await Promise.all([
        jobsApi.pending(),
        adminApi.pendingEmployers(),
      ]);
      setJobs(pendingJobs);
      setEmployers(pendingEmployers);
    } catch (err) {
      Alert.alert('Error', 'Could not load the moderation queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  async function handleJobDecision(jobId, decision) {
    try {
      await jobsApi.moderate(jobId, { decision });
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      Alert.alert('Error', 'Could not update this job.');
    }
  }

  async function handleVerify(employerId) {
    try {
      await adminApi.verifyEmployer(employerId);
      setEmployers((prev) => prev.filter((e) => e._id !== employerId));
    } catch (err) {
      Alert.alert('Error', 'Could not verify this employer.');
    }
  }

  async function handleRejectEmployer(employerId) {
    Alert.alert('Reject employer', 'This deletes the pending employer account. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminApi.rejectEmployer(employerId);
            setEmployers((prev) => prev.filter((e) => e._id !== employerId));
          } catch (err) {
            Alert.alert('Error', 'Could not reject this employer.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segment, tab === 'jobs' && styles.segmentActive]}
          onPress={() => setTab('jobs')}
        >
          <Text style={[styles.segmentText, tab === 'jobs' && styles.segmentTextActive]}>
            Jobs ({jobs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, tab === 'employers' && styles.segmentActive]}
          onPress={() => setTab('employers')}
        >
          <Text style={[styles.segmentText, tab === 'employers' && styles.segmentTextActive]}>
            Employers ({employers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : tab === 'jobs' ? (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={loadData}
          refreshing={false}
          ListEmptyComponent={<Text style={styles.empty}>No jobs waiting for review.</Text>}
          renderItem={({ item }) => <JobModerationCard job={item} onDecide={handleJobDecision} />}
        />
      ) : (
        <FlatList
          data={employers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={loadData}
          refreshing={false}
          ListEmptyComponent={<Text style={styles.empty}>No employers waiting for verification.</Text>}
          renderItem={({ item }) => (
            <EmployerVerificationCard employer={item} onVerify={handleVerify} onReject={handleRejectEmployer} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 12 },
  segmentRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  segment: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 10, alignItems: 'center' },
  segmentActive: { backgroundColor: '#111827', borderColor: '#111827' },
  segmentText: { color: '#374151', fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 140 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardMeta: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  cardDescription: { color: '#374151', marginTop: 8, fontSize: 13, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectButton: { flex: 1, borderWidth: 1, borderColor: '#DC2626', borderRadius: 8, padding: 10 },
  rejectText: { color: '#DC2626', textAlign: 'center', fontWeight: '600' },
  approveButton: { flex: 1, backgroundColor: '#16A34A', borderRadius: 8, padding: 10 },
  approveText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
