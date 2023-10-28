/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { bpmToPeriod } from "../utils";

export const useAnimationFrame = (
  bpm: number,
  nextAnimationFrameHandler: () => void,
  shouldAnimate: boolean
) => {
  const REFRESH_PERIOD = 20;
  const frame = useRef(0);

  const animate = (oldTime: number) => {
    if (performance.now() - oldTime + REFRESH_PERIOD / 2 >= bpmToPeriod(bpm)) {
      console.log(
        "mesured",
        performance.now() - oldTime,
        "theo",
        bpmToPeriod(bpm)
      );

      nextAnimationFrameHandler();
      frame.current = requestAnimationFrame(() => animate(performance.now()));
    } else {
      frame.current = requestAnimationFrame(() => animate(oldTime));
    }
  };

  useEffect(() => {
    if (shouldAnimate) {
      const initialTime = performance.now();
      frame.current = requestAnimationFrame(() => animate(initialTime));
    } else {
      cancelAnimationFrame(frame.current);
    }

    return () => cancelAnimationFrame(frame.current);
  }, [shouldAnimate, bpm]);
};
