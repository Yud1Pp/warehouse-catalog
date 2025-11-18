import { SquarePen, X, UploadCloud } from "@tamagui/lucide-icons";
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
} from "tamagui";
import { useState, useEffect, useCallback } from "react";
import { useImagePicker } from "hooks/useImagePicker";
import { useGudangAPI } from "hooks/useGudangAPI";
import { useAlertToast } from "components/AlertToast";

interface EditModalProps {
  item?: Record<string, any>;
  onSuccess?: () => void;
  index: number;
}

export default function EditModal({ item, onSuccess, index }: EditModalProps) {
  const [open, setOpen] = useState(false);

  // =======================
  // 🔥 FORM STATES
  // =======================
  const [latestDesc, setLatestDesc] = useState("");
  const [originLocation, setOriginLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [latestTagging, setLatestTagging] = useState("");

  // =======================
  // 🔥 IMAGE PICKER
  // =======================
  const {
    files,
    previewUris,
    loading: picking,
    pickFromGallery,
    pickFromCamera,
    resetImages,
  } = useImagePicker();

  const { editItem, uploadImage, loading: apiLoading } = useGudangAPI();
  const { showToast } = useAlertToast();

  const [submitting, setSubmitting] = useState(false);

  const isBusy = submitting || apiLoading || picking;

  // =======================
  // 🔥 Sync modal values with item
  // =======================
  useEffect(() => {
    if (!item) return;
    setLatestDesc(item.desc ?? "");
    setOriginLocation(item.original_location ?? "");
    setCurrentLocation(item.current_location ?? "");
    setLatestTagging(item.tagging ?? "");
  }, [item]);

  // =======================
  // 🔥 Helper to convert file → base64
  // =======================
  const convertToBase64 = useCallback(async (pickerFiles: any[]) => {
    return Promise.all(
      pickerFiles.map(async (file) => {
        const blob = await (await fetch(file.uri)).blob();
        const reader = new FileReader();

        return new Promise((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result?.toString().replace(/^data:.+;base64,/, "");
            resolve({
              fileName: file.fileName,
              mimeType: file.type,
              file: base64,
            });
          };
          reader.readAsDataURL(blob);
        });
      })
    );
  }, []);

  // =======================
  // 🔥 Submit Handler
  // =======================
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const noTextChange =
        latestDesc === item?.desc &&
        originLocation === item?.original_location &&
        currentLocation === item?.current_location &&
        latestTagging === item?.tagging;

      const noImageChange = files.length === 0;

      if (noTextChange && noImageChange) {
        showToast("Peringatan", "⚠️ Tidak ada perubahan.");
        setSubmitting(false);
        return;
      }

      // Upload gambar jika ada file baru
      if (!noImageChange) {
        const base64Files = await convertToBase64(files);

        const uploadRes = await uploadImage({
          uuid: item?.uuid,
          files: base64Files,
        });

        if (!uploadRes?.success)
          throw new Error(uploadRes?.message || "Upload gagal");

        resetImages();
      }

      // Update text fields
      if (!noTextChange) {
        const res = await editItem({
          uuid: item?.uuid,
          tagging: latestTagging,
          desc: latestDesc,
          original_location: originLocation,
          current_location: currentLocation,
        });

        if (!res?.success)
          throw new Error(res?.message || "Update gagal");
      }

      showToast("Berhasil", "Data berhasil diperbarui.");
      onSuccess?.();
      setOpen(false);

    } catch (err: any) {
      showToast("Gagal", err.message || "Error saat update");
    } finally {
      setSubmitting(false);
    }
  };

  // =======================
  // 🔥 UI
  // =======================
  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="$3" icon={SquarePen} onPress={() => setOpen(true)} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          bg="$shadow6"
          animation="bouncy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          animation={["quickest", { damping: 3, stiffness: 100 }]}
          enterStyle={{ opacity: 0, scale: 0.95, y: 10 }}
          exitStyle={{ opacity: 0, scale: 0.97, y: 10 }}
          elevate
          bordered
          width="90%"
          maxWidth={800}
          p="$4"
          borderRadius="$6"
          backgroundColor="$background"
        >
          <Dialog.Title>
            <Text>Edit Data</Text>
          </Dialog.Title>

          <Dialog.Description>
            Sesuaikan deskripsi atau lokasi item. Upload foto bila perlu.
          </Dialog.Description>

          <YStack py="$3" gap="$2">
            <XStack alignItems="center">
              <Label width={120}>Tag</Label>
              <Input
                flex={1}
                value={latestTagging}
                onChangeText={setLatestTagging}
                placeholder="Masukan desc"
              />
            </XStack>

            <XStack alignItems="center">
              <Label width={120}>Desc</Label>
              <Input
                flex={1}
                value={latestDesc}
                onChangeText={setLatestDesc}
                placeholder="Masukan desc"
              />
            </XStack>

            <XStack alignItems="center">
              <Label width={120}>Original Location</Label>
              <Input
                flex={1}
                value={originLocation}
                onChangeText={setOriginLocation}
                placeholder="Masukan lokasi asal"
              />
            </XStack>

            <Fieldset horizontal alignItems="center">
              <Label width={120}>Current Location</Label>
              <Input
                flex={1}
                value={currentLocation}
                onChangeText={setCurrentLocation}
                placeholder="Masukan lokasi sekarang"
              />
            </Fieldset>

            {/* Upload Gambar */}
            <XStack alignItems="center" mt="$2" gap="$2">
              <Label width={120}>Upload Gambar</Label>

              <XStack gap="$2" flex={1}>
                <Button
                  flex={1}
                  size="$3"
                  icon={UploadCloud}
                  onPress={() => pickFromGallery(true)}
                  disabled={isBusy}
                >
                  {picking ? <Spinner /> : "Galeri"}
                </Button>

                <Button
                  flex={1}
                  size="$3"
                  onPress={pickFromCamera}
                  disabled={isBusy}
                >
                  {picking ? <Spinner /> : "Kamera"}
                </Button>
              </XStack>
            </XStack>

            {/* Preview */}
            {previewUris.length > 0 && (
              <XStack flexWrap="wrap" gap="$2" mt="$2">
                {previewUris.map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    width={60}
                    height={60}
                    borderRadius={8}
                    borderWidth={1}
                    borderColor="$borderColor"
                  />
                ))}
              </XStack>
            )}
          </YStack>

          <Button mt="$3" onPress={handleSubmit} disabled={isBusy}>
            {isBusy ? <Spinner /> : "Submit"}
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
  );
}
