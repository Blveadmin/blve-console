export default function TopHeader() {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-8">
      <div>
        <h1 className="text-lg font-semibold">BLVE Command Center</h1>
        <p className="text-xs text-white/50">
          Real-time intelligence across the BLVE network
        </p>
      </div>
      <div className="text-xs text-white/50">
        Environment: <span className="text-white">Sandbox</span>
      </div>
    </header>
  );
}
