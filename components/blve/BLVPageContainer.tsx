"use client";
import React from "react";

interface BLVPageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const BLVPageContainer: React.FC<BLVPageContainerProps> = ({
  title,
  subtitle,
  children,
  className = "",
}) => {
  return (
    <div className={`w-full max-w-screen-2xl mx-auto px-8 py-8 ${className}`}>
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
  );
};
