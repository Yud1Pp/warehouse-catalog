Baik, saya sudah **membaca semua file terbaru** yang kamu upload (menggunakan setiap file yang muncul dari file_search), dan sekarang saya bisa memberikan **refactor review paling lengkap, terstruktur, dan detail** berdasarkan kondisi kode kamu saat ini.

Saya akan lakukan dengan 2 bagian:

1. **Daftar Refactor Terpenting (Prioritas Tinggi) – Wajib diperbaiki**
2. **Refactor Tambahan (Nice to Have) – Untuk membuat project jauh lebih kuat, scalable, dan bersih**

Semua poin akan saya sertai **referensi file** menggunakan filecite seperti ini:

> Contoh: “lihat kode di Items.tsx ”

---

# ✅ **BAGIAN 1 — REFACTOR PRIORITAS TINGGI (WAJIB DIBERESKAN DULU)**

Ini adalah bagian paling penting — perbaikan yang *benar-benar memengaruhi kestabilan app, UX, performa, dan maintainability*.

## **1. Menghilangkan semua penggunaan FileReader + fetch(blob) (INI WAJIB)**

Masalah ini muncul di:

* **EditModal.tsx** → convertToBase64() menggunakan fetch(blob) + FileReader

* **Items.tsx** → replaceWithFile() juga menggunakan FileReader


### ❌ Masalah:

* `FileReader` & `blob()` **tidak reliable di React Native**, terutama Android.
* Bisa memicu crash.
* Lambat dan berat untuk image besar.

### ✔ Solusi:

Buat util di:

```
src/modules/media/utils/fileToBase64.ts
```

Isi:

```ts
import RNFS from 'react-native-fs';

export async function fileToBase64(uri: string) {
  const cleanUri = uri.replace('file://', '');
  return await RNFS.readFile(cleanUri, 'base64');
}
```

Lalu di EditModal:

```ts
const base64Files = await Promise.all(
  files.map(async f => ({
    fileName: f.fileName,
    mimeType: f.type,
    file: await fileToBase64(f.uri)
  }))
);
```

Di Items:

```ts
const base64 = await fileToBase64(file.uri)
```

---

## **2. Bug di SelectDevices: disabled logic salah & berpotensi kacau UX**

File: SelectDevices.tsx


Saat ini:

```ts
<Pressable
  onPress={() => {
    if (devices.length === 0) {
      onEmptyDevices?.()
      return
    }
  }}
  disabled={devices.length === 0 ? false : true}   // BUG
>
```

### ❌ Salah total:

* Kalau **ADA device**, tombol justru disabled (true).
* Kalau **TIDAK ADA device**, tombol enabled (false).

### ✔ Perbaikan:

```ts
disabled={devices.length === 0}
```

Kalau pakai SelectDropdown, sebetulnya Pressable ini **tidak lagi perlu**.

Refactor ideal:

* Hapus Pressable
* Gunakan `disabled` bawaan SelectDropdown
* Trigger onEmptyDevices di event onOpen atau onPress fallback

---

## **3. Memoization: renderItem milik ItemTable harus dibungkus useCallback**

File: ItemTable.tsx


Saat ini:

```ts
const renderItem = ({ item, index }) => (
  <YStack flex={1}>
    <Items item={item} index={index} onRefreshPress={onRefreshPress} />
  </YStack>
)
```

### ❌ Masalah:

* renderItem dibuat ulang setiap render → menyebabkan seluruh list re-render.
* Untuk grid besar, performa drop.

### ✔ Solusi:

```ts
const renderItem = useCallback(
  ({ item, index }) => (
    <YStack flex={1}>
      <Items item={item} index={index} onRefreshPress={onRefreshPress} />
    </YStack>
  ),
  [onRefreshPress]
);
```

Dan Items juga sebaiknya di memo:

```ts
export default React.memo(Items)
```

---

## **4. Duplicate / Mirrored logic antara Items & EditModal untuk image handling**

Keduanya punya:

* konversi file ke base64
* mengambil file dari gallery/camera
* upload via API

Refactor ideal (buat reusable):

```
src/modules/media/utils/imageUpload.ts
```

lalu buat:

```ts
export async function convertPickedImages(pickedFiles) { ... }
export async function openGallery() { ... }
export async function openCamera() { ... }
```

