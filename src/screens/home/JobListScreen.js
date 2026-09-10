import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { jobsApi } from '../../api/jobs';
import JobCard from '../../components/JobCard';
import { SCHOLARSHIP_CLASSIFICATIONS } from '../../constants/jobOptions';

// One screen, parametrized by type — reused for all four top-tab views
// instead of four near-identical copies.
export default function JobListScreen({ route }) {
  const { type, label } = route.params;
  const navigation = useNavigation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classification, setClassification] = useState(null); // null = all classifications

  const fetchJobs = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      try {
        const params = { type };
        if (type === 'scholarship' && classification) params.classification = classification;
        const { jobs: fetched } = await jobsApi.list(params);
        setJobs(fetched);
      } catch (err) {
        // Feed staying empty on error (rather than crashing) is the right
        // default here — a network blip shouldn't nuke the whole screen.
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [type, classification]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <View style={styles.container}>
      {type === 'scholarship' && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !classification && styles.filterChipActive]}
            onPress={() => setClassification(null)}
          >
            <Text style={[styles.filterChipText, !classification && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {SCHOLARSHIP_CLASSIFICATIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.filterChip, classification === c && styles.filterChipActive]}
              onPress={() => setClassification(c)}
            >
              <Text style={[styles.filterChipText, classification === c && styles.filterChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => fetchJobs(true)}
          ListEmptyComponent={<Text style={styles.empty}>No {label.toLowerCase()} jobs right now.</Text>}
          renderItem={({ item }) => (
            <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item._id })} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingTop: 12 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  filterChipActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  filterChipText: { color: '#374151', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  listContent: { paddingBottom: 140 }, // clears the floating tab bar
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
