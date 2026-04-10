"use client";

import LeftNav from "./LeftNav";
import TopHeader from "./TopHeader";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#05070A] text-white flex">
      <LeftNav />
      <div className="flex-1 flex flex-col">
        <TopHeader />
        <main className="flex-1 px-8 py-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
