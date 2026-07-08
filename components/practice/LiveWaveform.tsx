"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 40;

export default function LiveWaveform({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d")!;

    function draw() {
      frameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);

      const width = canvas.width;
      const height = canvas.height;
      canvasCtx.clearRect(0, 0, width, height);

      const step = Math.floor(data.length / BAR_COUNT);
      const barWidth = width / BAR_COUNT;
      const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#6fd7c8");
      gradient.addColorStop(1, "#5cc2e8");

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = data[i * step] / 255;
        const barHeight = Math.max(3, value * height);
        canvasCtx.fillStyle = gradient;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        const w = barWidth * 0.55;
        canvasCtx.beginPath();
        if (canvasCtx.roundRect) {
          canvasCtx.roundRect(x, y, w, barHeight, w / 2);
        } else {
          canvasCtx.rect(x, y, w, barHeight);
        }
        canvasCtx.fill();
        canvasCtx.shadowColor = "rgba(111,215,200,0.6)";
        canvasCtx.shadowBlur = 8;
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      source.disconnect();
      ctx.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} width={640} height={90} className="h-[70px] w-full max-w-xl" />;
}
