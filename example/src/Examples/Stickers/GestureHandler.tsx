import type { SkMatrix, SkRect } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

interface GestureHandlerProps {
  matrix: SharedValue<SkMatrix>;
  dimensions: SkRect;
  debug?: boolean;
}

export const GestureHandler = ({
  matrix,
  dimensions,
  debug,
}: GestureHandlerProps) => {
  const { x, y, width, height } = dimensions;
  const origin = useSharedValue(Skia.Point(0, 0));
  const offset = useSharedValue(Skia.Matrix());

  const pan = Gesture.Pan().onChange((e) => {
    const newMatrix = Skia.Matrix(matrix.value.get());
    const m = Skia.Matrix();
    m.translate(e.changeX, e.changeY);
    newMatrix.concat(m);
    matrix.value = newMatrix;
  });

  // const rotate = Gesture.Rotation()
  //   .onBegin((e) => {
  //     origin.value = Skia.Point(e.anchorX, e.anchorY);
  //     offset.value = matrix.value;
  //   })
  //   .onChange((e) => {
  //     matrix.value = concat(offset.value, origin.value, [
  //       { rotateZ: e.rotation },
  //     ]);
  //   });

  // const scale = Gesture.Pinch()
  //   .onBegin((e) => {
  //     origin.value = [e.focalX, e.focalY, 0];
  //     offset.value = matrix.value;
  //   })
  //   .onChange((e) => {
  //     matrix.value = concat(offset.value, origin.value, [{ scale: e.scale }]);
  //   });

  const style = useAnimatedStyle(() => {
    const m = matrix.value.get();
    return {
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      backgroundColor: debug ? "rgba(100, 200, 300, 0.4)" : "transparent",
      transform: [
        { translateX: -width / 2 },
        { translateY: -height / 2 },
        {
          matrix: [
            m[0],
            m[1],
            m[2],
            0,
            m[3],
            m[4],
            m[5],
            0,
            m[6],
            m[7],
            m[8],
            0,
            0,
            0,
            0,
            1,
          ],
        },
        { translateX: width / 2 },
        { translateY: height / 2 },
      ],
    };
  });
  //const gesture = Gesture.Race(scale, rotate, pan);
  const gesture = Gesture.Race(pan);
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style} />
    </GestureDetector>
  );
};
