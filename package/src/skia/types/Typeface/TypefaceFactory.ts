import type { SkData } from "../Data";

import type { SkTypeface } from "./Typeface";

export interface TypefaceFactory {
  MakeFreeTypeFaceFromData(data: SkData): SkTypeface | null;
  MakeFromSystem(path: string): SkTypeface | null;
}
