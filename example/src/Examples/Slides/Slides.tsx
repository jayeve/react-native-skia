import {
  Canvas,
  Fill,
  ImageShader,
  rect,
  Shader,
  useImage,
  useComputedValue,
  useValue,
  useTouchHandler,
  runTiming,
} from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions } from "react-native";

import { snapPoint } from "../../components/Math/Physics";
import { frag } from "../../components/ShaderLib";

import { InvertedPageCurl } from "./transitions/invertedPageCurl";

const MIN_AMOUNT = -0.16;
const MAX_AMOUNT = 1.5;

const source = frag`
uniform shader image1;
uniform shader image2;
uniform half progress;
uniform float2 resolution;
uniform float amount;

half4 getFromColor(float2 uv) {
  return image1.eval(uv * resolution);
}

half4 getToColor(float2 uv) {
  return image2.eval(uv * resolution);
}

${InvertedPageCurl}

half4 main(vec2 xy) {
  vec2 uv = xy / resolution;
  return transition(
    uv
  );
}

`;

export const Slides = () => {
  const { width, height } = useWindowDimensions();
  const rct = rect(0, 0, width, height);
  const image1 = useImage(require("./assets/1.jpg"));
  const image2 = useImage(require("./assets/2.jpg"));
  const offset = useValue(0);
  const progress = useValue(0);
  const onTouch = useTouchHandler({
    onStart: ({ x }) => {
      offset.current = x;
    },
    onActive: ({ x }) => {
      const dx = offset.current - x;
      progress.current = dx / width;
    },
    onEnd: ({ x, velocityX }) => {
      const dst = snapPoint(x, velocityX, [0, width]);
      console.log({ dst });
      runTiming(progress, dst === 0 ? 1 : 0);
    },
  });
  const uniforms = useComputedValue(() => {
    return {
      progress: progress.current,
      resolution: [width, height],
      amount: progress.current * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT,
    };
  }, [progress]);
  if (!image1 || !image2) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch}>
      <Fill>
        <Shader source={source} uniforms={uniforms}>
          <ImageShader image={image1} fit="cover" rect={rct} />
          <ImageShader image={image2} fit="cover" rect={rct} />
        </Shader>
      </Fill>
    </Canvas>
  );
};
