import { ItemImage } from "./item-image.types";

export interface Item {
  uuid: string;
  tagging: string;
  desc: string;
  original_location: string;
  current_location: string;
  images: ItemImage[];
}
