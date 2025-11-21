import { SquarePen, X, UploadCloud } from '@tamagui/lucide-icons'
import {
  Button,
  Dialog,
  Spinner,
  Unspaced,
  XStack,
  YStack,
  Text,
  Fieldset,
  Input,
  Label,
  Image,
} from 'tamagui'
import { useState, useEffect } from 'react'

import { useGudangAPI } from 'src/modules/inventory/services/inventory.api'
import { useAlertToast } from 'src/shared/components/AlertToast'

import { useImagePicker } from 'src/modules/media/hooks/useImagePicker'
import { convertPickedImages } from 'src/modules/media/utils/imageUpload'

import { isItemUpdated, hasImageChanged } from 'src/modules/inventory/utils/diff'

import { Item } from '../types/item.types'
import { EditItemPayload, UploadImagePayload } from '../types/api.types'

interface EditModalProps {
  item?: Item
  onSuccess?: () => void
  index: number
}

export default function EditModal({ item, onSuccess }: EditModalProps) {
  const [open, setOpen] = useState(false)

  // FORM STATE
  const [latestDesc, setLatestDesc] = useState('')
  const [originLocation, setOriginLocation] = useState('')
  const [currentLocation, setCurrentLocation] = useState('')
  const [latestTagging, setLatestTagging] = useState('')

  const {
    files,
    previewUris,
    loading: picking,
    resetImages,
    pickFromGallery,
    pickFromCamera,
  } = useImagePicker()

  const { editItem, uploadImage, loading: apiLoading } = useGudangAPI()
  const { showToast } = useAlertToast()

  const [submitting, setSubmitting] = useState(false)
  const isBusy = submitting || apiLoading || picking

  // SYNC VALUE DARI ITEM
  useEffect(() => {
    if (!item) return
    setLatestDesc(item.desc ?? '')
    setOriginLocation(item.original_location ?? '')
    setCurrentLocation(item.current_location ?? '')
    setLatestTagging(item.tagging ?? '')
  }, [item])

  useEffect(() => {
    if (!open) resetImages()
  }, [open])

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      // 1️⃣ Cek perubahan text
      const { updated: isTextUpdated } = isItemUpdated(item, {
        tagging: latestTagging,
        desc: latestDesc,
        original_location: originLocation,
        current_location: currentLocation,
      })

      // 2️⃣ Cek perubahan gambar — pakai item.images
      const originalUrls = item?.images.map(img => img.url) ?? []
      const imageChange = hasImageChanged(files, originalUrls)

      // Jika tidak ada perubahan
      if (!isTextUpdated && !imageChange.changed) {
        showToast('Peringatan', '⚠️ Tidak ada perubahan.')
        return
      }

      // 3️⃣ Upload gambar baru
      if (imageChange.changed) {
        const base64Files = await convertPickedImages(files)

        const payload: UploadImagePayload = {
          uuid: item?.uuid ?? '',
          files: base64Files,
        }

        const uploadRes = await uploadImage(payload)
        if (!uploadRes?.success) throw new Error(uploadRes?.message)

        resetImages()
      }

      // 4️⃣ Update text
      if (isTextUpdated) {
        const payload: EditItemPayload = {
          uuid: item?.uuid ?? '',
          tagging: latestTagging,
          desc: latestDesc,
          original_location: originLocation,
          current_location: currentLocation,
        }

        const res = await editItem(payload)
        if (!res?.success) throw new Error(res?.message)
      }

      showToast('Berhasil', 'Data berhasil diperbarui.')
      onSuccess?.()
      setOpen(false)
    } catch (err: any) {
      showToast('Gagal', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================
  // RENDER UI
  // ============================================================
  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="$3" icon={SquarePen} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay bg="$shadow6" />

        <Dialog.Content>
          <Dialog.Title>Edit Data</Dialog.Title>
          <Dialog.Description>
            Sesuaikan deskripsi atau lokasi item. Upload foto bila perlu.
          </Dialog.Description>

          <YStack py="$3" gap="$2">
            <XStack alignItems="center">
              <Label width={120}>Tag</Label>
              <Input flex={1} value={latestTagging} onChangeText={setLatestTagging} />
            </XStack>

            <XStack alignItems="center">
              <Label width={120}>Desc</Label>
              <Input flex={1} value={latestDesc} onChangeText={setLatestDesc} />
            </XStack>

            <XStack alignItems="center">
              <Label width={120}>Original Location</Label>
              <Input flex={1} value={originLocation} onChangeText={setOriginLocation} />
            </XStack>

            <Fieldset horizontal alignItems="center">
              <Label width={120}>Current Location</Label>
              <Input flex={1} value={currentLocation} onChangeText={setCurrentLocation} />
            </Fieldset>

            {/* UPLOAD IMAGE */}
            <XStack alignItems="center" mt="$2" gap="$2">
              <Label width={120}>Upload Gambar</Label>

              <XStack gap="$2" flex={1}>
                <Button
                  flex={1}
                  size="$3"
                  icon={UploadCloud}
                  disabled={isBusy}
                  onPress={() => pickFromGallery(true)}
                >
                  {picking ? <Spinner /> : 'Galeri'}
                </Button>

                <Button
                  flex={1}
                  size="$3"
                  disabled={isBusy}
                  onPress={() => pickFromCamera()}
                >
                  {picking ? <Spinner /> : 'Kamera'}
                </Button>
              </XStack>
            </XStack>

            {/* PREVIEW */}
            {previewUris.length > 0 && (
              <XStack flexWrap="wrap" gap="$2" mt="$2">
                {previewUris.map((uri, i) => (
                  <Image key={i} source={{ uri }} width={60} height={60} />
                ))}
              </XStack>
            )}
          </YStack>

          <Button theme="accent" mt="$3" disabled={isBusy} onPress={handleSubmit}>
            {isBusy ? <Spinner /> : 'Submit'}
          </Button>

          <Unspaced>
            <Button
              bg="transparent"
              position="absolute"
              r="$3"
              t="$3"
              size="$3"
              circular
              icon={<X size="$1" />}
              onPress={() => setOpen(false)}
            />
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}
