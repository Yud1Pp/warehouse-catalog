// src/modules/inventory/utils/diff.ts
export type DiffResult = {
  updated: boolean;
  diffs: Record<string, { from: any; to: any }>;
};

/**
 * Normalisasi value untuk perbandingan.
 * - jika string -> trim + toLowerCase
 * - lainnya -> return as-is
 */
function normalizeForCompare(v: any) {
  if (v === null || v === undefined) return v;
  if (typeof v === 'string') return v.trim().toLowerCase();
  return v;
}

/**
 * isItemUpdated
 *
 * Compare original vs edited for a set of fields.
 * Returns object: { updated: boolean, diffs: { field: { from, to } } }
 */
export function isItemUpdated(
  original: Record<string, any> | null | undefined,
  edited: Record<string, any> | null | undefined,
  fields: string[] = ['tagging', 'desc', 'original_location', 'current_location']
): DiffResult {
  const diffs: Record<string, { from: any; to: any }> = {};

  if (!original && !edited) {
    return { updated: false, diffs };
  }

  for (const key of fields) {
    const from = original?.[key];
    const to = edited?.[key];

    const nFrom = normalizeForCompare(from);
    const nTo = normalizeForCompare(to);

    // If both are undefined/null treat as equal
    const bothEmpty = (from === undefined || from === null || from === '') &&
                      (to === undefined || to === null || to === '');

    if (!bothEmpty && nFrom !== nTo) {
      diffs[key] = { from, to };
    }
  }

  return { updated: Object.keys(diffs).length > 0, diffs };
}

/**
 * hasImageChanged
 *
 * Determine if image upload selection changed.
 *
 * - pickerFiles: array from useImagePicker (items usually have .uri and .fileName)
 * - originalImageUrls: array of existing image urls (may contain nulls)
 *
 * Rules:
 *  - if pickerFiles contains any item that looks like a local file (uri startsWith 'file://' or 'content://' or not starting with 'http'),
 *    we assume user selected a new file => changed
 *  - if pickerFiles contains base64 payload (object.file with base64 string) => changed
 *  - if pickerFiles empty => not changed
 *  - optional: if length differs from originalImageUrls and no files -> could be deletion (out of scope here)
 */
export function hasImageChanged(
  pickerFiles: any[] | null | undefined,
  originalImageUrls: (string | null | undefined)[] = []
): { changed: boolean; reason?: string } {
  if (!pickerFiles || pickerFiles.length === 0) {
    return { changed: false, reason: 'no-picked-files' };
  }

  // If any file contains a direct base64 payload (property named 'file' or 'base64')
  for (const f of pickerFiles) {
    if (f == null) continue;
    if (typeof f === 'string') {
      // string could be a URI; if not starting with http assume local -> changed
      if (!f.startsWith('http')) return { changed: true, reason: 'local-uri-string' };
      continue;
    }

    // file object: may have .file (base64), .uri, .type, .fileName
    const hasBase64 = typeof f.file === 'string' && f.file.length > 0;
    if (hasBase64) return { changed: true, reason: 'has-base64' };

    const uri = f.uri || f.uriString || f.path || '';
    if (typeof uri === 'string' && uri.length > 0) {
      const lower = uri.toLowerCase();
      const looksLocal = lower.startsWith('file://') || lower.startsWith('content://') || !lower.startsWith('http');
      if (looksLocal) return { changed: true, reason: 'local-uri' };
    }
  }

  // If none of the above matched, we have files but they look like URLs (rare).
  // Compare arrays length / values vs originalImageUrls.
  const pickedUrls = pickerFiles
    .map((f) => (typeof f === 'string' ? f : f.uri || f.url || null))
    .filter(Boolean) as string[];

  // if picked urls differ from original, consider changed
  const normalizedOriginal = (originalImageUrls || []).filter(Boolean).map((u) => (u || '').toLowerCase());
  const normalizedPicked = pickedUrls.map((u) => (u || '').toLowerCase());
  if (normalizedPicked.length !== normalizedOriginal.length) {
    return { changed: true, reason: 'different-length' };
  }
  for (let i = 0; i < normalizedPicked.length; i++) {
    if (normalizedPicked[i] !== normalizedOriginal[i]) {
      return { changed: true, reason: 'url-different' };
    }
  }

  return { changed: false, reason: 'no-change-detected' };
}
