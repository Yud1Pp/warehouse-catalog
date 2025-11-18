import { useState, useEffect, useRef } from 'react'
import { Printer, Check, X } from '@tamagui/lucide-icons'
import {
  Button,
  Dialog,
  XStack,
  YStack,
  Text,
  Label,
  Spinner,
  Unspaced, 
  View
} from 'tamagui'
import {
  DeviceEventEmitter,
  PermissionsAndroid,
  Platform,
} from 'react-native'
import { BluetoothManager, BluetoothTscPrinter } from '@brooons/react-native-bluetooth-escpos-printer'
import SelectDevices from './SelectDevices'
import QRCode from 'react-native-qrcode-svg';
import { useAlertToast } from 'components/AlertToast'

interface BTDevice {
  name: string
  address: string
}

export default function PrintModal({ item }: { item?: Record<string, any> }) {
  if (!item) return null

  const [devices, setDevices] = useState<BTDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<BTDevice | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [scanning, setScanning] = useState(false)
  const qrRef = useRef<any>(null)
  const { showToast } = useAlertToast()

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED as any,
      (ev: any) => {
        try {
          const obj = typeof ev === 'string' ? JSON.parse(ev) : ev
          if (obj?.devices) {
            const parsed = JSON.parse(obj.devices)
            const list: BTDevice[] = parsed.map((d: any) => ({
              name: d.name || 'Unknown',
              address: d.address,
            }))
            setDevices(list)
          }
        } catch (err) {
          showToast('Data Error', "Tidak dapat membaca data perangkat. Coba scan ulang")
        } finally {
          setTimeout(() => {
            setScanning(false)
            showToast('Scan Selesai', 'Scan selesai, silahkan pilih device')
          }, 500)
        }
      }
    )
    return () => sub.remove()
  }, [])

  const requestBluetoothPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true
    const api = Platform.Version as number
    const perms =
      api >= 31
        ? [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]
        : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]

    const granted = await PermissionsAndroid.requestMultiple(perms)
    return Object.values(granted).every(
      (v) => v === PermissionsAndroid.RESULTS.GRANTED
    )
  }

  const scanDevices = async () => {
    const ok = await requestBluetoothPermission()
    if (!ok) {
      showToast('Permission', 'Bluetooth permission tidak diberikan')
      return
    }

    try {
      setScanning(true)
      setDevices([])
      const enabled = await BluetoothManager.checkBluetoothEnabled()
      if (!enabled) await BluetoothManager.enableBluetooth()
      await BluetoothManager.scanDevices()
    } catch (err) {
      showToast('Scan error', "Coba lagi dalam beberapa saat")
      setScanning(false)
    }
  }

  const connectToDevice = async () => {
    if (!selectedDevice) {
      showToast('Device', 'Pilih perangkat terlebih dahulu')
      return
    }

    try {
      setConnectionStatus('loading')
      await BluetoothManager.connect(selectedDevice.address)
      setConnectionStatus('success')
      showToast('Connected', `Terhubung dengan: ${selectedDevice.name}`)
    } catch {
      setConnectionStatus('error')
      showToast('Unconnected', 'Gagal menghubungkan perangkat')
    }
  }

  const printLabel = async (targetItem: Record<string, any>) => {
    if (!selectedDevice?.address) return showToast('Unconected Device', 'Belum terhubung dengan perangkat');

    if (!qrRef.current) {
      return showToast('No QR Code', 'QR belum siap atau belum dirender');
    }

    qrRef.current.toDataURL(async (data: string) => {
      try {
        const base64 = data.replace(/^data:image\/png;base64,/, '');

        await BluetoothTscPrinter.printLabel({
          width: 1000,
          height: 1000,
          gap: 2,
          direction: BluetoothTscPrinter.DIRECTION.FORWARD,
          reference: [0, 0],
          tear: BluetoothTscPrinter.TEAR.ON,
          sound: 0,
          image: [
            {
              x: 30,
              y: 50,
              mode: BluetoothTscPrinter.BITMAP_MODE.OVERWRITE,
              width: 500,
              image: base64,
            },
          ],
          text: [
            { text: `Tag: ${targetItem.tagging}`, x: 30, y: 600, fonttype: BluetoothTscPrinter.FONTTYPE.FONT_2, rotation: BluetoothTscPrinter.ROTATION.ROTATION_0, xscal: BluetoothTscPrinter.FONTMUL.MUL_1, yscal: BluetoothTscPrinter.FONTMUL.MUL_1 },
            { text: `Desc: ${targetItem.desc}` , x: 30, y: 650, fonttype: BluetoothTscPrinter.FONTTYPE.FONT_2, rotation: BluetoothTscPrinter.ROTATION.ROTATION_0, xscal: BluetoothTscPrinter.FONTMUL.MUL_1, yscal: BluetoothTscPrinter.FONTMUL.MUL_1 },
          ],
        });

        showToast('Print Succes', `Print Sukses untuk ${targetItem.tagging}`);
      } catch (err) {
        console.log(err);
        showToast('Print Error', 'Periksa kembali status device');
      }
    });
  };

  return (
    <Dialog modal key={`print-${item.tagging}`}>
      <Dialog.Trigger asChild>
        <Button size="$3" icon={Printer} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          bg="$shadow6"
          animation="bouncy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          opacity={1}
        />

        <Dialog.Content
          key="content"
          animation={[
            'quickest',
            { damping: 3, mass: 0.1, stiffness: 100 },
          ]}
          enterStyle={{
            opacity: 0,
            scale: 0.95,
            y: 10,
          }}
          exitStyle={{
            opacity: 0,
            scale: 0.97,
            y: 10,
          }}
          opacity={1}
          scale={1}
          y={0}
          elevate
          bordered
          width="90%"
          maxWidth={800}
          p="$4"
          borderRadius="$6"
          backgroundColor="$background"
        >
          <YStack>
            <View position="absolute" t={-500}>
              <QRCode
                value={item.tagging}
                size={200}
                getRef={(ref) => (qrRef.current = ref)}
              />
            </View>

            <Dialog.Title>
              <Text>Print Tag</Text>
            </Dialog.Title>

            <YStack gap="$2" mt="$2">
              <XStack alignItems="center" gap="$2">
                <Label width={50}>Tag:</Label>
                <Text flex={1}>{item?.tagging ?? '-'}</Text>
              </XStack>

              <XStack alignItems="center" gap="$2">
                <Label width={50}>Desc:</Label>
                <Text flex={1}>{item?.desc ?? '-'}</Text>
              </XStack>

              <XStack alignItems="center" gap="$2">
                <Label width={50}>Device:</Label>
                <View style={{ flex: 1 }}>
                  <SelectDevices
                    devices={devices}
                    selectedDevice={selectedDevice}
                    setSelectedDevice={setSelectedDevice}
                    setConnectionStatus={setConnectionStatus}
                    onEmptyDevices={() =>
                      showToast('Tidak ada perangkat', 'Mohon lakukan scan device terlebih dahulu')
                    }
                  />
                </View>

                <Button
                  size="$3"
                  onPress={connectToDevice}
                  disabled={!selectedDevice || connectionStatus === 'loading'}
                >
                  {connectionStatus === 'loading' ? (
                    <Spinner size="small" color="$color10" />
                  ) : connectionStatus === 'success' ? (
                    <Check size={18} color="green" />
                  ) : connectionStatus === 'error' ? (
                    <X size={18} color="red" />
                  ) : (
                    <Text>Connect</Text>
                  )}
                </Button>
              </XStack>
            </YStack>
            <XStack justify="flex-end" gap="$3" mt="$3" alignItems="center">
              <Button onPress={scanDevices} disabled={scanning}>
                <XStack alignItems="center" gap="$2">
                  <Text>{scanning ? 'Scanning...' : 'Scan Devices'}</Text>
                  {scanning && <Spinner size="small" color="$color10" />}
                </XStack>
              </Button>

              <Button onPress={() => printLabel(item)}>
                <Text>Print</Text>
              </Button>
            </XStack>
          </YStack>
          
          <Unspaced>
            <Dialog.Close asChild>
              <Button
                bg="transparent"
                position="absolute"
                r="$3"
                t="$3"
                size="$3"
                circular
                icon={<X size="$1" />}
              />
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}