// _layout.tsx
import '../tamagui-web.css'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from 'components/Provider'
import { Theme } from 'tamagui' // ✅ Tambahkan ini untuk paksa tema Tamagui

export const unstable_settings = {
  initialRouteName: 'index',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) return null

  return (
    <Provider>
      <RootLayoutNav />
    </Provider>
  )
}

function RootLayoutNav() {
  return (
    // ✅ Paksa React Navigation selalu pakai DefaultTheme (light)
    <ThemeProvider value={DefaultTheme}>
      {/* ✅ Status bar hitam di atas background terang */}
      <StatusBar style="dark" />

      {/* ✅ Paksa Tamagui theme ke "light" */}
      <Theme name="light">
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </Theme>
    </ThemeProvider>
  )
}
