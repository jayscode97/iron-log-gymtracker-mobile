import 'react-native-gesture-handler'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed'
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter'
import { WorkoutDataProvider } from './src/context/WorkoutDataContext'
import TabNavigator from './src/navigation/TabNavigator'

SplashScreen.preventAutoHideAsync()

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <WorkoutDataProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <TabNavigator />
          </NavigationContainer>
        </WorkoutDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
