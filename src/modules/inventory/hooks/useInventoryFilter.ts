import { useCallback } from "react";
import { Item } from "../types/item.types";

export function useInventoryFilter() {
  /**
   * applyFilter:
   * Melakukan pencarian berdasarkan query (case-insensitive)
   */
  const applyFilter = useCallback(
    (dataset: Item[], query: string) => {
      if (!dataset || dataset.length === 0) return [];

      const term = query?.toLowerCase() ?? "";

      // Jika query kosong → return dataset awal
      if (!term.trim()) return dataset;

      return dataset.filter((item) => {
        const values = [
          item.tagging,
          item.desc,
          item.original_location,
          item.current_location,
        ];

        return values.some((v) =>
          (v || "").toString().toLowerCase().includes(term)
        );
      });
    },
    []
  );

  return { applyFilter };
}
