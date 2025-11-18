import { useState } from "react";
import { launchCamera, launchImageLibrary, Asset } from "react-native-image-picker";
import { useAlertToast } from "components/AlertToast";

interface PickedFile {
  uri: string;
  fileName: string;
  type: string;
}

interface UseImagePickerResult {
  files: PickedFile[];
  previewUris: string[];
  loading: boolean;
  pickFromGallery: (multi?: boolean) => Promise<PickedFile[] | null>;
  pickFromCamera: () => Promise<PickedFile[] | null>;
  resetImages: () => void;
}

export function useImagePicker(): UseImagePickerResult {
  const { showToast } = useAlertToast();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [previewUris, setPreviewUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ===========================
  // 📌 PICK FROM GALLERY
  // ===========================
  const pickFromGallery = async (multi = true): Promise<PickedFile[] | null> => {
    try {
      setLoading(true);

      const result = await launchImageLibrary({
        mediaType: "photo",
        includeBase64: false,
        quality: 0.8,
        selectionLimit: multi ? 0 : 1,
      });

      if (result.didCancel) {
        showToast("Dibatalkan", "Pemilihan gambar dibatalkan");
        return null;
      }

      if (result.errorCode) {
        showToast("Gagal", result.errorMessage || "Gagal memilih gambar");
        return null;
      }

      const assets = result.assets ?? [];
      if (!assets.length) {
        showToast("Tidak Ada Gambar", "Tidak ada gambar yang dipilih");
        return null;
      }

      const pickedFiles: PickedFile[] = assets.map((a: Asset) => ({
        uri: a.uri!,
        fileName: a.fileName || `image_${Date.now()}.jpg`,
        type: a.type || "image/jpeg",
      }));

      setFiles(pickedFiles); // tetap update state untuk EditModal
      setPreviewUris(pickedFiles.map(f => f.uri));

      showToast("Berhasil", `${pickedFiles.length} gambar dipilih`);
      return pickedFiles; // <-- penting!
    } catch {
      showToast("Error", "Terjadi kesalahan memilih gambar");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // 📌 PICK FROM CAMERA
  // ===========================
  const pickFromCamera = async (): Promise<PickedFile[] | null> => {
    try {
      setLoading(true);

      const result = await launchCamera({
        mediaType: "photo",
        includeBase64: false,
        quality: 0.8,
      });

      if (result.didCancel) {
        showToast("Dibatalkan", "Pengambilan foto dibatalkan");
        return null;
      }

      if (result.errorCode) {
        showToast("Gagal", result.errorMessage || "Tidak dapat membuka kamera");
        return null;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        showToast("Gagal", "Tidak ada foto yang diambil");
        return null;
      }

      const newFile: PickedFile = {
        uri: asset.uri,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type || "image/jpeg",
      };

      setFiles([newFile]); // replace, bukan append (biar konsisten)
      setPreviewUris([newFile.uri]);

      showToast("Berhasil", "Foto berhasil diambil");
      return [newFile]; // <-- penting!
    } catch {
      showToast("Error", "Terjadi kesalahan mengambil foto");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetImages = () => {
    setFiles([]);
    setPreviewUris([]);
  };

  return {
    files,
    previewUris,
    loading,
    pickFromGallery,
    pickFromCamera,
    resetImages,
  };
}
