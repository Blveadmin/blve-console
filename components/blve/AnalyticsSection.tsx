"use client";
import React from "react";

interface AnalyticsSectionProps {
  title: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

/**
 * AnalyticsSection — Executive two-column analytics section.
 */
export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  title,
  leftContent,
  rightContent,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111418] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.3)]">
          {leftContent}
        </div>
        <div className="bg-[#111418] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.3)]">
          {rightContent}
        </div>
      </div>
    </div>
  );
};
