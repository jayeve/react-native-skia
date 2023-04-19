import { Skia } from "../Skia";
import type { SkTypeface } from "../types";

const myTfFactory = Skia.Typeface.MakeFromSystem.bind(Skia.Typeface);

/**
 * Returns a Skia Typeface from a system font
 * */
export function useSystemTypeface(path: string): SkTypeface | null {
  return myTfFactory(path);
}
