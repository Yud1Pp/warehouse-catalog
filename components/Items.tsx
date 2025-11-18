import { useState } from "react";
import {
  XStack,
  Text,
  YStack,
  Button,
  Spinner,
  Card,
  Separator,
} from "tamagui";
import FastImage from "@d11/react-native-fast-image";
import {
  Modal,
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
} from "react-native";
import RNFS from "react-native-fs";

import PrintModal from "./PrintModal";
import EditModal from "./EditModal";
import { useAlertToast } from "./AlertToast";

import { useGudangAPI } from "hooks/useGudangAPI";
import { useImagePicker } from "hooks/useImagePicker";

export default function Items({
  item,
  onRefreshPress,
  index,
}: {
  item: Record<string, any>;
  onRefreshPress?: () => void;
  index: number;
}) {
  const { showToast } = useAlertToast();

  // Ambil API Hooks termasuk deleteImage
  const { replaceImage, deleteImage } = useGudangAPI();

  const [visible, setVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const { pickFromGallery, pickFromCamera } = useImagePicker();

  const imageUrls = [item.img_url1, item.img_url2, item.img_url3].filter(
    (url) => typeof url === "string" && url.startsWith("http")
  );

  const handleImagePress = (url: string) => {
    setPreviewUrl(url);
    setVisible(true);
  };

  // ====================================================================
  // 🔥 Replace with file (Gallery / Camera)
  // ====================================================================
  const replaceWithFile = async (file: any) => {
    try {
      if (!previewUrl) {
        showToast("Error", "Gambar tidak valid.");
        return;
      }

      setUploadingImage(true);

      // Convert file → base64
      const blob = await (await fetch(file.uri)).blob();
      const reader = new FileReader();

      const base64File = await new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({
            fileName: file.fileName,
            mimeType: file.type,
            file: reader.result?.toString().replace(/^data:.+;base64,/, ""),
          });
        };
        reader.readAsDataURL(blob);
      });

      const res = await replaceImage({
        uuid: item.uuid,
        old_url: previewUrl!,
        file: base64File as any,
      });

      if (!res?.success) throw new Error(res?.message);

      showToast("Sukses", "Gambar berhasil diganti");

      setVisible(false);
      onRefreshPress?.();
    } catch (err: any) {
      showToast("Gagal", err.message || "Tidak dapat mengganti gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleReplaceFromGallery = async () => {
    try {
      const picked = await pickFromGallery(false);
      if (!picked || picked.length === 0) {
        showToast("Error", "Tidak ada file dari galeri");
        return;
      }
      await replaceWithFile(picked[0]);
    } catch {}
  };

  const handleReplaceFromCamera = async () => {
    try {
      const picked = await pickFromCamera();
      if (!picked || picked.length === 0) {
        showToast("Error", "Tidak ada file dari kamera");
        return;
      }
      await replaceWithFile(picked[0]);
    } catch {}
  };

  // ====================================================================
  // 🔥 Download Image
  // ====================================================================
  const handleDownload = async () => {
    try {
      if (!previewUrl)
        return showToast("Tidak ada gambar", "Tidak ada gambar yang dapat diunduh.");

      setDownloading(true);

      const filename = item.tagging?.replace(/\s+/g, "_") || "image_download";
      const filePath =
        Platform.OS === "android"
          ? `${RNFS.DownloadDirectoryPath}/${filename}.jpg`
          : `${RNFS.DocumentDirectoryPath}/${filename}.jpg`;

      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Izin Penyimpanan",
            message: "Aplikasi perlu izin untuk menyimpan gambar.",
            buttonPositive: "Izinkan",
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showToast("Akses ditolak", "Tidak dapat menyimpan gambar.");
          return;
        }
      }

      const result = await RNFS.downloadFile({
        fromUrl: previewUrl,
        toFile: filePath,
      }).promise;

      if (result.statusCode === 200) {
        showToast("Berhasil", `Gambar disimpan di: ${filePath}`);
      } else {
        showToast("Gagal", "Tidak dapat mengunduh gambar.");
      }
    } catch {
      showToast("Error", "Terjadi kesalahan saat mengunduh gambar.");
    } finally {
      setDownloading(false);
    }
  };

  // ====================================================================
  // 🔥 DELETE IMAGE
  // ====================================================================
  const handleDeleteImage = async () => {
    if (!previewUrl) return;

    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus gambar ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingImage(true);

              const res = await deleteImage({
                uuid: item.uuid,
                url: previewUrl,
              });

              if (!res?.success) throw new Error(res?.message);

              showToast("Sukses", "Gambar berhasil dihapus");

              setVisible(false);
              onRefreshPress?.();
            } catch (err: any) {
              showToast("Error", err.message || "Gagal menghapus gambar");
            } finally {
              setDeletingImage(false);
            }
          },
        },
      ]
    );
  };

  // ====================================================================
  // UI Rendering
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
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleImagePress(url)}
                    activeOpacity={0.8}
                  >
                    <FastImage
                      source={{ uri: url }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        backgroundColor: "#f2f2f2",
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
            <Text>{item.desc || "-"}</Text>

            <Text mt="$2">Lokasi Asal:</Text>
            <Text>{item.original_location || "-"}</Text>

            <Text mt="$2">Lokasi Sekarang:</Text>
            <Text>{item.current_location || "-"}</Text>
          </YStack>

          <Separator />

          <XStack justifyContent="flex-end" mt="$2" gap="$2">
            <PrintModal key={`print-${item.tagging}`} item={item} />
            <EditModal item={item} index={index} onSuccess={onRefreshPress} />
          </XStack>
        </YStack>
      </Card>

      {/* =======================================================
          IMAGE PREVIEW MODAL
      ======================================================== */}
      <Modal visible={visible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Close */}
          <TouchableOpacity
            style={{ position: "absolute", top: 40, right: 20 }}
            onPress={() => {
              if (uploadingImage || deletingImage) {
                showToast("Info", "Tunggu hingga proses selesai...");
              } else {
                setVisible(false);
              }
            }}
          >
            <Text style={{ color: "white", fontSize: 22 }}>✕</Text>
          </TouchableOpacity>

          {/* Image */}
          {previewUrl ? (
            <FastImage
              style={{ width: "90%", height: "70%", borderRadius: 10 }}
              source={{ uri: previewUrl }}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : (
            <Text style={{ color: "white" }}>Tidak ada gambar</Text>
          )}

          {/* Buttons */}
          <XStack mt="$4" gap="$3" justifyContent="center">
            <Button
              size="$4"
              flex={1}
              onPress={handleDownload}
              disabled={downloading || uploadingImage || deletingImage}
            >
              {downloading ? <Spinner /> : "Download"}
            </Button>

            <Button
              size="$4"
              flex={1}
              onPress={handleReplaceFromGallery}
              disabled={uploadingImage || deletingImage}
            >
              {uploadingImage ? <Spinner /> : "Gallery"}
            </Button>

            <Button
              size="$4"
              flex={1}
              onPress={handleReplaceFromCamera}
              disabled={uploadingImage || deletingImage}
            >
              {uploadingImage ? <Spinner /> : "Camera"}
            </Button>

            <Button
              size="$4"
              flex={1}
              theme="red"
              onPress={handleDeleteImage}
              disabled={deletingImage || uploadingImage}
            >
              {deletingImage ? <Spinner /> : "Hapus"}
            </Button>
          </XStack>

          {/* Uploading Overlay */}
          {(uploadingImage || deletingImage) && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spinner size="large" color="white" />
              <Text style={{ color: "white", marginTop: 10 }}>
                {uploadingImage ? "Uploading..." : "Menghapus..."}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
