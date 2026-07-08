"use client";

import { useState } from "react";

type Point = { date: string; rating: number };

const WIDTH = 320;
const HEIGHT = 140;
const PAD_X = 16;
const PAD_Y = 16;

export default function TrendChart({ points }: { points: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <p className="text-sm text-ink-faint">
        Your trend line will appear once you have a couple of sessions to compare.
      </p>
    );
  }

  const plotW = WIDTH - PAD_X * 2;
  const plotH = HEIGHT - PAD_Y * 2;
  const minRating = 1;
  const maxRating = 5;

  const coords = points.map((p, i) => {
    const x = PAD_X + (i / (points.length - 1)) * plotW;
    const y = PAD_Y + (1 - (p.rating - minRating) / (maxRating - minRating)) * plotH;
    return { ...p, x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${PAD_Y + plotH} L${coords[0].x},${PAD_Y + plotH} Z`;

  const active = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-teal-300)" />
            <stop offset="100%" stopColor="var(--color-gold-500)" />
          </linearGradient>
        </defs>

        <line
          x1={PAD_X}
          y1={PAD_Y + plotH}
          x2={WIDTH - PAD_X}
          y2={PAD_Y + plotH}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />

        <path d={areaPath} fill="var(--color-teal-300)" opacity={0.1} />
        <path d={linePath} fill="none" stroke="url(#trendLine)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 5 : 4}
            fill={i === coords.length - 1 ? "var(--color-gold-500)" : "var(--color-teal-500)"}
            stroke="var(--color-void)"
            strokeWidth={2}
            onMouseEnter={() => setHoverIndex(i)}
            className="cursor-pointer"
          />
        ))}

        <text
          x={coords[coords.length - 1].x}
          y={coords[coords.length - 1].y - 12}
          textAnchor="end"
          className="fill-ink text-[10px] font-semibold"
        >
          {coords[coords.length - 1].rating}
        </text>
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-void-deep px-2 py-1 text-xs text-ink shadow-soft"
          style={{ left: `${(active.x / WIDTH) * 100}%`, top: `${(active.y / HEIGHT) * 100}%` }}
        >
          {new Date(active.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {active.rating}
        </div>
      )}
    </div>
  );
}
