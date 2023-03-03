import {
  Canvas,
  Fill,
  ImageShader,
  rect,
  Shader,
  useImage,
  useLoop,
  Easing,
  useComputedValue,
} from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions } from "react-native";

import { frag } from "../../components/ShaderLib";

const source = frag`
uniform shader image1;
uniform shader image2;
uniform half progress;

half4 main(vec2 xy) {
  half4 p1 = image1.eval(xy);
  half4 p2 = image2.eval(xy);
  return mix(p1, p2, progress);
}

`;

export const Slides = () => {
  const { width, height } = useWindowDimensions();
  const rct = rect(0, 0, width, height);
  const image1 = useImage(require("./assets/1.jpg"));
  const image2 = useImage(require("./assets/2.jpg"));
  const progress = useLoop({
    duration: 3000,
    easing: Easing.inOut(Easing.ease),
  });
  const uniforms = useComputedValue(() => {
    return { progress: progress.current };
  }, [progress]);
  if (!image1 || !image2) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill>
        <Shader source={source} uniforms={uniforms}>
          <ImageShader image={image1} fit="cover" rect={rct} />
          <ImageShader image={image2} fit="cover" rect={rct} />
        </Shader>
      </Fill>
    </Canvas>
  );
};
