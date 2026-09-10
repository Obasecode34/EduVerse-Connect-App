import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TYPE_COLORS = {
  onsite: '#2563EB',
  remote: '#16A34A',
  hybrid: '#7C3AED',
  scholarship: '#DC2626',
};

export default function JobCard({ job, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
        <View style={[styles.badge, { backgroundColor: TYPE_COLORS[job.type] }]}>
          <Text style={styles.badgeText}>
            {job.type === 'scholarship' ? job.classification || 'Scholarship' : job.type}
          </Text>
        </View>
      </View>
      <Text style={styles.company}>{job.company}</Text>
      {!!job.location && <Text style={styles.location}>{job.location}</Text>}
      <Text style={styles.snippet} numberOfLines={2}>{job.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  company: { color: '#374151', marginTop: 4, fontWeight: '500' },
  location: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  snippet: { color: '#6B7280', marginTop: 8, fontSize: 13, lineHeight: 18 },
});
