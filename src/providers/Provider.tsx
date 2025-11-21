import { useColorScheme } from 'react-native'
import { TamaguiProvider, Theme, type TamaguiProviderProps } from 'tamagui'
import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { CurrentToast } from 'src/shared/components/CurrentToast'
import { AlertToastProvider } from 'src/shared/components/AlertToast'
import { config } from '../../tamagui.config'

export function Provider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  const colorScheme = useColorScheme()

  return (
    <TamaguiProvider config={config} disableRootThemeClass {...rest}>
        <ToastProvider swipeDirection="horizontal" duration={4000}>
          <AlertToastProvider>
            {children}
          </AlertToastProvider>

          <CurrentToast />
          <ToastViewport top="$0" left={0} right={0} />
        </ToastProvider>
    </TamaguiProvider>
  )
}
