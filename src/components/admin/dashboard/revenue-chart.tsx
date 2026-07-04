"use client";

import { useState } from "react";
import { formatAgorot } from "@/lib/format";
import { CHART_ACCENT_LIGHT, CHART_ACCENT_MID, CHART_GRID_COLOR } from "@/lib/admin/chart-colors";
import type { DailyRevenuePoint } from "@/lib/admin/dashboard-metrics";

const WIDTH = 640;
const HEIGHT = 200;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;
const CHART_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

function formatDateLabel(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}`;
}

/**
 * גרף הכנסה יומית ל-30 הימים האחרונים — SVG ידני (עמודות), בלי ספריית
 * צ'ארטים (החלטה #10 ב-platform-upgrade.md). עוטף ב-overflow-x-auto עם
 * min-width קבוע כדי שגוף העמוד עצמו לעולם לא יגלול אופקית (רק הגרף עצמו).
 */
export function RevenueChart({ data }: { data: DailyRevenuePoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const totalRevenue = data.reduce((sum, d) => sum + d.revenueAgorot, 0);
  const daysWithData = data.filter((d) => d.revenueAgorot > 0).length;
  const isZero = totalRevenue === 0;
  const isLowData = !isZero && daysWithData < 7;
  const maxValue = Math.max(1, ...data.map((d) => d.revenueAgorot));

  const barGap = 2;
  const barWidth = data.length > 0 ? (WIDTH - barGap * (data.length - 1)) / data.length : 0;
  const baselineY = PADDING_TOP + CHART_HEIGHT;

  const gridLines = [0.25, 0.5, 0.75].map((fraction) => PADDING_TOP + CHART_HEIGHT * fraction);

  // תוויות ציר-X: 5 נקודות מפוזרות (ראשון/אמצע/אחרון + 2 ביניים) — לא כל 30 הימים.
  const labelIndexes = new Set(
    [0, Math.round((data.length - 1) * 0.25), Math.round((data.length - 1) * 0.5), Math.round((data.length - 1) * 0.75), data.length - 1].filter(
      (i) => i >= 0,
    ),
  );

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hoveredX = hoverIndex !== null ? hoverIndex * (barWidth + barGap) + barWidth / 2 : 0;

  return (
    <div className="relative">
      {isLowData && (
        <div className="absolute start-3 top-3 z-10 rounded-full border border-line-dark bg-ink-soft/95 px-3 py-1 text-[11px] text-neutral-400 shadow-lg">
          מעט נתונים עדיין — הגרף יתמלא ככל שייכנסו הזמנות.
        </div>
      )}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="הכנסה יומית, 30 הימים האחרונים">
            {gridLines.map((y) => (
              <line key={y} x1={0} y1={y} x2={WIDTH} y2={y} stroke={CHART_GRID_COLOR} strokeWidth={1} />
            ))}
            <line x1={0} y1={baselineY} x2={WIDTH} y2={baselineY} stroke={CHART_GRID_COLOR} strokeWidth={1} />

            {!isZero &&
              data.map((point, i) => {
                const barHeight = (point.revenueAgorot / maxValue) * CHART_HEIGHT;
                const x = i * (barWidth + barGap);
                const y = baselineY - barHeight;
                const isHovered = hoverIndex === i;
                return (
                  <rect
                    key={point.dateKey}
                    x={x}
                    y={barHeight > 0 ? y : baselineY - 1}
                    width={barWidth}
                    height={Math.max(barHeight, 1)}
                    fill={isHovered ? CHART_ACCENT_LIGHT : CHART_ACCENT_MID}
                    rx={1.5}
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                    className="cursor-default transition-colors"
                  />
                );
              })}

            {data.map(
              (point, i) =>
                labelIndexes.has(i) && (
                  <text
                    key={point.dateKey}
                    x={i * (barWidth + barGap) + barWidth / 2}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    className="fill-neutral-500 text-[10px] [font-variant-numeric:tabular-nums]"
                    style={{ direction: "ltr" }}
                  >
                    {formatDateLabel(point.dateKey)}
                  </text>
                ),
            )}
          </svg>
        </div>
      </div>

      {isZero && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
          טרם נרשמו הכנסות.
        </p>
      )}

      {hovered && !isZero && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-lg border border-line-dark bg-ink-soft px-3 py-1.5 text-xs whitespace-nowrap text-neutral-200 shadow-lg"
          style={{
            insetInlineStart: `calc(${(hoveredX / WIDTH) * 100}% )`,
            top: 0,
          }}
        >
          <div className="text-neutral-400">{formatDateLabel(hovered.dateKey)}</div>
          <div className="font-medium text-white">{formatAgorot(hovered.revenueAgorot, "he")}</div>
        </div>
      )}
    </div>
  );
}
