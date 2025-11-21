import { useTheme, Text, View } from 'tamagui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { StyleSheet, Pressable } from 'react-native'
import SelectDropdown from 'react-native-select-dropdown'

interface BTDevice {
  name: string
  address: string
}

interface Props {
  devices: BTDevice[]
  selectedDevice: BTDevice | null
  setSelectedDevice: (device: BTDevice) => void
  setConnectionStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void
  onEmptyDevices?: () => void
}

export default function SelectDevices({
  devices,
  selectedDevice,
  setSelectedDevice,
  setConnectionStatus,
  onEmptyDevices,
}: Props) {
  const theme = useTheme()

  return (
    <SelectDropdown
      data={devices}
      disabled={devices.length === 0}
      onSelect={(selectedItem) => {
        setSelectedDevice(selectedItem)
        setConnectionStatus('idle')
      }}
      defaultValue={selectedDevice}
      renderButton={(selectedItem, isOpened) => (
        <Pressable
          onPress={() => {
            if (devices.length === 0) {
              onEmptyDevices?.()
              return
            }
          }}
          disabled={devices.length === 0}
        >
          <View
            style={[
              styles.dropdownButtonStyle,
              {
                backgroundColor: theme.background.val,
                borderColor: theme.borderColor?.val ?? theme.color3.val,
                opacity: devices.length === 0 ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.dropdownButtonTxtStyle,
                { color: theme.color.val },
              ]}
            >
              {(selectedItem && selectedItem.name) || 'Pilih perangkat'}
            </Text>
            {isOpened ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </View>
        </Pressable>
      )}
      renderItem={(item, index, isSelected) => (
        <View
          style={{
            ...styles.dropdownItemStyle,
            backgroundColor: isSelected
              ? theme.backgroundHover.val
              : theme.backgroundStrong?.val ?? theme.background.val,
          }}
        >
          <Text
            style={[
              styles.dropdownItemTxtStyle,
              { color: theme.color.val },
            ]}
          >
            {item.name}
          </Text>
        </View>
      )}
      dropdownStyle={{
        backgroundColor: theme.background.val,
        borderRadius: 8,
        borderColor: theme.borderColor?.val ?? theme.color3.val,
      }}
      showsVerticalScrollIndicator={false}
      statusBarTranslucent={true}
    />
  )
}

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
  },
  dropdownItemStyle: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
  },
})
