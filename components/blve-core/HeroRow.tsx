"use client";

export default function HeroRow() {
  return (
    <div className="w-full h-64 rounded-xl bg-gradient-to-br from-[#0A0F1C] to-[#0F1A2E] border border-white/5 p-6 flex flex-col justify-between">
      <div className="text-white/80 text-sm tracking-widest">
        BLVΞ NETWORK INTELLIGENCE
      </div>

      <div className="flex-1 flex items-center justify-center text-white/40 text-xs">
        {/* Placeholder until we wire the animated neon curve */}
        Hero Graph Placeholder
      </div>

      <div className="flex gap-6 text-white/70 text-xs">
        <div>Active Orgs: <span className="text-white">0</span></div>
        <div>Active Members: <span className="text-white">0</span></div>
        <div>Active Merchants: <span className="text-white">0</span></div>
        <div>Transactions (24h): <span className="text-white">0</span></div>
      </div>
    </div>
  );
}
