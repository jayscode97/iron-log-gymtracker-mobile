import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { useWorkoutDataContext } from '../context/WorkoutDataContext'
import { formatDate, formatVolume } from '../utils/formatters'
import Toast from '../components/Toast'
import type { WorkoutSession } from '../types'

interface ToastState {
  visible: boolean
  message: string
  variant: 'success' | 'pr' | 'error'
}

function getTotalVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, ex) => total + ex.sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
    0
  )
}

export default function SessionHistory() {
  const { sessions, deleteSession } = useWorkoutDataContext()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  })

  function handleDelete(session: WorkoutSession) {
    Alert.alert('Delete Session', `Delete "${session.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSession(session.id)
          if (expandedId === session.id) setExpandedId(null)
          setToast({ visible: true, message: 'Session deleted', variant: 'error' })
        },
      },
    ])
  }

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HISTORY</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptySubtitle}>Finish your first session to see it here</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>HISTORY</Text>
          <Text style={styles.count}>{sessions.length} sessions</Text>
        </View>

        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id
            const totalVolume = getTotalVolume(item)

            return (
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  onLongPress={() => handleDelete(item)}
                  delayLongPress={500}
                >
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                    <Text style={styles.cardName}>{item.name}</Text>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <Text style={styles.cardVolume}>{formatVolume(totalVolume)}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>

                {!isExpanded && (
                  <View style={styles.summaryRow}>
                    {item.exercises.map((ex) => {
                      const bestSet = ex.sets.reduce(
                        (best, s) => (s.weight > best.weight ? s : best),
                        ex.sets[0]
                      )
                      return (
                        <Text key={ex.exerciseId} style={styles.summaryTag}>
                          {ex.exerciseName} — {ex.sets.length}×{bestSet?.weight ?? 0}kg
                        </Text>
                      )
                    })}
                  </View>
                )}

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {item.exercises.map((ex) => (
                      <View key={ex.exerciseId} style={styles.exerciseSection}>
                        <Text style={styles.exerciseTitle}>{ex.exerciseName}</Text>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.tableHeaderCell, { width: 32 }]}>SET</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>WEIGHT</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>REPS</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>RPE</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>VOL</Text>
                        </View>
                        {ex.sets.map((set) => (
                          <View key={set.setNumber} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { width: 32 }]}>
                              {set.setNumber}
                            </Text>
                            <Text style={[styles.tableCell, { flex: 1 }]}>
                              {set.weight}kg
                            </Text>
                            <Text style={[styles.tableCell, { flex: 1 }]}>{set.reps}</Text>
                            <Text style={[styles.tableCell, { flex: 1 }]}>
                              {set.rpe ?? '—'}
                            </Text>
                            <Text style={[styles.tableCell, { flex: 1 }]}>
                              {set.weight * set.reps}kg
                            </Text>
                          </View>
                        ))}
                        {ex.notes ? (
                          <Text style={styles.exerciseNotes}>{ex.notes}</Text>
                        ) : null}
                      </View>
                    ))}

                    {item.notes ? (
                      <View style={styles.sessionNotesSection}>
                        <Text style={styles.sessionNotesLabel}>SESSION NOTES</Text>
                        <Text style={styles.sessionNotesText}>{item.notes}</Text>
                      </View>
                    ) : null}

                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>TOTAL VOLUME</Text>
                      <Text style={styles.totalValue}>{formatVolume(totalVolume)}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item)}
                    >
                      <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
                      <Text style={styles.deleteBtnText}>DELETE SESSION</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )
          }}
        />
      </SafeAreaView>

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
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    marginTop: 8,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDate: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginBottom: 2,
  },
  cardName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  cardVolume: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.heading,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    paddingTop: 0,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryTag: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  exerciseSection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  exerciseTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 14,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tableHeaderCell: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  tableCell: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: 'center',
  },
  exerciseNotes: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  sessionNotesSection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sessionNotesLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sessionNotesText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  totalLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  totalValue: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.heading,
    fontSize: 16,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
  },
  deleteBtnText: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.heading,
    fontSize: 13,
    letterSpacing: 1,
  },
})
