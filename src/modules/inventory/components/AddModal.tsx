import { Plus, X } from '@tamagui/lucide-icons'
import {
  Button,
  Dialog,
  Spinner,
  Unspaced,
  YStack,
  Text,
  Fieldset,
  Input,
  Label,
} from 'tamagui'
import { useState } from 'react'

import { useGudangAPI } from 'src/modules/inventory/services/inventory.api'
import { useAlertToast } from 'src/shared/components/AlertToast'

// TYPED PAYLOAD
import { AddItemPayload } from '../types/api.types'

export default function AddModal({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const { addItem, loading } = useGudangAPI()
  const { showToast } = useAlertToast()

  const [tag, setTag] = useState('')
  const [desc, setDesc] = useState('')
  const [originalLocation, setOriginalLocation] = useState('')
  const [currentLocation, setCurrentLocation] = useState('')

  const resetForm = () => {
    setTag('')
    setDesc('')
    setOriginalLocation('')
    setCurrentLocation('')
  }

  const handleSubmit = async () => {
    if (loading) return

    if (!tag.trim() || !desc.trim() || !originalLocation.trim()) {
      showToast('Peringatan', 'Tag, Deskripsi, dan Original Location wajib diisi!')
      return
    }

    try {
      const payload: AddItemPayload = {
        tagging: tag.trim(),
        desc: desc.trim(),
        original_location: originalLocation.trim(),
        current_location: currentLocation.trim() || '',
      }

      const result = await addItem(payload)

      if (result?.success) {
        showToast('Sukses', 'Data berhasil ditambahkan.')

        resetForm()
        onSuccess?.()
        setOpen(false)
      }
    } catch (err) {
      showToast('Error', 'Terjadi kesalahan saat menambahkan data')
    }
  }

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          size="$4"
          flex={1}
          onPress={() => setOpen(true)}
          icon={<Plus size="$1" />}
        >
          Add
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay bg="$shadow6" />

        <Dialog.Content
          animation={['quickest', { damping: 3, stiffness: 100 }]}
          elevate
          bordered
          width="90%"
          maxWidth={800}
          p="$4"
          borderRadius="$6"
          backgroundColor="$background"
        >
          <Dialog.Title>
            <Text fontWeight="700">Add Data</Text>
          </Dialog.Title>

          <Dialog.Description>
            Isi data dengan lengkap, lalu tekan submit.
          </Dialog.Description>

          <YStack gap="$2" py="$2">

            <Fieldset horizontal alignItems="center">
              <Label width={140}>Tag *</Label>
              <Input
                flex={1}
                value={tag}
                placeholder="Masukan tag"
                onChangeText={setTag}
              />
            </Fieldset>

            <Fieldset horizontal alignItems="center">
              <Label width={140}>Desc *</Label>
              <Input
                flex={1}
                value={desc}
                placeholder="Masukan deskripsi"
                onChangeText={setDesc}
              />
            </Fieldset>

            <Fieldset horizontal alignItems="center">
              <Label width={140}>Original Location *</Label>
              <Input
                flex={1}
                value={originalLocation}
                placeholder="Masukan original location"
                onChangeText={setOriginalLocation}
              />
            </Fieldset>

            <Fieldset horizontal alignItems="center">
              <Label width={140}>Current Location</Label>
              <Input
                flex={1}
                value={currentLocation}
                placeholder="Opsional"
                onChangeText={setCurrentLocation}
              />
            </Fieldset>

          </YStack>

          <Button theme="accent" mt="$3" onPress={handleSubmit} disabled={loading}>
            {loading ? <Spinner /> : 'Submit'}
          </Button>

          <Unspaced>
            <Button
              bg="transparent"
              position="absolute"
              top="$3"
              right="$3"
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