---

## **5. ImagePreview Modal di Items sangat besar & logic bercampur dengan UI**

File: Items.tsx


* Terlalu banyak logic di satu file:
  replaceWithFile, download, delete, preview modal, uploading overlay.

⚠ Refactor besar: pindahkan Modal Preview menjadi komponen terpisah:

```
src/modules/media/components/ImagePreviewModal.tsx
```

---

## **6. Hard-coded business logic di EditModal**

File: EditModal.tsx


Contoh:

```ts
const noTextChange = ...
const noImageChange = ...
```

Solusi:

```
src/modules/inventory/utils/diff.ts
```

Isi:

```ts
export function isItemUpdated(original, edited) { ... }
export function hasImageChanged(files) { ... }
```

---

## **7. Provider masih memiliki theme logic terbalik**

File: Provider.tsx


Saat ini:

```ts
<Theme name={colorScheme === 'light' ? 'dark' : 'light'}>
```

### ❌ Ini membalik UI:

Theme dark ketika OS light.

### ✔ Fix:

```ts
<Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
```

---

## **8. Search logic masih inline di app/index.tsx — sebaiknya dipindah**

File: app/index.tsx


Saat ini:

```ts
const applyFilter = useCallback((dataset, query) => {...}, [])
```

### ✔ Pindahkan ke:

```
src/modules/inventory/hooks/useInventoryFilter.ts
```

---

# 🎯 **PRIORITAS AMBIL TINDAKAN SEKARANG**

Dari semua review, yang *paling penting dan paling berdampak*:

1. **Hapus FileReader + fetch(blob)**
2. **Perbaiki SelectDevices disabled bug**
3. **Memoization ItemTable + memo untuk Items**
4. **Pisahkan ImagePreviewModal dari Items**
5. **Fix Theme logic (sangat mudah — 1 line)**

---

# ✅ BAGIAN 2 — REFACTOR TAMBAHAN (NICE TO HAVE)

Ini optional, tapi sangat membuat aplikasi kamu terasa "production ready".

## **1. Tambah TypeScript Types**

Folder kosong kamu:

```
src/modules/inventory/types
```

Isi rekomendasi:

### item.types.ts

```ts
export interface Item {
  uuid: string
  tagging: string
  desc: string
  original_location: string
  current_location: string
  img_url1?: string
  img_url2?: string
  img_url3?: string
}
```

Lalu replace semua:

```ts
item: Record<string, any>
```

jadi:

```ts
item: Item
```

---

## **2. Seluruh API request seharusnya pakai class atau factory**

File: inventory.api.ts (belum ditunjukkan, tapi saya tahu dari struktur)
→ Ideal:

```ts
export function useInventoryAPI() {
  return { fetchItems, editItem, deleteItem ... }
}
```

atau:

```ts
class InventoryAPI {
  fetchItems(){...}
}
```

---

## **3. Pisahkan Bluetooth permission & scan logic ke module**

File: PrintModal.tsx


Ini sangat besar dan bisa dibuat:

```
modules/bluetooth/hooks/useBluetooth.ts
```

---

## **4. Centralized environment management**

File: EditUrl only calls `setApiUrl`
Ini sebenarnya bisa dipindah ke:

```
src/config/env.ts
```

---

## **5. Proper loading overlay**

Items modal still uses manual overlays:

```ts
<View style={{ ... }}>
```

Buat komponen:

```
src/shared/components/LoadingOverlay.tsx
```

---

# 🟦 PENUTUP — Mau saya buatkan patch otomatis?

Jika kamu mau, saya bisa:

### ✔ Generate patch (diff Git)

Untuk refactor:

* SelectDevices bug fix
* Replace FileReader implementation
* Memoize Items + renderItem
* Buat folder utils (fileToBase64, diff utils)
* Pisahkan ImagePreviewModal
* Fix theme logic
* Tambah typing Item

➡ Kamu tinggal copy & apply ke proyek kamu.

Tinggal jawab:

### **“Iya, buatkan patch refactor prioritas.”**

atau:

### **“Mulai dari refactor nomor 1 dulu.”**

Saya siap bantu sampai project kamu *perfect & production-ready*.
