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

        {/* Centered page content */}
        <div className="flex-1 w-full flex justify-center overflow-y-auto">
          <main className="w-full max-w-screen-2xl px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
