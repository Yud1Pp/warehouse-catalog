import { fileToBase64 } from "./fileToBase64";

export async function convertPickedImages(pickedFiles: any[]) {
  return Promise.all(
    pickedFiles.map(async (file) => {
      const base64 = await fileToBase64(file.uri);

      return {
        fileName: file.fileName,
        mimeType: file.type,
        file: base64,
      };
    })
  );
}
