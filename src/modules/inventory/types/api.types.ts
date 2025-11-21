// src/modules/inventory/types/api.types.ts

import { Base64File } from "./image-upload.types";
import { Item } from "./item.types";

// ======================================================
// FETCH ITEMS (Apps Script returns ARRAY ONLY)
// ======================================================
// Tidak ada FetchItemsResponse, hapus untuk menghindari kebingungan.

// ======================================================
// ADD ITEM
// ======================================================
export interface AddItemPayload {
  tagging: string;
  desc: string;
  original_location: string;
  current_location: string;
}

export interface AddItemResponse {
  success: boolean;
  message?: string;
}

// ======================================================
// EDIT ITEM
// ======================================================
export interface EditItemPayload {
  uuid: string;
  tagging: string;
  desc: string;
  original_location: string;
  current_location: string;
}

export interface EditItemResponse {
  success: boolean;
  message?: string;
}

// ======================================================
// UPLOAD IMAGE
// ======================================================
export interface UploadImagePayload {
  uuid: string;
  files: {
    fileName: string;
    mimeType: string;
    file: string; // base64
  }[];
}

export interface UploadImageResponse {
  success: boolean;
  message?: string;
  urls?: string[]; // list of uploaded images
}

// ======================================================
// REPLACE IMAGE
// ======================================================
export interface ReplaceImagePayload {
  uuid: string;
  old_url: string;
  file: Base64File;
}

export interface ReplaceImageResponse {
  success: boolean;
  message?: string;
  newUrl?: string;  // must follow API real output
}

// ======================================================
// DELETE IMAGE
// ======================================================
export interface DeleteImagePayload {
  uuid: string;
  url: string;
}

export interface DeleteImageResponse {
  success: boolean;
  message?: string;
}
