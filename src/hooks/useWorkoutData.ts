import { useAsyncStorage } from './useAsyncStorage'
import { defaultExercises } from '../data/defaultExercises'
import type { Exercise, WorkoutSession, PersonalRecord, ExerciseCategory } from '../types'

const KEYS = {
  exercises: 'iron-log:exercises',
  sessions: 'iron-log:sessions',
  records: 'iron-log:records',
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function useWorkoutData() {
  const [exercises, setExercises, exercisesLoading] = useAsyncStorage<Exercise[]>(
    KEYS.exercises,
    defaultExercises
  )
  const [sessions, setSessions, sessionsLoading] = useAsyncStorage<WorkoutSession[]>(
    KEYS.sessions,
    []
  )
  const [records, setRecords, recordsLoading] = useAsyncStorage<PersonalRecord[]>(
    KEYS.records,
    []
  )

  const loading = exercisesLoading || sessionsLoading || recordsLoading

  function addCustomExercise(name: string, category: ExerciseCategory) {
    const newEx: Exercise = {
      id: generateId(),
      name,
      category,
      isCustom: true,
    }
    setExercises([...exercises, newEx])
    return newEx
  }

  function saveSession(session: WorkoutSession) {
    setSessions([session, ...sessions])
  }

  function deleteSession(id: string) {
    setSessions(sessions.filter((s) => s.id !== id))
  }

  function checkAndUpdatePR(
    exerciseId: string,
    exerciseName: string,
    weight: number,
    reps: number,
    date: string
  ): boolean {
    const existing = records.find((r) => r.exerciseId === exerciseId)
    if (!existing || weight > existing.weight) {
      const newRecord: PersonalRecord = { exerciseId, exerciseName, weight, reps, date }
      setRecords([...records.filter((r) => r.exerciseId !== exerciseId), newRecord])
      return true
    }
    return false
  }

  function getSessionsForExercise(exerciseId: string): WorkoutSession[] {
    return sessions.filter((s) => s.exercises.some((e) => e.exerciseId === exerciseId))
  }

  function getVolumeHistory(
    exerciseId: string
  ): { date: string; totalVolume: number; maxWeight: number }[] {
    const relevant = getSessionsForExercise(exerciseId)
    return relevant
      .map((s) => {
        const log = s.exercises.find((e) => e.exerciseId === exerciseId)
        if (!log) return null
        const totalVolume = log.sets.reduce((sum, set) => sum + set.weight * set.reps, 0)
        const maxWeight = Math.max(...log.sets.map((set) => set.weight), 0)
        return { date: s.date, totalVolume, maxWeight }
      })
      .filter(
        (x): x is { date: string; totalVolume: number; maxWeight: number } => x !== null
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  return {
    loading,
    exercises,
    addCustomExercise,
    sessions,
    saveSession,
    deleteSession,
    records,
    checkAndUpdatePR,
    getSessionsForExercise,
    getVolumeHistory,
  }
}
