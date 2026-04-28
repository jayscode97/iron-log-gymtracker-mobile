import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'

export default function PRBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>PR</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    color: '#000000',
    fontFamily: theme.fonts.heading,
    fontSize: 10,
    letterSpacing: 0.5,
  },
})
