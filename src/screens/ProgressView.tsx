import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { useWorkoutDataContext } from '../context/WorkoutDataContext'
import { formatDate, formatShortDate, formatWeight } from '../utils/formatters'
import type { Exercise } from '../types'

const CHART_WIDTH = Dimensions.get('window').width - 32

export default function ProgressView() {
  const { exercises, records, getVolumeHistory } = useWorkoutDataContext()
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  const pr = selectedExercise
    ? records.find((r) => r.exerciseId === selectedExercise.id)
    : null

  const history = selectedExercise ? getVolumeHistory(selectedExercise.id) : []

  const weightData = history.map((h, i) => ({ x: i + 1, y: h.maxWeight }))
  const volumeData = history.map((h, i) => ({ x: i + 1, y: h.totalVolume }))

  const axisStyle = {
    axis: { stroke: theme.colors.border },
    tickLabels: {
      fill: theme.colors.textMuted,
      fontSize: 9,
      fontFamily: theme.fonts.body,
    },
    grid: { stroke: 'transparent' },
  }

  const dependentAxisStyle = {
    axis: { stroke: theme.colors.border },
    tickLabels: {
      fill: theme.colors.textMuted,
      fontSize: 9,
      fontFamily: theme.fonts.body,
    },
    grid: { stroke: theme.colors.border, strokeDasharray: '4,4' },
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PROGRESS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowPicker(true)}>
          <Text style={styles.pickerBtnText}>
            {selectedExercise ? selectedExercise.name : 'SELECT EXERCISE'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.accent} />
        </TouchableOpacity>

        {!selectedExercise && (
          <View style={styles.emptyState}>
            <Ionicons name="trending-up-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Select an exercise to view progress</Text>
          </View>
        )}

        {selectedExercise && history.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>
              No logged sets for {selectedExercise.name} yet
            </Text>
          </View>
        )}

        {selectedExercise && history.length > 0 && (
          <>
            {pr && (
              <View style={styles.prCard}>
                <Text style={styles.prLabel}>PERSONAL RECORD</Text>
                <Text style={styles.prWeight}>{formatWeight(pr.weight)}</Text>
                <Text style={styles.prDetail}>
                  {pr.reps} reps · {formatDate(pr.date)}
                </Text>
              </View>
            )}

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>MAX WEIGHT OVER TIME</Text>
              <VictoryChart
                width={CHART_WIDTH}
                height={220}
                theme={VictoryTheme.material}
                padding={{ top: 16, bottom: 44, left: 52, right: 16 }}
                domainPadding={{ x: 24 }}
              >
                <VictoryAxis
                  tickFormat={(t: number) => {
                    const h = history[Math.round(t) - 1]
                    return h ? formatShortDate(h.date) : ''
                  }}
                  style={axisStyle}
                />
                <VictoryAxis dependentAxis style={dependentAxisStyle} />
                <VictoryLine
                  data={weightData}
                  style={{ data: { stroke: theme.colors.accent, strokeWidth: 2 } }}
                  interpolation="monotoneX"
                />
              </VictoryChart>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>SESSION VOLUME</Text>
              <VictoryChart
                width={CHART_WIDTH}
                height={220}
                theme={VictoryTheme.material}
                padding={{ top: 16, bottom: 44, left: 64, right: 16 }}
                domainPadding={{ x: 24 }}
              >
                <VictoryAxis
                  tickFormat={(t: number) => {
                    const h = history[Math.round(t) - 1]
                    return h ? formatShortDate(h.date) : ''
                  }}
                  style={axisStyle}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t: number) =>
                    t >= 1000 ? `${(t / 1000).toFixed(1)}k` : String(t)
                  }
                  style={dependentAxisStyle}
                />
                <VictoryBar
                  data={volumeData}
                  style={{ data: { fill: theme.colors.accent, opacity: 0.85 } }}
                />
              </VictoryChart>
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showPicker}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SELECT EXERCISE</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedExercise?.id === item.id && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setSelectedExercise(item)
                  setShowPicker(false)
                }}
              >
                <Text style={styles.pickerItemName}>{item.name}</Text>
                <Text style={styles.pickerItemCat}>{item.category}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
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
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 20,
  },
  pickerBtnText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  prCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  prLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  prWeight: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.heading,
    fontSize: 40,
    letterSpacing: 1,
  },
  prDetail: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.heading,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    letterSpacing: 2,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerItemActive: {
    backgroundColor: theme.colors.surface,
  },
  pickerItemName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  pickerItemCat: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
})
