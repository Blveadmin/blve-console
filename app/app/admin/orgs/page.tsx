"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";

export default function OrgsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to load organizations.");
          return;
        }
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load organizations.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Organizations" subtitle="Manage and monitor the BLVΞ network hierarchy">
        <div className="flex items-center justify-center py-[var(--blv-2xl)]">
          <RefreshCw className="animate-spin text-[var(--blv-accent)]" size={40} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Organizations" subtitle="Manage and monitor the BLVΞ network hierarchy">
        <BLVCard>
          <div className="flex items-center gap-[var(--blv-lg)] text-red-400">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const orgs = data?.orgs || [];
  const summary = data?.summary || {};

  const totalsMetrics = [
    {
      label: "Total Organizations",
      value: orgs.length,
      icon: <Building2 size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Total Members",
      value: summary.total_members || 0,
      icon: <Users size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Network Routing Pool",
      value: `$${(summary.total_pool || 0).toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Active Nodes",
      value: orgs.filter((o: any) => o.org_type === "parent").length,
      icon: <ShieldCheck size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer 
      title="Organizations" 
      subtitle="Comprehensive view of all organizations and their hierarchies"
    >
      <div className="flex justify-between items-center">
        <div />
        <Link href="/admin/add-org">
          <button className="bg-blv-accent text-blv-bg px-[var(--blv-lg)] py-[var(--blv-md)] rounded-[var(--blv-radius-lg)] font-bold flex items-center gap-[var(--blv-md)] hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300">
            <Plus size={20} />
            Add Organization
          </button>
        </Link>
      </div>

      <BLVTotalsRow metrics={totalsMetrics} />
      
      <BLVSeparationLine />

      <div className="space-y-blv-lg">
        <BLVSectionHeader
          title="Network Hierarchy"
          subtitle="Drill down into specific organizations to view detailed performance"
          icon={<Building2 size={20} />}
        />
        
        <div className="grid grid-cols-1 gap-[var(--blv-md)]">
          {orgs.length === 0 ? (
            <BLVCard>
              <p className="text-[var(--blv-text-primary)]-secondary">No organizations found.</p>
            </BLVCard>
          ) : (
            orgs.map((org: any) => (
              <Link key={org.id} href={`/admin/orgs/${org.id}`}>
                <BLVCard hoverable className="group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[var(--blv-lg)]">
                      <div className="w-14 h-14 bg-[var(--blv-bg)] rounded-[var(--blv-radius-xl)] flex items-center justify-center text-[var(--blv-text-primary)]-tertiary group-hover:text-[var(--blv-accent)] transition-colors duration-300">
                        <Building2 size={28} />
                      </div>
                      <div>
                        <h3 className="text-[1.25rem] font-bold text-[var(--blv-text-primary)] group-hover:text-[var(--blv-accent)] transition-colors duration-300">
                          {org.name}
                        </h3>
                        <div className="flex items-center gap-[var(--blv-md)] mt-[var(--blv-xs)]">
                          <span className="text-[0.75rem] font-mono bg-[var(--blv-bg)] px-[var(--blv-sm)] py-0.5 rounded text-[var(--blv-text-primary)]-tertiary">
                            {org.slug}
                          </span>
                          <span className="text-[var(--blv-text-primary)]-tertiary text-[0.75rem] uppercase tracking-widest font-bold">
                            {org.org_type || "Organization"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-[var(--blv-2xl)]">
                      <div className="hidden md:block text-right">
                        <p className="text-[1.125rem] font-bold text-[var(--blv-text-primary)]">
                          {org.member_count || 0}
                        </p>
                        <p className="text-[0.75rem] text-[var(--blv-text-primary)]-tertiary uppercase font-bold tracking-tighter">Members</p>
                      </div>
                      
                      <div className="hidden lg:block text-right">
                        <p className="text-[1.125rem] font-bold text-[var(--blv-text-primary)]">
                          ${parseFloat(org.routing_pool || 0).toLocaleString()}
                        </p>
                        <p className="text-[0.75rem] text-[var(--blv-text-primary)]-tertiary uppercase font-bold tracking-tighter">Routing Pool</p>
                      </div>

                      <div className="hidden lg:block text-right">
                        <p className="text-[1.125rem] font-bold text-[var(--blv-text-primary)]">
                          {org.sub_org_count || 0}
                        </p>
                        <p className="text-[0.75rem] text-[var(--blv-text-primary)]-tertiary uppercase font-bold tracking-tighter">Sub-Orgs</p>
                      </div>
                      
                      <div className="text-[var(--blv-text-primary)]-tertiary group-hover:text-[var(--blv-accent)] transition-all duration-300 transform group-hover:translate-x-1">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </div>
                </BLVCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </BLVPageContainer>
  );
}
