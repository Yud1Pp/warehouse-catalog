import { StatusBar, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { styled, YStack } from 'tamagui'

export const AppContainerFrame = styled(YStack, {
  flex: 1,
  bg: '$background'
})

export default function AppContainer({ children }) {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()

  return (
    <>
      <StatusBar
        translucent={false}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      <AppContainerFrame
        pt={insets.top + 8}
        pl={insets.left + 16}
        pr={insets.right + 16}
      >
        {children}
      </AppContainerFrame>
    </>
  )
}
