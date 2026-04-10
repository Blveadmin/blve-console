import LayoutShell from "@/components/blve-core/LayoutShell";
import HeroRow from "@/components/blve-core/HeroRow";

export default function AdminOverviewPage() {
  return (
    <LayoutShell>
      <div className="w-full flex flex-col gap-8">
        <HeroRow />
      </div>
    </LayoutShell>
  );
}

