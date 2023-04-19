import { Skia } from "../Skia";
import type { SkTypeface } from "../types";

/**
 * Returns a Skia Typeface from a system font
 * */
export function useSystemTypeface(path: string): SkTypeface | null {
  return Skia.Typeface.MakeFromSystem(path);
}
