import RNFS from 'react-native-fs';

export async function fileToBase64(uri: string) {
  const cleanUri = uri.replace('file://', '');
  return await RNFS.readFile(cleanUri, 'base64');
}