import { Button, Input, XStack, YStack } from 'tamagui'
import { Search } from '@tamagui/lucide-icons'
import EditUrl from './EditUrl'

export default function SearchBar(
  { 
    onSearchChange,
    onSearchPress,
    searchQuery,
    onChangeApiUrl 
  }: 
  { 
    onSearchChange: (text: string) => void,
    onSearchPress: () => void,
    searchQuery: string ,
    onChangeApiUrl?: (newUrl: string) => void
  }
  ) {
  return (
    
    <YStack gap="$3" pb="$2" borderRadius="$4" >
      <XStack gap="$2" alignItems="center">
        <Input flex={1} size="$4" placeholder="Cari Data" value={searchQuery } onChangeText={onSearchChange} />
        <Button icon={<Search size="$1" />} size="$4" onPress={onSearchPress} />
        <EditUrl onChangeApiUrl={onChangeApiUrl} />
      </XStack>
    </YStack>
  )
}