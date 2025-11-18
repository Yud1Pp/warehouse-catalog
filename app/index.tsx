import AppContainer from 'components/ui/AppContainer'
import SearchBar from 'components/SearchBar'
import ItemTable from 'components/ItemTable'
import BottomAppBar from 'components/BottomAppBar'
import { YStack } from 'tamagui'
import { Fragment, useEffect, useState, useCallback } from 'react'
import { useQRScanner } from 'hooks/useQRScanner'
import { useExcelExport } from 'hooks/useExcelExport'
import { useGudangAPI } from 'hooks/useGudangAPI'
import { useAlertToast } from 'components/AlertToast'

interface Item {
  uuid: string
  tagging: string
  desc: string
  original_location: string
  current_location: string
  img_url1: string
  img_url2: string
  img_url3: string
}

export default function Home() {
  const { showToast } = useAlertToast()

  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const { exportToExcel } = useExcelExport()
  const { fetchItems, loading } = useGudangAPI()

  // ============================================================
  // 🔥 Search Logic - DIPISAH sebagai reusable function
  // ============================================================
  const applyFilter = useCallback(
    (dataset: Item[], query: string) => {
      const term = query.trim().toLowerCase()
      if (!term) return dataset

      return dataset.filter((item) => {
        return (
          item.tagging?.toLowerCase().includes(term) ||
          item.desc?.toLowerCase().includes(term) ||
          item.original_location?.toLowerCase().includes(term) ||
          item.current_location?.toLowerCase().includes(term)
        )
      })
    },
    []
  )

  // ============================================================
  // 🔥 Initial Load
  // ============================================================
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchItems()
      if (data) {
        setItems(data)
        setFilteredItems(data)
      }
    }
    loadData()
  }, [fetchItems])

  // ============================================================
  // 🔥 Search input changed
  // ============================================================
  const handleSearchChange = (text: string) => {
    const query = text.trim().toLowerCase()
    setSearchQuery(query)
    setFilteredItems(applyFilter(items, query))
  }

  // ============================================================
  // 🔥 Search button pressed
  // ============================================================
  const handleSearchPress = () => {
    setFilteredItems(applyFilter(items, searchQuery))
  }

  // ============================================================
  // 🔥 Refresh data (setelah edit/upload)
  // ============================================================
  const handleRefresh = async () => {
    const data = await fetchItems()
    if (!data) return

    setItems(data)
    setFilteredItems(applyFilter(data, searchQuery))

    showToast("Sukses", "Data Diperbarui")
  }

  // ============================================================
  // 🔥 Scanner — otomatis mengisi search & filter
  // ============================================================
  const { visible, setVisible, requestPermission, ScannerView } =
    useQRScanner((value) => {
      const clean = value.trim().toLowerCase()
      setSearchQuery(clean)
      setFilteredItems(applyFilter(items, clean))
    })

  const handleScanPress = async () => {
    await requestPermission()
    setVisible(true)
  }

  // ============================================================
  // 🔥 Download Excel
  // ============================================================
  const handleDownload = async () => {
    await exportToExcel(items, {
      fileName: 'gudang_items',
      sheetName: 'Inventory',
      columnWidths: [
        { wch: 15 },
        { wch: 30 },
        { wch: 25 },
        { wch: 25 },
      ],
    })
  }

  // ============================================================
  // 🔥 Render
  // ============================================================
  return (
    <Fragment>
      <AppContainer>
        <YStack flex={1}>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchPress={handleSearchPress}
          />

          <YStack flex={1}>
            <ItemTable
              items={filteredItems}
              loading={loading}
              onRefreshPress={handleRefresh}
            />
          </YStack>

          <BottomAppBar
            onScanPress={handleScanPress}
            onRefreshPress={handleRefresh}
            onDownloadPress={handleDownload}
          />
        </YStack>
      </AppContainer>

      {visible && <ScannerView />}
    </Fragment>
  )
}
