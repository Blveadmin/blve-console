export default function LeftNav() {
  return (
    <aside className="w-64 bg-[#05070A] border-r border-white/5 px-4 py-6 flex flex-col gap-6">
      <div className="text-sm font-semibold tracking-[0.2em] text-white/60">
        BLVE COMMAND CENTER
      </div>

      <nav className="flex-1 space-y-1 text-sm text-white/70">
        <div className="font-medium text-white">Dashboard</div>
        <div>Organizations</div>
        <div>Members</div>
        <div>Merchants</div>
        <div>Transactions</div>
        <div>Routing</div>
        <div>Settings / Logout</div>
      </nav>

      <div className="border-t border-white/10 pt-4 text-xs text-white/60">
        Admin • NCSF
      </div>
    </aside>
  );
}
