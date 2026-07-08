"use client";

import { useCallback, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording" | "stopped" | "error";

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const resultRef = useRef<{ blob: Blob; durationSeconds: number } | null>(null);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      startTimeRef.current = performance.now();
      setStatus("recording");
      return true;
    } catch {
      setError(
        "We couldn't reach your microphone. Check your browser's permission settings and try again."
      );
      setStatus("error");
      return false;
    }
  }, []);

  const stop = useCallback((): Promise<{ blob: Blob; durationSeconds: number }> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        const fallback = resultRef.current ?? { blob: new Blob(), durationSeconds: 0 };
        resolve(fallback);
        return;
      }

      recorder.onstop = () => {
        const durationSeconds = (performance.now() - startTimeRef.current) / 1000;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        const result = { blob, durationSeconds };
        resultRef.current = result;
        setStatus("stopped");
        resolve(result);
      };

      recorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    chunksRef.current = [];
    resultRef.current = null;
  }, []);

  return { status, error, start, stop, reset };
}
