import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SECTION_FIELDS, blankEntry } from '../../constants/resumeOptions';

function EntryFields({ type, entry, onChange }) {
  const fields = SECTION_FIELDS[type];
  return (
    <View style={styles.entryFields}>
      {fields.map((f) => {
        const rawValue = f.isBullets ? (entry.bullets || []).join('\n') : entry[f.key] || '';
        return (
          <TextInput
            key={f.key}
            style={[styles.entryInput, f.multiline && styles.multiline]}
            placeholder={f.label}
            multiline={f.multiline}
            value={rawValue}
            onChangeText={(text) => {
              if (f.isBullets) {
                onChange({ ...entry, bullets: text.split('\n') });
              } else {
                onChange({ ...entry, [f.key]: text });
              }
            }}
          />
        );
      })}
    </View>
  );
}

// Section reordering (up/down) and the visibility switch are what map
// directly to the 'order' and 'visible' fields the backend model stores —
// there's no drag-and-drop, but the effect on the saved data is identical.
export default function SectionEditor({ section, onChange, onMoveUp, onMoveDown, isFirst, isLast }) {
  const isSummary = section.type === 'summary';

  function updateEntry(index, updatedEntry) {
    const items = [...section.items];
    items[index] = updatedEntry;
    onChange({ ...section, items });
  }

  function addEntry() {
    onChange({ ...section, items: [...section.items, blankEntry(section.type)] });
  }

  function removeEntry(index) {
    onChange({ ...section, items: section.items.filter((_, i) => i !== index) });
  }

  return (
    <View style={[styles.card, !section.visible && styles.cardHidden]}>
      <View style={styles.header}>
        <View style={styles.reorderColumn}>
          <TouchableOpacity disabled={isFirst} onPress={onMoveUp}>
            <Ionicons name="chevron-up" size={18} color={isFirst ? '#D1D5DB' : '#374151'} />
          </TouchableOpacity>
          <TouchableOpacity disabled={isLast} onPress={onMoveDown}>
            <Ionicons name="chevron-down" size={18} color={isLast ? '#D1D5DB' : '#374151'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{section.title}</Text>
        <Switch
          value={section.visible}
          onValueChange={(visible) => onChange({ ...section, visible })}
          trackColor={{ true: '#2563EB' }}
        />
      </View>

      {section.visible && (
        <>
          {isSummary ? (
            <TextInput
              style={[styles.entryInput, styles.multiline]}
              placeholder="A short professional summary…"
              multiline
              value={section.items?.text || ''}
              onChangeText={(text) => onChange({ ...section, items: { text } })}
            />
          ) : (
            <>
              {section.items.map((entry, index) => (
                <View key={index} style={styles.entryCard}>
                  <EntryFields type={section.type} entry={entry} onChange={(e) => updateEntry(index, e)} />
                  <TouchableOpacity style={styles.removeEntry} onPress={() => removeEntry(index)}>
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    <Text style={styles.removeEntryText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addEntry} onPress={addEntry}>
                <Ionicons name="add" size={18} color="#2563EB" />
                <Text style={styles.addEntryText}>Add {section.title.toLowerCase()} entry</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#F3F4F6' },
  cardHidden: { opacity: 0.5 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reorderColumn: { alignItems: 'center' },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  entryFields: { gap: 8 },
  entryInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 14, marginTop: 10,
  },
  multiline: { height: 70, textAlignVertical: 'top' },
  entryCard: { borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 10, paddingTop: 4 },
  removeEntry: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-start' },
  removeEntryText: { color: '#DC2626', fontSize: 12 },
  addEntry: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, alignSelf: 'flex-start' },
  addEntryText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
});
