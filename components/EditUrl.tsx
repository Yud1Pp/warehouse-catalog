import { useState } from "react";
import { Link2, X } from "@tamagui/lucide-icons";
import { Button, Dialog, Input, Label, Unspaced, XStack, YStack } from "tamagui";
import { useAlertToast } from "components/AlertToast";

export default function EditUrl({
  onChangeApiUrl,
}: {
  onChangeApiUrl?: (newUrl: string) => boolean | void;
}) {
  const { showToast } = useAlertToast();
  const [tempUrl, setTempUrl] = useState("");

  // state untuk mengontrol modal
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    if (!tempUrl.trim()) {
      showToast("Peringatan", "URL tidak boleh kosong");
      return;
    }

    // karena callback bisa async, kita await
    const result = await onChangeApiUrl?.(tempUrl.trim());
    console.log("EditUrl - handleSave - result:", result);

    // jika gagal → modal tidak close
    if (result === false) {
      showToast("Error", "URL gagal diterapkan");
      return;
    }

    // jika berhasil → close modal
    setTempUrl("");
    setOpen(false);
  };


  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button icon={<Link2 size="$1" />} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          backgroundColor="$shadow6"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quicker",
            { opacity: { overshootClamping: true } },
          ]}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.FocusScope focusOnIdle>
          <Dialog.Content
            bordered
            elevate
            borderRadius="$6"
            key="content"
            animateOnly={["transform", "opacity"]}
            animation={[
              "quicker",
              { opacity: { overshootClamping: true } },
            ]}
            enterStyle={{ x: 0, y: 20, opacity: 0 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
            width="90%"
            maxWidth={800}
            p="$4"
          >
            <YStack horizontal>
              <Label width={120} htmlFor="apiUrl">
                App Script URL
              </Label>
              <Input
                id="apiUrl"
                placeholder="Masukan URL baru"
                value={tempUrl}
                onChangeText={setTempUrl}
              />
            </YStack>

            <XStack alignSelf="flex-end" gap="$4">
              {/* Tidak pakai Dialog.Close */}
              <Button theme="accent" onPress={handleSave}>
                Save changes
              </Button>
            </XStack>

            <Unspaced>
              <Dialog.Close asChild>
                <Button
                  bg="transparent"
                  position="absolute"
                  r="$3"
                  t="$3"
                  size="$3"
                  circular
                  icon={<X size="$1" />}
                />
              </Dialog.Close>
            </Unspaced>
          </Dialog.Content>
        </Dialog.FocusScope>
      </Dialog.Portal>
    </Dialog>
  );
}