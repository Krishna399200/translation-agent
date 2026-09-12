"use client";

import { useEffect, useRef, useState } from "react";
import { PACE_WPM, type Pace } from "@/lib/phrase";

export function usePhraseHighlighter(
  wordCount: number,
  pace: Pace,
  playing: boolean,
  onDone: () => void,
  loop = false
) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!playing || wordCount === 0) return;

    const msPerWord = 60000 / PACE_WPM[pace];
    let index = 0;
    const kickoff = setTimeout(() => setActiveIndex(0), 0);

    const timer = setInterval(() => {
      index += 1;
      if (index >= wordCount) {
        if (loop) {
          index = 0;
          setActiveIndex(0);
          return;
        }
        clearInterval(timer);
        // Small breath of silence after the last word before we stop recording.
        setTimeout(() => onDoneRef.current(), 700);
        return;
      }
      setActiveIndex(index);
    }, msPerWord);

    return () => {
      clearTimeout(kickoff);
      clearInterval(timer);
    };
  }, [playing, pace, wordCount, loop]);

  return playing ? activeIndex : -1;
}
