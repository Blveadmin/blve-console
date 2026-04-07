"use client";
import React from "react";

interface BLVCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * BLVCard — Executive dark card.
 * Background: #111418 | Border: rgba(255,255,255,0.08)
 * Padding: p-6 | Rounded: xl | Shadow: soft depth
 */
export const BLVCard: React.FC<BLVCardProps> = ({
  children,
  className = "",
  onClick,
  hoverable = false,
}) => {
  const base =
    "bg-[#111418] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.3)]";
  const hover = hoverable
    ? "cursor-pointer transition-all duration-200 hover:border-[rgba(255,255,255,0.18)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:bg-[#161B21]"
    : "";
  return (
    <div
      onClick={onClick}
      className={[base, hover, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
};
