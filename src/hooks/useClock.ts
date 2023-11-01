import { useEffect, useRef } from "react";
import { bpmToPeriod } from "../utils";
import { LOOKAHEAD_TIME, EST_REFRESH_PERIOD } from "../constants";

export const useAnimationFrame = (
  bpm: number,
  action: () => void,
  isPlaying: boolean,
  audioContext: React.MutableRefObject<AudioContext | undefined>
) => {
  const frame = useRef<number | null>(null);

  const animate = (oldTime: number) => {
    const currentTime = audioContext.current!.currentTime * 1000;
    const timeDiff = currentTime - oldTime;

    if (timeDiff + EST_REFRESH_PERIOD / 2 + LOOKAHEAD_TIME >= bpmToPeriod(bpm)) {
      action();
      frame.current = requestAnimationFrame(() => animate(currentTime));
    } else {
      frame.current = requestAnimationFrame(() => animate(oldTime));
    }
  };

  useEffect(() => {
    if (isPlaying && audioContext.current) {
      const initialTime = audioContext.current.currentTime * 1000;
      frame.current = requestAnimationFrame(() => animate(initialTime));
    } else {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
      }
    }

    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, bpm]);
};
