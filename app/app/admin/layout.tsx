"use client";
import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#0B0E11]">
      {/* Executive Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 w-full max-w-screen-2xl mx-auto px-8 py-8 overflow-y-auto bg-[#0B0E11]">
          {children}
        </main>
      </div>
    </div>
  );
}
