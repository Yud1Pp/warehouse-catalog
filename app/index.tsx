import AppContainer from 'src/shared/ui/AppContainer'
import SearchBar from 'src/shared/components/SearchBar'
import { ItemTable  } from 'src/modules/inventory/components'
import BottomAppBar from 'src/shared/components/BottomAppBar'
import { YStack } from 'tamagui'
import { Fragment, useEffect, useState, useCallback } from 'react'
import { useQRScanner } from 'hooks/useQRScanner'
import { useExcelExport } from 'src/modules/inventory/utils/excel'
import { useGudangAPI } from 'src/modules/inventory/services'
import { useAlertToast } from 'src/shared/components/AlertToast'
import { useInventoryFilter } from "src/modules/inventory/hooks/useInventoryFilter";
import { Item } from "src/modules/inventory/types/item.types"

export default function Home() {
  const { showToast } = useAlertToast()
  const { applyFilter } = useInventoryFilter();

  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const { exportToExcel } = useExcelExport()
  const { fetchItems, loading, setApiUrl, apiUrl } = useGudangAPI();

  useEffect(() => {
    if (!apiUrl) return;
    handleRefresh();
  }, [apiUrl]);

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
    setSearchQuery(text)
    setFilteredItems(applyFilter(items, text))
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
    if (!data) {
      console.log('Refreshed data:', data)
      showToast("Gagal", "Tidak dapat memperbarui data")
      setItems([])
      setFilteredItems([])
      return false;
    } else {
      console.log('ada data')
      setItems(data)
      setFilteredItems(applyFilter(data, searchQuery))

      showToast("Sukses", "Data Diperbarui")
      return true;
    }
  }

  const handleChangeApiUrl = async (newUrl: string) => {
    setApiUrl(newUrl.trim());
    showToast("Sukses", "API URL berhasil diganti");

    return true;
  };

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
            onChangeApiUrl={handleChangeApiUrl}
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
