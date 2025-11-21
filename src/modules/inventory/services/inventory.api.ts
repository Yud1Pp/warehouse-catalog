import { useState, useCallback } from "react";
import { useAlertToast } from "src/shared/components/AlertToast";

const DEFAULT_URL = process.env.EXPO_PUBLIC_APP_SCRIPT_URL || "";

export function useGudangAPI() {
  const { showToast } = useAlertToast();

  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_URL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeFetch = async (body?: any) => {
    if (!apiUrl || apiUrl.trim() === "") {
      return { error: "API URL belum diatur" };
    }

    const options = body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined;

    try {
      const res = await fetch(apiUrl, options);

      if (!res.ok) {
        return { error: `HTTP ${res.status} - ${res.statusText}` };
      }

      const json = await res.json();
      return json;
    } catch (err: any) {
      return { error: err.message || "Network request failed" };
    }
  };

  // =======================================================================
  // GET ITEMS
  // =======================================================================
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await safeFetch();

      if (!data || !Array.isArray(data)) throw new Error("Invalid response");
      return data;
    } catch (err) {
      setError(String(err));
      showToast("Error", "Gagal mengambil data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // =======================================================================
  // ADD ITEM
  // =======================================================================
  const addItem = useCallback(
    async (item: Record<string, any>) => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({ action: "add", ...item });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Data berhasil ditambahkan");

        return json;
      } catch (err) {
        showToast("Gagal", "Tidak dapat menambahkan data");
        setError(String(err));
        return { success: false, message: String(err) };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // =======================================================================
  // EDIT ITEM
  // =======================================================================
  const editItem = useCallback(
    async (payload: any) => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({ action: "edit", ...payload });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Data berhasil diperbarui");

        return json;
      } catch (err) {
        showToast("Error", "Gagal memperbarui data");
        setError(String(err));
        return { success: false, message: String(err) };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // =======================================================================
  // UPLOAD IMAGE
  // =======================================================================
  const uploadImage = useCallback(
    async (payload: any) => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({ action: "uploadImage", ...payload });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Gambar berhasil diupload");

        return json;
      } catch (err) {
        showToast("Error", "Gagal mengupload gambar");
        setError(String(err));
        return { success: false, message: String(err) };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // =======================================================================
  // REPLACE IMAGE
  // =======================================================================
  const replaceImage = useCallback(
    async (payload: any) => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({ action: "replaceImage", ...payload });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Gambar berhasil diganti");

        return json;
      } catch (err) {
        showToast("Error", "Gagal mengganti gambar");
        setError(String(err));
        return { success: false, message: String(err) };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // =======================================================================
  // DELETE IMAGE
  // =======================================================================
  const deleteImage = useCallback(
    async (payload: { uuid: string; url: string }) => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({ action: "deleteImage", ...payload });

        if (!json?.success) throw new Error(json?.message);

        showToast("Sukses", "Gambar berhasil dihapus");

        return json;
      } catch (err) {
        showToast("Error", "Gagal menghapus gambar");
        setError(String(err));
        return { success: false, message: String(err) };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  return {
    loading,
    error,
    apiUrl,
    setApiUrl,

    fetchItems,
    addItem,
    editItem,
    uploadImage,
    replaceImage,
    deleteImage, // ← TAMBAHKAN DI EXPORT
  };
}
