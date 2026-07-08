"use client";

import { useEffect, useRef, useState } from "react";
import { PACE_WPM, PHRASE_WORDS, type Pace } from "@/lib/phrase";

export function usePhraseHighlighter(pace: Pace, playing: boolean, onDone: () => void) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!playing) return;

    const msPerWord = 60000 / PACE_WPM[pace];
    let index = 0;
    const kickoff = setTimeout(() => setActiveIndex(0), 0);

    const timer = setInterval(() => {
      index += 1;
      if (index >= PHRASE_WORDS.length) {
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
  }, [playing, pace]);

  return playing ? activeIndex : -1;
}
