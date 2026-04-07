"use client";
import React from "react";

interface BLVPageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * BLVPageContainer — Executive page wrapper.
 * Background: #0B0E11 | Page title: text-3xl font-bold | Spacing: space-y-6
 */
export const BLVPageContainer: React.FC<BLVPageContainerProps> = ({
  title,
  subtitle,
  children,
  className = "",
}) => {
  return (
    <div
      className={`min-h-screen bg-[#0B0E11] p-6 lg:p-8 ${className}`}
    >
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="pb-2">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[rgba(255,255,255,0.60)] mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
        {/* Page Content */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};
