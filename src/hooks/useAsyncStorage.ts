import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState, useEffect, useCallback } from 'react'

export function useAsyncStorage<T>(
  key: string,
  initialValue: T
): [T, (val: T) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((item) => {
        if (item !== null) {
          setStoredValue(JSON.parse(item) as T)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [key])

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value)
      AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {})
    },
    [key]
  )

  return [storedValue, setValue, loading]
}
