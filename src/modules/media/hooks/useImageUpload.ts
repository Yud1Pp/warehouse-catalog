import { useImagePicker } from "../hooks/useImagePicker";
import { convertPickedImages } from "../utils/imageUpload";

export function useImageUpload() {
  const { pickFromGallery, pickFromCamera } = useImagePicker();

  // ==========================
  // 📌 OPEN GALLERY
  // ==========================
  async function openGallery({
    multi = false,
    convertBase64 = true,
  }: {
    multi?: boolean;
    convertBase64?: boolean;
  }) {
    const files = await pickFromGallery(multi);
    if (!files || files.length === 0) return null;

    return convertBase64 ? await convertPickedImages(files) : files;
  }

  // ==========================
  // 📌 OPEN CAMERA
  // Always single, always convert
  // ==========================
  async function openCamera({ convertBase64 = true } = {}) {
    const files = await pickFromCamera();
    if (!files || files.length === 0) return null;

    return convertBase64 ? await convertPickedImages(files) : files;
  }

  return { openGallery, openCamera };
}
