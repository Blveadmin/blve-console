"use client";
import React from "react";
import { BLVCard } from "./BLVCard";
import { BLVMetric } from "./BLVMetric";

interface Metric {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  sparkline?: React.ReactNode;
}

interface BLVTotalsRowProps {
  metrics: Metric[];
  className?: string;
}

/**
 * BLVTotalsRow — Executive KPI row.
 * 4-up grid of metric cards with large numbers, trends, and optional sparklines.
 */
export const BLVTotalsRow: React.FC<BLVTotalsRowProps> = ({
  metrics,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {metrics.map((metric, idx) => (
        <BLVCard key={idx}>
          <BLVMetric
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            sparkline={metric.sparkline}
            size="lg"
          />
        </BLVCard>
      ))}
    </div>
  );
};
