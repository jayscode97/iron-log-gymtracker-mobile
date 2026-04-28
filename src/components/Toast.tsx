import { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'

interface ToastProps {
  visible: boolean
  message: string
  variant?: 'success' | 'pr' | 'error'
  onHide?: () => void
}

export default function Toast({ visible, message, variant = 'success', onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return

    translateY.setValue(100)
    opacity.setValue(0)

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onHide?.())
    }, 2500)

    return () => clearTimeout(timer)
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  const bgColor =
    variant === 'pr'
      ? theme.colors.accent
      : variant === 'error'
        ? theme.colors.danger
        : theme.colors.success

  const textColor = variant === 'pr' ? '#000000' : '#ffffff'

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, transform: [{ translateY }], opacity },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: theme.radius.lg,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 14,
    textAlign: 'center',
  },
})
