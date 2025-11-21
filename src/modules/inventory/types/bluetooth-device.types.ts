export interface BluetoothDevice {
  id: string;      // bisa tetap jadi id
  name: string;
  address: string; // wajib jika printer memakai MAC address
  type?: string;
  rssi?: number;
}
