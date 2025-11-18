import {
  useWindowDimensions,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
} from "react-native"
import { YStack, Text, Spinner, Button } from "tamagui"
import { useEffect, useMemo } from "react"
import Items from "./Items"

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function ItemTable({
  items,
  loading,
  onRefreshPress,
}: {
  items: any[]
  loading: boolean
  onRefreshPress?: () => void
}) {
  const { width, height } = useWindowDimensions()
  const isPortrait = height >= width

  const cardMinWidth = 320
  const numColumns = Math.max(1, Math.floor(width / cardMinWidth))

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [numColumns])

  const listKey = useMemo(() => `grid-${numColumns}`, [numColumns])

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <YStack flex={1}>
      <Items item={item} index={index} onRefreshPress={onRefreshPress} />
    </YStack>
  )

  if (loading && items.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
        <Spinner size="large" color="$blue10" />
        <Text fontSize="$5" color="$gray11">
          Memuat data...
        </Text>
      </YStack>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
        <Text fontSize="$5" color="$gray11">
          Belum ada data
        </Text>
        {onRefreshPress && (
          <Button theme="blue" onPress={onRefreshPress}>
            Muat Ulang
          </Button>
        )}
      </YStack>
    )
  }

  return (
    <YStack flex={1} borderRadius="$4" borderWidth="$0.5" borderColor="$borderColor">
      {isPortrait && (
        <YStack p="$2" alignItems="center" gap="$1" borderBottomWidth="$0.5" borderColor="$borderColor">
          <Text fontSize="$6" fontWeight="700">
            Daftar Item
          </Text>
          <Text color="$gray10" fontSize="$3">
            Total: {items.length} item
          </Text>
        </YStack>
      )}

      <FlatList
        key={listKey}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}   // ← FIX PENTING
        numColumns={numColumns}
        columnWrapperStyle={
          numColumns > 1 ? { justifyContent: "space-between" } : undefined
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefreshPress}
            colors={["#007aff"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}
