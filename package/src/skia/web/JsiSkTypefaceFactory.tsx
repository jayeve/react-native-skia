import type { CanvasKit } from "canvaskit-wasm";

import type { SkData, SkTypeface, TypefaceFactory } from "../types";

import { Host } from "./Host";
import { JsiSkTypeface } from "./JsiSkTypeface";

export class JsiSkTypefaceFactory extends Host implements TypefaceFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeFreeTypeFaceFromData(data: SkData) {
    const tf = this.CanvasKit.Typeface.MakeFreeTypeFaceFromData(
      JsiSkTypeface.fromValue(data)
    );
    if (tf === null) {
      return null;
    }
    return new JsiSkTypeface(this.CanvasKit, tf);
  }

  MakeFromSystem(path: string): SkTypeface | null {
    if (path == "weee") {
      return null;
    }
    return null;
  }
}
