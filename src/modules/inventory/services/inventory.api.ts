import { useState, useCallback } from "react";
import { useAlertToast } from "src/shared/components/AlertToast";

// ITEM MODEL
import { Item } from "../types/item.types";

// API TYPES
import {
  AddItemPayload,
  AddItemResponse,
  EditItemPayload,
  EditItemResponse,
  UploadImagePayload,
  UploadImageResponse,
  ReplaceImagePayload,
  ReplaceImageResponse,
  DeleteImagePayload,
  DeleteImageResponse,
} from "../types/api.types";

const DEFAULT_URL = process.env.EXPO_PUBLIC_APP_SCRIPT_URL || "";

export function useGudangAPI() {
  const { showToast } = useAlertToast();

  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_URL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // SAFE FETCH WRAPPER
  // ============================================================
  const safeFetch = async (body?: any): Promise<any> => {
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

      if (options) {
        console.log("API Request Body:", body);
        console.log("API Response:", json);
      }

      return json;
    } catch (err: any) {
      return { error: err.message || "Network request failed" };
    }
  };

  // Convert raw API item → Item type
  const mapItem = (raw: any): Item => {
    const images = [
      raw.img_url1 ? { url: raw.img_url1, index: 1 } : null,
      raw.img_url2 ? { url: raw.img_url2, index: 2 } : null,
      raw.img_url3 ? { url: raw.img_url3, index: 3 } : null,
    ].filter(Boolean) as { url: string; index: number }[];

    return {
      uuid: raw.uuid,
      tagging: raw.tagging,
      desc: raw.desc,
      original_location: raw.original_location,
      current_location: raw.current_location,
      images,
    };
  };

  // ============================================================
  // FETCH ITEMS
  // ============================================================
  const fetchItems = useCallback(async (): Promise<Item[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await safeFetch();

      if (!data || !Array.isArray(data)) throw new Error("Invalid response");

      const items: Item[] = data
        .filter((x: any) => x && x.uuid)
        .map((x: any) => mapItem(x));

      return items;
    } catch (err) {
      setError(String(err));
      showToast("Error", "Gagal mengambil data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // ============================================================
  // ADD ITEM
  // ============================================================
  const addItem = useCallback(
    async (payload: AddItemPayload): Promise<AddItemResponse> => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({ action: "add", ...payload });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Data berhasil ditambahkan");

        return json as AddItemResponse;
      } catch (err) {
        const msg = String(err);
        showToast("Gagal", "Tidak dapat menambahkan data");
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // ============================================================
  // EDIT ITEM
  // ============================================================
  const editItem = useCallback(
    async (payload: EditItemPayload): Promise<EditItemResponse> => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({ action: "edit", ...payload });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Data berhasil diperbarui");

        return json as EditItemResponse;
      } catch (err) {
        const msg = String(err);
        showToast("Error", "Gagal memperbarui data");
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // ============================================================
  // UPLOAD IMAGE
  // ============================================================
  const uploadImage = useCallback(
    async (payload: UploadImagePayload): Promise<UploadImageResponse> => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({
          action: "uploadImage",
          ...payload,
        });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Gambar berhasil diupload");

        return json as UploadImageResponse;
      } catch (err) {
        const msg = String(err);
        showToast("Error", "Gagal mengupload gambar");
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // ============================================================
  // REPLACE IMAGE
  // ============================================================
  const replaceImage = useCallback(
    async (payload: ReplaceImagePayload): Promise<ReplaceImageResponse> => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({
          action: "replaceImage",
          ...payload,
        });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Gambar berhasil diganti");

        return json as ReplaceImageResponse;
      } catch (err) {
        const msg = String(err);
        showToast("Error", "Gagal mengganti gambar");
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // ============================================================
  // DELETE IMAGE
  // ============================================================
  const deleteImage = useCallback(
    async (payload: DeleteImagePayload): Promise<DeleteImageResponse> => {
      setLoading(true);
      setError(null);

      try {
        const json = await safeFetch({
          action: "deleteImage",
          ...payload,
        });

        if (!json?.success) throw new Error(json?.message);
        showToast("Sukses", "Gambar berhasil dihapus");

        return json as DeleteImageResponse;
      } catch (err) {
        const msg = String(err);
        showToast("Error", "Gagal menghapus gambar");
        setError(msg);
        return { success: false, message: msg };
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
    deleteImage,
  };
}
