"use client";
import React from "react";

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

/**
 * DashboardLayout — Executive dashboard wrapper.
 * Background: #0B0E11 | Title: text-3xl font-bold
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#0B0E11]">
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-sm text-[rgba(255,255,255,0.60)] mt-1.5">
            Executive overview and analytics
          </p>
        </div>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};
