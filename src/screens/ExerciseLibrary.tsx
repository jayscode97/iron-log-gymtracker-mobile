import { useState } from 'react'
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { useWorkoutDataContext } from '../context/WorkoutDataContext'
import PRBadge from '../components/PRBadge'
import type { ExerciseCategory } from '../types'

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

const PICKABLE_CATEGORIES: ExerciseCategory[] = [
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

export default function ExerciseLibrary() {
  const { exercises, records, addCustomExercise } = useWorkoutDataContext()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCatPicker, setShowCatPicker] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<ExerciseCategory>('Chest')

  const sections = CATEGORIES.map((cat) => ({
    title: cat,
    data: collapsed[cat] ? [] : exercises.filter((e) => e.category === cat),
  })).filter((s) => exercises.some((e) => e.category === s.title))

  function toggleCategory(cat: string) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  function handleAdd() {
    if (!newName.trim()) {
      Alert.alert('Name required', 'Please enter an exercise name.')
      return
    }
    addCustomExercise(newName.trim(), newCategory)
    setNewName('')
    setNewCategory('Chest')
    setShowAddModal(false)
  }

  function handleCancelAdd() {
    setNewName('')
    setNewCategory('Chest')
    setShowAddModal(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LIBRARY</Text>
        <Text style={styles.count}>{exercises.length} exercises</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleCategory(section.title)}
          >
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <View style={styles.sectionHeaderRight}>
              <Text style={styles.sectionCount}>
                {exercises.filter((e) => e.category === section.title).length}
              </Text>
              <Ionicons
                name={collapsed[section.title] ? 'chevron-down' : 'chevron-up'}
                size={15}
                color={theme.colors.textMuted}
              />
            </View>
          </TouchableOpacity>
        )}
        renderItem={({ item }) => {
          const pr = records.find((r) => r.exerciseId === item.id)
          return (
            <View style={[styles.exerciseRow, item.isCustom && styles.customRow]}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <View style={styles.exerciseMeta}>
                {pr && <Text style={styles.prText}>{pr.weight}kg × {pr.reps}</Text>}
                {pr && <PRBadge />}
              </View>
            </View>
          )
        }}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={18} color={theme.colors.accent} />
            <Text style={styles.addBtnText}>ADD CUSTOM EXERCISE</Text>
          </TouchableOpacity>
        )}
      />

      {/* Add Custom Exercise Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ADD EXERCISE</Text>

            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Exercise name"
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />

            <TouchableOpacity
              style={styles.catPickerBtn}
              onPress={() => setShowCatPicker(true)}
            >
              <Text style={styles.catPickerBtnText}>{newCategory}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelAdd}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
                <Text style={styles.confirmBtnText}>ADD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category picker */}
      <Modal
        visible={showCatPicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCatPicker(false)}
      >
        <TouchableOpacity
          style={styles.catOverlay}
          activeOpacity={1}
          onPress={() => setShowCatPicker(false)}
        >
          <View style={styles.catContent}>
            {PICKABLE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catOption, newCategory === cat && styles.catOptionActive]}
                onPress={() => {
                  setNewCategory(cat)
                  setShowCatPicker(false)
                }}
              >
                <Text
                  style={[
                    styles.catOptionText,
                    newCategory === cat && styles.catOptionTextActive,
                  ]}
                >
                  {cat}
                </Text>
                {newCategory === cat && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: 20,
    letterSpacing: 3,
  },
  count: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  list: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 12,
    letterSpacing: 2,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionCount: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  customRow: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    flex: 1,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: 16,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    padding: 14,
  },
  addBtnText: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.heading,
    fontSize: 15,
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  catPickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
  },
  catPickerBtnText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 14,
    letterSpacing: 1,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#000000',
    fontFamily: theme.fonts.heading,
    fontSize: 14,
    letterSpacing: 1,
  },
  catOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  catContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  catOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  catOptionActive: {
    backgroundColor: `${theme.colors.accent}15`,
  },
  catOptionText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  catOptionTextActive: {
    color: theme.colors.accent,
  },
})
