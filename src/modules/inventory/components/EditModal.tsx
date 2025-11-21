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

// PREVIEW PICKER
import { useImagePicker } from 'src/modules/media/hooks/useImagePicker'

// BASE64 CONVERTER
import { convertPickedImages } from 'src/modules/media/utils/imageUpload'

// DIFF UTILS (POINT 6)
import { isItemUpdated, hasImageChanged } from 'src/modules/inventory/utils/diff'

interface EditModalProps {
  item?: Record<string, any>
  onSuccess?: () => void
  index: number
}

export default function EditModal({ item, onSuccess, index }: EditModalProps) {
  const [open, setOpen] = useState(false)

  const [latestDesc, setLatestDesc] = useState('')
  const [originLocation, setOriginLocation] = useState('')
  const [currentLocation, setCurrentLocation] = useState('')
  const [latestTagging, setLatestTagging] = useState('')

  // PREVIEW PICKER
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

  // SYNC FIELD DENGAN ITEM
  useEffect(() => {
    if (!item) return

    setLatestDesc(item.desc ?? '')
    setOriginLocation(item.original_location ?? '')
    setCurrentLocation(item.current_location ?? '')
    setLatestTagging(item.tagging ?? '')
  }, [item])

  // RESET IMAGES WHEN MODAL CLOSED
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
      // CEK TEXT UPDATE (point 6)
      const { updated: isTextUpdated } = isItemUpdated(item, {
        tagging: latestTagging,
        desc: latestDesc,
        original_location: originLocation,
        current_location: currentLocation,
      })

      // CEK IMAGE UPDATE (point 6)
      const imageChange = hasImageChanged(files, [
        item?.img_url1,
        item?.img_url2,
        item?.img_url3,
      ])

      // TIDAK ADA PERUBAHAN
      if (!isTextUpdated && !imageChange.changed) {
        showToast('Peringatan', '⚠️ Tidak ada perubahan.')
        return
      }

      // UPLOAD IMAGE JIKA BERUBAH
      if (imageChange.changed) {
        const base64Files = await convertPickedImages(files)

        const uploadRes = await uploadImage({
          uuid: item?.uuid,
          files: base64Files,
        })

        if (!uploadRes?.success) {
          throw new Error(uploadRes?.message || 'Upload gagal')
        }

        resetImages()
      }

      // UPDATE FIELD TEXT JIKA BERUBAH
      if (isTextUpdated) {
        const res = await editItem({
          uuid: item?.uuid,
          tagging: latestTagging,
          desc: latestDesc,
          original_location: originLocation,
          current_location: currentLocation,
        })

        if (!res?.success) {
          throw new Error(res?.message || 'Update gagal')
        }
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

            {/* UPLOAD GAMBAR */}
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
