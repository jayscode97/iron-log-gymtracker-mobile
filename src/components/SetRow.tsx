import { useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import type { SetEntry } from '../types'

interface SetRowProps {
  set: SetEntry
  onUpdate: (set: SetEntry) => void
  onDelete: () => void
}

export default function SetRow({ set, onUpdate, onDelete }: SetRowProps) {
  const swipeableRef = useRef<Swipeable>(null)

  function renderRightActions() {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close()
          onDelete()
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#ffffff" />
      </TouchableOpacity>
    )
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <View style={styles.row}>
        <Text style={styles.setNum}>{set.setNumber}</Text>
        <TextInput
          style={styles.input}
          value={set.weight > 0 ? String(set.weight) : ''}
          onChangeText={(t) => onUpdate({ ...set, weight: parseFloat(t) || 0 })}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="next"
          selectTextOnFocus
        />
        <TextInput
          style={styles.input}
          value={set.reps > 0 ? String(set.reps) : ''}
          onChangeText={(t) => onUpdate({ ...set, reps: parseInt(t) || 0 })}
          keyboardType="number-pad"
          placeholder="—"
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="next"
          selectTextOnFocus
        />
        <TextInput
          style={[styles.input, styles.rpeInput]}
          value={set.rpe !== undefined && set.rpe > 0 ? String(set.rpe) : ''}
          onChangeText={(t) => onUpdate({ ...set, rpe: t ? parseFloat(t) : undefined })}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="done"
          selectTextOnFocus
        />
      </View>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  setNum: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 14,
    width: 24,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    textAlign: 'center',
    minHeight: 38,
  },
  rpeInput: {
    flex: 0.7,
  },
  deleteAction: {
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
  },
})
