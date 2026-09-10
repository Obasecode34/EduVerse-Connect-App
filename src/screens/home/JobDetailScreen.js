import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { jobsApi } from '../../api/jobs';
import { useAuth } from '../../context/AuthContext';

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi
      .getById(jobId)
      .then(({ job: fetched }) => setJob(fetched))
      .catch(() => Alert.alert('Error', 'Could not load this job.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Job not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.company}>{job.company}</Text>
      {!!job.location && <Text style={styles.location}>{job.location}</Text>}

      <Text style={styles.sectionLabel}>Description</Text>
      <Text style={styles.description}>{job.description}</Text>

      {/* Cover-note-and-resume-attachment flow belongs to the Apply screen,
          not this one — kept as a placeholder navigation target for now. */}
      {user?.role === 'jobseeker' && job.status === 'approved' && (
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.navigate('ApplyToJob', { jobId: job._id, jobTitle: job.title })}
        >
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { color: '#6B7280' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  company: { fontSize: 16, color: '#374151', marginTop: 4 },
  location: { color: '#9CA3AF', marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginTop: 24, textTransform: 'uppercase' },
  description: { color: '#374151', marginTop: 8, lineHeight: 22 },
  applyButton: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14, marginTop: 32 },
  applyText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
