import { useState } from 'react';
import {
  XStack,
  Text,
  YStack,
  Button,
  Spinner,
  Card,
  Separator,
} from 'tamagui';
import FastImage from '@d11/react-native-fast-image';
import {
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';

import PrintModal from './PrintModal';
import EditModal from './EditModal';
import { useAlertToast } from 'src/shared/components/AlertToast';
import { useGudangAPI } from 'src/modules/inventory/services/inventory.api';

// HOOK UNTUK UPLOAD GAMBAR (POINT 4)
import { useImageUpload } from 'src/modules/media/hooks/useImageUpload';
import ImagePreviewModal from 'src/modules/media/components/ImagePreviewModal';
import React from 'react';

function Items({
  item,
  onRefreshPress,
  index,
}: {
  item: Record<string, any>;
  onRefreshPress?: () => void;
  index: number;
}) {
  const { showToast } = useAlertToast();
  const { replaceImage, deleteImage } = useGudangAPI();

  const { openGallery, openCamera } = useImageUpload();   // ← gunakan hook baru

  const [visible, setVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const imageUrls = [item.img_url1, item.img_url2, item.img_url3].filter(
    (url) => typeof url === 'string' && url.startsWith('http')
  );

  const handleImagePress = (url: string) => {
    setPreviewUrl(url);
    setVisible(true);
  };

  // ====================================================================
  // 🔥 Replace image
  // ====================================================================
  const handleReplaceFromGallery = async () => {
    try {
      const files = await openGallery(false); // pilih file asli (tanpa base64)
      if (!files || files.length === 0) {
        showToast('Error', 'Tidak ada file dari galeri');
        return;
      }
      await replaceWithBase64(files[0]);
    } catch {}
  };

  const handleReplaceFromCamera = async () => {
    try {
      const files = await openCamera(); // hasil camera langsung base64
      if (!files || files.length === 0) {
        showToast('Error', 'Tidak ada file dari kamera');
        return;
      }
      await replaceWithBase64(files[0]);
    } catch {}
  };

  // Convert + upload
  const replaceWithBase64 = async (file: any) => {
    try {
      if (!previewUrl) {
        showToast('Error', 'Gambar tidak valid.');
        return;
      }

      setUploadingImage(true);

      const res = await replaceImage({
        uuid: item.uuid,
        old_url: previewUrl,
        file, // sudah base64 (openCamera) atau raw file (openGallery(false))
      });

      if (!res?.success) throw new Error(res?.message);

      showToast('Sukses', 'Gambar berhasil diganti');
      setVisible(false);
      onRefreshPress?.();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Tidak dapat mengganti gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  // ====================================================================
  // 🔥 Download
  // ====================================================================
  const handleDownload = async () => {
    try {
      if (!previewUrl)
        return showToast('Tidak ada gambar', 'Tidak ada gambar yang dapat diunduh.');

      setDownloading(true);

      const filename = item.tagging?.replace(/\s+/g, '_') || 'image_download';
      const filePath =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${filename}.jpg`
          : `${RNFS.DocumentDirectoryPath}/${filename}.jpg`;

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Izin Penyimpanan',
            message: 'Aplikasi perlu izin untuk menyimpan gambar.',
            buttonPositive: 'Izinkan',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showToast('Akses ditolak', 'Tidak dapat menyimpan gambar.');
          return;
        }
      }

      const result = await RNFS.downloadFile({
        fromUrl: previewUrl,
        toFile: filePath,
      }).promise;

      setVisible(false);
      if (result.statusCode === 200) {
        showToast('Berhasil', `Gambar disimpan di: ${filePath}`);
      } else {
        showToast('Gagal', 'Tidak dapat mengunduh gambar.');
      }
    } catch {
      showToast('Error', 'Terjadi kesalahan saat mengunduh gambar.');
    } finally {
      setDownloading(false);
    }
  };

  // ====================================================================
  // 🔥 Delete
  // ====================================================================
  const handleDeleteImage = async () => {
    if (!previewUrl) return;

    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus gambar ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingImage(true);

              const res = await deleteImage({
                uuid: item.uuid,
                url: previewUrl,
              });

              if (!res?.success) throw new Error(res?.message);

              showToast('Sukses', 'Gambar berhasil dihapus');

              setVisible(false);
              onRefreshPress?.();
            } catch (err: any) {
              showToast('Error', err.message || 'Gagal menghapus gambar');
            } finally {
              setDeletingImage(false);
            }
          },
        },
      ]
    );
  };

  // ====================================================================
  // UI
  // ====================================================================
  return (
    <>
      <Card flex={1} bordered size="$4" m="$2" p="$3">
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold" fontSize="$5">
              {item.tagging}
            </Text>

            <XStack gap="$2">
              {imageUrls.length > 0 ? (
                imageUrls.map((url, i) => (
                  <TouchableOpacity key={i} onPress={() => handleImagePress(url)}>
                    <FastImage
                      source={{ uri: url }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        backgroundColor: '#f2f2f2',
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <Text fontSize="$3">Tidak ada gambar</Text>
              )}
            </XStack>
          </XStack>

          <Separator />

          <YStack gap="$1">
            <Text>Deskripsi:</Text>
            <Text>{item.desc || '-'}</Text>

            <Text mt="$2">Lokasi Asal:</Text>
            <Text>{item.original_location || '-'}</Text>

            <Text mt="$2">Lokasi Sekarang:</Text>
            <Text>{item.current_location || '-'}</Text>
          </YStack>

          <Separator />

          <XStack justifyContent="flex-end" mt="$2" gap="$2">
            <PrintModal key={`print-${item.tagging}`} item={item} />
            <EditModal item={item} index={index} onSuccess={onRefreshPress} />
          </XStack>
        </YStack>
      </Card>

      {/* IMAGE PREVIEW MODAL */}
      <ImagePreviewModal
        visible={visible}
        url={previewUrl}
        onClose={() => setVisible(false)}
        onDownload={handleDownload}
        onDelete={handleDeleteImage}
        onReplaceFromGallery={handleReplaceFromGallery}
        onReplaceFromCamera={handleReplaceFromCamera}
        loadingDelete={deletingImage}
        loadingReplace={uploadingImage}
        loadingDownload={downloading}
      />
    </>
  );
}

export default React.memo(Items);
