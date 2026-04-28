import { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { format } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { useWorkoutDataContext } from '../context/WorkoutDataContext'
import ExercisePickerModal from '../components/ExercisePickerModal'
import SetRow from '../components/SetRow'
import Toast from '../components/Toast'
import type { ExerciseLog, SetEntry, WorkoutSession, Exercise } from '../types'

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function defaultSessionName(): string {
  return `Session — ${format(new Date(), 'MMM d')}`
}

interface ToastState {
  visible: boolean
  message: string
  variant: 'success' | 'pr' | 'error'
}

export default function SessionBuilder() {
  const { exercises, saveSession, checkAndUpdatePR } = useWorkoutDataContext()
  const scrollRef = useRef<ScrollView>(null)

  const [sessionName, setSessionName] = useState(defaultSessionName)
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([])
  const [sessionNotes, setSessionNotes] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  })

  function showToast(message: string, variant: ToastState['variant']) {
    setToast({ visible: true, message, variant })
  }

  function addExercise(exercise: Exercise) {
    if (exerciseLogs.some((l) => l.exerciseId === exercise.id)) {
      setShowPicker(false)
      return
    }
    const newLog: ExerciseLog = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ setNumber: 1, weight: 0, reps: 0 }],
      notes: '',
    }
    setExerciseLogs((prev) => [...prev, newLog])
    setShowPicker(false)
  }

  function removeExercise(exerciseId: string) {
    setExerciseLogs((prev) => prev.filter((l) => l.exerciseId !== exerciseId))
  }

  function addSet(exerciseId: string) {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log
        const prevSet = log.sets[log.sets.length - 1]
        const newSet: SetEntry = {
          setNumber: log.sets.length + 1,
          weight: prevSet ? prevSet.weight : 0,
          reps: prevSet ? prevSet.reps : 0,
        }
        return { ...log, sets: [...log.sets, newSet] }
      })
    )
  }

  function updateSet(exerciseId: string, index: number, updatedSet: SetEntry) {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log
        const sets = [...log.sets]
        sets[index] = updatedSet
        return { ...log, sets }
      })
    )
  }

  function removeSet(exerciseId: string, index: number) {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log
        const sets = log.sets
          .filter((_, i) => i !== index)
          .map((s, i) => ({ ...s, setNumber: i + 1 }))
        return { ...log, sets }
      })
    )
  }

  function updateExerciseNotes(exerciseId: string, notes: string) {
    setExerciseLogs((prev) =>
      prev.map((log) => (log.exerciseId === exerciseId ? { ...log, notes } : log))
    )
  }

  function finishSession() {
    if (exerciseLogs.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise before finishing.')
      return
    }

    const now = new Date().toISOString()
    const session: WorkoutSession = {
      id: generateId(),
      date: now,
      name: sessionName.trim() || defaultSessionName(),
      exercises: exerciseLogs,
      notes: sessionNotes,
    }

    saveSession(session)

    const newPRNames: string[] = []
    for (const log of exerciseLogs) {
      if (log.sets.length === 0) continue
      const bestSet = log.sets.reduce(
        (best, s) => (s.weight > best.weight ? s : best),
        log.sets[0]
      )
      if (bestSet.weight > 0) {
        const isPR = checkAndUpdatePR(
          log.exerciseId,
          log.exerciseName,
          bestSet.weight,
          bestSet.reps,
          now
        )
        if (isPR) newPRNames.push(log.exerciseName)
      }
    }

    if (newPRNames.length > 0) {
      showToast(`🏆 New PR! ${newPRNames.join(', ')}`, 'pr')
    } else {
      showToast('Session saved!', 'success')
    }

    setSessionName(defaultSessionName())
    setExerciseLogs([])
    setSessionNotes('')
    scrollRef.current?.scrollTo({ y: 0, animated: true })
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.screenLabel}>IRON LOG</Text>

            <TextInput
              style={styles.sessionNameInput}
              value={sessionName}
              onChangeText={setSessionName}
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="done"
            />

            {exerciseLogs.map((log) => (
              <View key={log.exerciseId} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName} numberOfLines={1}>
                    {log.exerciseName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeExercise(log.exerciseId)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={22}
                      color={theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.setHeaders}>
                  <Text style={[styles.setHeaderCell, { width: 24 }]}>#</Text>
                  <Text style={[styles.setHeaderCell, { flex: 1 }]}>KG</Text>
                  <Text style={[styles.setHeaderCell, { flex: 1 }]}>REPS</Text>
                  <Text style={[styles.setHeaderCell, { flex: 0.7 }]}>RPE</Text>
                </View>

                {log.sets.map((set, i) => (
                  <SetRow
                    key={i}
                    set={set}
                    onUpdate={(updated) => updateSet(log.exerciseId, i, updated)}
                    onDelete={() => removeSet(log.exerciseId, i)}
                  />
                ))}

                <TouchableOpacity
                  style={styles.addSetBtn}
                  onPress={() => addSet(log.exerciseId)}
                >
                  <Ionicons name="add" size={15} color={theme.colors.accent} />
                  <Text style={styles.addSetText}>ADD SET</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.exerciseNotesInput}
                  value={log.notes}
                  onChangeText={(t) => updateExerciseNotes(log.exerciseId, t)}
                  placeholder="Exercise notes..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.addExerciseBtn}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="add" size={18} color={theme.colors.accent} />
              <Text style={styles.addExerciseBtnText}>ADD EXERCISE</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.sessionNotesInput}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              placeholder="Session notes..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.finishBtn} onPress={finishSession}>
              <Text style={styles.finishBtnText}>FINISH SESSION</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ExercisePickerModal
        visible={showPicker}
        exercises={exercises}
        onSelect={addExercise}
        onClose={() => setShowPicker(false)}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  screenLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 8,
  },
  sessionNameInput: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 26,
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 16,
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 8,
  },
  setHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  setHeaderCell: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 10,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  addSetText: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.heading,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  exerciseNotesInput: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    minHeight: 36,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 16,
  },
  addExerciseBtnText: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.heading,
    fontSize: 15,
    letterSpacing: 2,
  },
  sessionNotesInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 12,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 20,
  },
  finishBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    padding: 16,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#000000',
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    letterSpacing: 2,
  },
})
