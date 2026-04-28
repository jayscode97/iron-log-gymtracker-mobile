import { createContext, useContext, type ReactNode } from 'react'
import { useWorkoutData } from '../hooks/useWorkoutData'

type WorkoutDataContextType = ReturnType<typeof useWorkoutData>

const WorkoutDataContext = createContext<WorkoutDataContextType | null>(null)

export function WorkoutDataProvider({ children }: { children: ReactNode }) {
  const workoutData = useWorkoutData()
  return (
    <WorkoutDataContext.Provider value={workoutData}>
      {children}
    </WorkoutDataContext.Provider>
  )
}

export function useWorkoutDataContext(): WorkoutDataContextType {
  const ctx = useContext(WorkoutDataContext)
  if (!ctx) throw new Error('useWorkoutDataContext must be used within WorkoutDataProvider')
  return ctx
}
