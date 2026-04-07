"use client";
import React from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface BLVChartProps {
  data: DataPoint[];
  title?: string;
  color?: string;
  height?: number;
  className?: string;
  type?: "bar" | "line";
}

/**
 * BLVChart — Executive SVG chart.
 * Minimal grid, soft curves, light gradient fills, no heavy borders.
 * Executive calm aesthetic.
 */
export const BLVChart: React.FC<BLVChartProps> = ({
  data,
  title,
  color = "#3B82F6",
  height = 160,
  className = "",
  type = "bar",
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-[rgba(255,255,255,0.35)]">No data</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padLeft = 8;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 24;
  const chartW = 400;
  const chartH = height - padTop - padBottom;
  const gradId = `chart-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}-${type}`;

  if (type === "bar") {
    const barGap = 4;
    const barW = (chartW - padLeft - padRight) / data.length - barGap;

    return (
      <div className={className}>
        {title && (
          <p className="text-sm font-medium text-[rgba(255,255,255,0.60)] mb-3">
            {title}
          </p>
        )}
        <svg
          viewBox={`0 0 ${chartW} ${height}`}
          width="100%"
          height={height}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Minimal horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padTop + chartH * (1 - frac);
            return (
              <line
                key={frac}
                x1={padLeft}
                y1={y}
                x2={chartW - padRight}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}
          {/* Bars */}
          {data.map((d, i) => {
            const barH = (d.value / maxVal) * chartH;
            const x = padLeft + i * ((chartW - padLeft - padRight) / data.length) + barGap / 2;
            const y = padTop + chartH - barH;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill={`url(#${gradId})`}
                  rx="3"
                />
                <text
                  x={x + barW / 2}
                  y={height - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="rgba(255,255,255,0.35)"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Line chart
  const pts = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * (chartW - padLeft - padRight);
    const y = padTop + chartH - (d.value / maxVal) * chartH;
    return { x, y };
  });

  const linePath = pts
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const fillPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${padTop + chartH} L ${pts[0].x} ${padTop + chartH} Z`;

  return (
    <div className={className}>
      {title && (
        <p className="text-sm font-medium text-[rgba(255,255,255,0.60)] mb-3">
          {title}
        </p>
      )}
      <svg
        viewBox={`0 0 ${chartW} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Minimal grid */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padTop + chartH * (1 - frac);
          return (
            <line
              key={frac}
              x1={padLeft}
              y1={y}
              x2={chartW - padRight}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}
        {/* Gradient fill */}
        <path d={fillPath} fill={`url(#${gradId})`} />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* X labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={pts[i].x}
            y={height - 4}
            textAnchor="middle"
            fontSize="9"
            fill="rgba(255,255,255,0.35)"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
};
