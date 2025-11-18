import { ArrowLeft } from '@tamagui/lucide-icons'
import React, { useState, useCallback } from 'react'
import { Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera'
import { YStack, View, Text, Button } from 'tamagui'
import { useAlertToast } from 'components/AlertToast'

const { width } = Dimensions.get('window')
const scanBoxSize = width * 0.7

export function useQRScanner(onScanned: (value: string) => void) {
  const { showToast } = useAlertToast()
  const [visible, setVisible] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const device = useCameraDevice('back')
  const insets = useSafeAreaInsets()

  const requestPermission = useCallback(async () => {
    try {
      const status = await Camera.requestCameraPermission()

      if (status === 'granted') {
        setHasPermission(true)
        return true
      }

      if (status === 'denied') {
        showToast('Izin Ditolak', 'Akses kamera diperlukan untuk scan QR')
        return false
      }

      if (status === 'restricted') {
        showToast('Izin Diblokir', 'Aktifkan akses kamera dari pengaturan')
        return false
      }

      showToast('Gagal', 'Tidak dapat mengakses kamera')
      return false
    } catch {
      showToast('Error', 'Terjadi kesalahan meminta izin kamera')
      return false
    }
  }, [])

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: (codes) => {
      const value = codes[0]?.value
      if (value) {
        showToast('Scan Berhasil', 'QR berhasil terbaca')
        setVisible(false)
        onScanned(value)
      }
    },
  })

  const ScannerView = () => {
    if (!visible) return null

    if (!device) {
      showToast('Kamera Tidak Tersedia', 'Tidak dapat menemukan kamera belakang')
      return null
    }

    if (!hasPermission) {
      showToast('Tidak Ada Izin', 'Tolong aktifkan izin kamera terlebih dahulu')
      return null
    }

    return (
      <YStack
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        backgroundColor="black"
        zIndex={999}
      >
        <Camera
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />

        <View
          position="absolute"
          top={insets.top + 12}
          left={insets.left + 12}
          backgroundColor="rgba(0,0,0,0.4)"
          borderRadius={8}
          zIndex={1000}
        >
          <Button
            bg="transparent"
            pressStyle={{ opacity: 0.5 }}
            color="white"
            fontSize={16}
            onPress={() => setVisible(false)}
            size="$3"
            icon={ArrowLeft}
          >
            Back
          </Button>
        </View>

        <YStack
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          pointerEvents="none"
        >
          <YStack
            position="absolute"
            top={0}
            width="100%"
            height="50%"
            backgroundColor="rgba(0,0,0,0.5)"
          />

          <YStack
            position="absolute"
            bottom={0}
            width="100%"
            height="50%"
            backgroundColor="rgba(0,0,0,0.5)"
            alignItems="center"
            justifyContent="flex-end"
            paddingBottom={insets.bottom + 60}
          >
            <Text color="white" fontSize={16}>
              Arahkan QR Code ke dalam kotak
            </Text>
          </YStack>

          <YStack
            position="absolute"
            width={scanBoxSize}
            height={scanBoxSize}
            borderWidth={2}
            borderColor="white"
            alignItems="center"
            justifyContent="center"
            backgroundColor="transparent"
            style={{
              top: '50%',
              left: '50%',
              transform: [{ translateX: -scanBoxSize / 2 }, { translateY: -scanBoxSize / 2 }],
            }}
          >
            <View position="absolute" t={0} l={0} width={30} height={30} borderTopWidth={4} borderLeftWidth={4} borderColor="$green10" />
            <View position="absolute" t={0} r={0} width={30} height={30} borderTopWidth={4} borderRightWidth={4} borderColor="$green10" />
            <View position="absolute" b={0} l={0} width={30} height={30} borderBottomWidth={4} borderLeftWidth={4} borderColor="$green10" />
            <View position="absolute" b={0} r={0} width={30} height={30} borderBottomWidth={4} borderRightWidth={4} borderColor="$green10" />
          </YStack>
        </YStack>
      </YStack>
    )
  }

  return {
    visible,
    setVisible,
    requestPermission,
    ScannerView,
  }
}
