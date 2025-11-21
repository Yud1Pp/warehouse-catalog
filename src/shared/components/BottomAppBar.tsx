import { Button, XStack, YStack } from 'tamagui';
import AddModal from 'src/modules/inventory/components/AddModal';
import { Link2, ScanLine } from '@tamagui/lucide-icons';

export default function BottomAppBar({
  onScanPress,
  onRefreshPress,
  onDownloadPress,
}: {
  onScanPress?: () => void;
  onRefreshPress?: () => void;
  onDownloadPress?: () => void;
}) {
  return (
    <YStack
      width='100%'
      gap='$3'
      alignSelf='center'
      justifyContent='center'
      py='$2'
    >
      <XStack gap='$2' alignItems='center' justify='space-between' width='100%'>
        <AddModal onSuccess={onRefreshPress} />

        <Button flex={1} size='$4' onPress={onScanPress} icon={<ScanLine size='$1' />} >
          Scan QR
        </Button>
        
        {/* <Button flex={1} size='$4' onPress={onRefreshPress}>
          Refresh
        </Button> */}
        {/* <Button flex={1} size='$4' onPress={onDownloadPress}>
          Download
        </Button> */}
      </XStack>
    </YStack>
  );
}
