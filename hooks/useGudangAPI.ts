import { useState, useCallback } from "react";
import { useAlertToast } from "components/AlertToast";

const BASE_URL: string | undefined = process.env.EXPO_PUBLIC_APP_SCRIPT_URL;

export function useGudangAPI() {
  const { showToast } = useAlertToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =======================================================================
  // 🔹 Ambil semua data
  // =======================================================================
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      return data;
    } catch (err) {
      setError(String(err));
      showToast("Error", "Gagal mengambil data");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================================
  // 🔹 Tambah data baru
  // =======================================================================
  const addItem = useCallback(async (item: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", ...item }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      showToast("Sukses", "Data berhasil ditambahkan");
      return json;
    } catch (err) {
      showToast("Gagal", "Tidak dapat menambahkan data");
      setError(String(err));
      return { success: false, message: String(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================================
  // 🔹 Edit data (desc, lokasi, dsb.) 
  // =======================================================================
  const editItem = useCallback(async (payload: {
    uuid: string;
    tagging?: string;
    desc?: string;
    original_location?: string;
    current_location?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          ...payload,
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      showToast("Sukses", "Data berhasil diperbarui");
      return json;
    } catch (err) {
      setError(String(err));
      showToast("Error", "Gagal memperbarui data");
      return { success: false, message: String(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================================
  // 🔹 Upload gambar baru
  // =======================================================================
  const uploadImage = useCallback(async (payload: {
    uuid: string;
    files: { fileName: string; mimeType: string; file: string }[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "uploadImage",
          ...payload,
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      showToast("Sukses", "Gambar berhasil diupload");
      return json;
    } catch (err) {
      setError(String(err));
      showToast("Error", "Gagal mengupload gambar");
      return { success: false, message: String(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================================
  // 🔹 Replace satu gambar → berdasarkan old_url & file baru
  // =======================================================================
  const replaceImage = useCallback(async (payload: {
    uuid: string;
    old_url: string;
    file: { fileName: string; mimeType: string; file: string };
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "replaceImage",
          ...payload,
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      showToast("Sukses", "Gambar berhasil diganti");
      return json;
    } catch (err) {
      setError(String(err));
      showToast("Error", "Gagal mengganti gambar");
      return { success: false, message: String(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,

    fetchItems,
    addItem,
    editItem,
    uploadImage,
    replaceImage, // ⬅️ tambahkan di sini!
  };
}
