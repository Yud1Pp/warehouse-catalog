import { useImagePicker } from "../hooks/useImagePicker";
import { convertPickedImages } from "../utils/imageUpload";

export function useImageUpload() {
  const { pickFromGallery, pickFromCamera } = useImagePicker();

  async function openGallery(convertBase64 = true) {
    const files = await pickFromGallery(convertBase64);
    if (!files || files.length === 0) return null;

    return convertBase64 ? await convertPickedImages(files) : files;
  }

  async function openCamera() {
    const files = await pickFromCamera();
    if (!files || files.length === 0) return null;

    return await convertPickedImages(files);
  }

  return { openGallery, openCamera };
}
