import * as XLSX from 'xlsx'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import { PermissionsAndroid, Platform } from 'react-native'
import { useAlertToast } from 'components/AlertToast'

interface ExportOptions {
  fileName?: string
  sheetName?: string
  columnWidths?: { wch: number }[]
}

export function useExcelExport() {
  const { showToast } = useAlertToast()

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Izin Penyimpanan',
            message:
              'Aplikasi memerlukan izin untuk menyimpan file Excel ke penyimpanan lokal',
            buttonNeutral: 'Nanti',
            buttonNegative: 'Batal',
            buttonPositive: 'Izinkan',
          }
        )

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          showToast('Izin Ditolak', 'Anda menolak izin penyimpanan.')
          return false
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          showToast('Izin Diblokir', 'Aktifkan izin dari pengaturan perangkat.')
          return false
        }

        return false
      } catch (err) {
        showToast('Izin Gagal', 'Tidak bisa meminta izin penyimpanan.')
        return false
      }
    }
    return true
  }

  const exportToExcel = async (data: any[], options: ExportOptions = {}) => {
    const {
      fileName = 'data_items',
      sheetName = 'Data',
      columnWidths = [],
    } = options

    try {
      if (!data || data.length === 0) {
        showToast('Tidak Ada Data', 'Belum ada data untuk diexport.')
        return
      }

      const hasPermission = await requestStoragePermission()
      if (!hasPermission) return

      showToast('Memproses…', 'Membuat file Excel')

      const ws = XLSX.utils.json_to_sheet(data)
      if (columnWidths.length > 0) ws['!cols'] = columnWidths

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' })

      const path = `${RNFS.DownloadDirectoryPath}/${fileName}.xlsx`

      await RNFS.writeFile(path, wbout, 'ascii')

      showToast('Berhasil!', 'File Excel berhasil dibuat.')

      await Share.open({
        title: 'Bagikan File Excel',
        url: 'file://' + path,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        failOnCancel: false,
      })

      showToast('Dibagikan', 'File berhasil dibagikan.')
    } catch (error) {
      showToast('Export Gagal', 'Terjadi kesalahan saat membuat Excel.')
    }
  }

  return { exportToExcel }
}
