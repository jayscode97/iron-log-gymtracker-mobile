import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import type { Exercise, ExerciseCategory } from '../types'

interface ExercisePickerModalProps {
  visible: boolean
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

const CATEGORIES: ExerciseCategory[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
  'Cardio',
  'Custom',
]

export default function ExercisePickerModal({
  visible,
  exercises,
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = search
    ? exercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : exercises

  const sections = CATEGORIES.map((cat) => ({
    title: cat,
    data: collapsed[cat] ? [] : filtered.filter((e) => e.category === cat),
  })).filter((s) => filtered.some((e) => e.category === s.title))

  function toggleCategory(cat: string) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  function handleClose() {
    setSearch('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ADD EXERCISE</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises..."
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderSectionHeader={({ section }) => (
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleCategory(section.title)}
            >
              <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
              <Ionicons
                name={collapsed[section.title] ? 'chevron-down' : 'chevron-up'}
                size={16}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseRow}
              onPress={() => {
                setSearch('')
                onSelect(item)
              }}
            >
              <Text style={[styles.exerciseName, item.isCustom && styles.customName]}>
                {item.name}
              </Text>
              {item.isCustom && <Text style={styles.customBadge}>CUSTOM</Text>}
            </TouchableOpacity>
          )}
          stickySectionHeadersEnabled
        />
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    letterSpacing: 2,
  },
  search: {
    margin: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    flex: 1,
  },
  customName: {
    color: theme.colors.accent,
  },
  customBadge: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.heading,
    fontSize: 10,
    letterSpacing: 1,
  },
})
