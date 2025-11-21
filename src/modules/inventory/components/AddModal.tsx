import { Plus, X } from '@tamagui/lucide-icons';
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
} from 'tamagui';
import { useState } from 'react';
import { useGudangAPI } from 'src/modules/inventory/services/inventory.api';
import { useAlertToast } from 'src/shared/components/AlertToast';

export default function AddModal({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const { addItem, loading } = useGudangAPI();
  const { showToast } = useAlertToast();

  const [tag, setTag] = useState('');
  const [desc, setDesc] = useState('');
  const [originalLocation, setOriginalLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');

  const handleSubmit = async () => {
    if (loading) return;

    if (!tag || !desc || !originalLocation) {
      showToast('Peringatan', 'Tag, Deskripsi, dan Original Location wajib diisi!');
      return;
    }

    try {
      const result = await addItem({
        tagging: tag,
        desc,
        original_location: originalLocation,
        current_location: currentLocation || '',
      });

      if (result?.success) {
        setOpen(false);
        onSuccess?.();
        setTag('');
        setDesc('');
        setOriginalLocation('');
        setCurrentLocation('');
      }
    } catch {}
  };

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          size='$4'
          flex={1}
          onPress={() => setOpen(true)}
          icon={<Plus size='$1' />}
        >
          Add
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          key='overlay'
          bg='$shadow6'
          animation='bouncy'
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          opacity={1}
        />

        <Dialog.Content
          key='content'
          animation={['quickest', { damping: 3, mass: 0.1, stiffness: 100 }]}
          enterStyle={{ opacity: 0, scale: 0.95, y: 10 }}
          exitStyle={{ opacity: 0, scale: 0.97, y: 10 }}
          opacity={1}
          scale={1}
          y={0}
          elevate
          bordered
          width='90%'
          maxWidth={800}
          p='$4'
          borderRadius='$6'
          backgroundColor='$background'
        >
          <Dialog.Title>
            <Text>Add Data</Text>
          </Dialog.Title>

          <Dialog.Description>
            Isi data dengan lengkap, lalu tekan submit.
          </Dialog.Description>

          <YStack gap='$2' py='$2'>
            <Fieldset horizontal alignItems='center'>
              <Label fontWeight='700' width={120}>Tag*</Label>
              <Input
                flex={1}
                placeholder='Masukan tag'
                value={tag}
                onChangeText={setTag}
              />
            </Fieldset>

            <Fieldset horizontal alignItems='center'>
              <Label fontWeight='700' width={120}>Desc*</Label>
              <Input
                flex={1}
                placeholder='Masukan deskripsi'
                value={desc}
                onChangeText={setDesc}
              />
            </Fieldset>

            <Fieldset horizontal alignItems='center'>
              <Label fontWeight='700' width={120}>Original Location*</Label>
              <Input
                flex={1}
                placeholder='Masukan original location'
                value={originalLocation}
                onChangeText={setOriginalLocation}
              />
            </Fieldset>

            <Fieldset horizontal alignItems='center'>
              <Label fontWeight='700' width={120}>Current Location</Label>
              <Input
                flex={1}
                placeholder='Masukan current location (opsional)'
                value={currentLocation}
                onChangeText={setCurrentLocation}
              />
            </Fieldset>
          </YStack>

          <Button theme='accent' mt='$3' onPress={handleSubmit} disabled={loading}>
            {loading ? <Spinner /> : 'Submit'}
          </Button>

          <Unspaced>
            <Button
              bg='transparent'
              position='absolute'
              r='$3'
              t='$3'
              size='$3'
              circular
              icon={<X size='$1' />}
              onPress={() => setOpen(false)}
            />
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
