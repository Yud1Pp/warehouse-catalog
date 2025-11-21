import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { XStack, Button, Spinner, YStack } from 'tamagui';
import FastImage from '@d11/react-native-fast-image';

interface Props {
  visible: boolean;
  url: string | null;
  onClose: () => void;

  onDownload: () => Promise<void>;
  onDelete: () => Promise<void>;
  onReplaceFromGallery: () => Promise<void>;
  onReplaceFromCamera: () => Promise<void>;

  loadingReplace?: boolean;
  loadingDelete?: boolean;
  loadingDownload?: boolean;
}

export default function ImagePreviewModal({
  visible,
  url,
  onClose,
  onDownload,
  onDelete,
  onReplaceFromGallery,
  onReplaceFromCamera,

  loadingReplace,
  loadingDelete,
  loadingDownload,
}: Props) {
  const isBusy = loadingReplace || loadingDelete;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.9)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Close Button */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, right: 20, zIndex: 9999 }}
          onPress={() => {
            if (isBusy) return; // prevent closing
            onClose();
          }}
        >
          <Text style={{ color: 'white', fontSize: 22 }}>✕</Text>
        </TouchableOpacity>

        {/* Image */}
        {url ? (
          <FastImage
            style={{ width: '90%', height: '70%', borderRadius: 10 }}
            source={{ uri: url }}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <Text style={{ color: 'white' }}>Tidak ada gambar</Text>
        )}

        {/* Buttons */}
        <YStack width="60%">
          <XStack mt="$4" gap="$3" justifyContent="center">
            <Button
              size="$4"
              flex={1}
              onPress={onDownload}
              disabled={loadingDownload || isBusy}
            >
              {loadingDownload ? <Spinner /> : 'Download'}
            </Button>

            <Button
              size="$4"
              flex={1}
              theme="red"
              onPress={onDelete}
              disabled={loadingDelete || isBusy}
            >
              {loadingDelete ? <Spinner /> : 'Hapus'}
            </Button>
          </XStack>

          <XStack mt="$2" gap="$3" justifyContent="center">
            <Button
              size="$4"
              flex={1}
              onPress={onReplaceFromGallery}
              disabled={isBusy}
            >
              {loadingReplace ? <Spinner /> : 'Gallery'}
            </Button>

            <Button
              size="$4"
              flex={1}
              onPress={onReplaceFromCamera}
              disabled={isBusy}
            >
              {loadingReplace ? <Spinner /> : 'Camera'}
            </Button>
          </XStack>
        </YStack>

        {/* Overlay Loading */}
        {isBusy && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Spinner size="large" color="white" />
            <Text style={{ color: 'white', marginTop: 10 }}>
              {loadingDelete
                ? 'Menghapus...'
                : loadingReplace
                ? 'Uploading...'
                : ''}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}
