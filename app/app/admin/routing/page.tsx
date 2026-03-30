"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Building2, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle,
  History,
  Users,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from "lucide-react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";

export default function RoutingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to load routing data.");
          return;
        }
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load routing data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Routing Engine" subtitle="Real-time monitor of the BLVΞ attribution engine">
        <div className="flex items-center justify-center py-blv-2xl">
          <RefreshCw className="animate-spin text-blv-accent" size={40} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Routing Engine" subtitle="Real-time monitor of the BLVΞ attribution engine">
        <BLVCard>
          <div className="flex items-center gap-blv-lg text-red-400">
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
      label: "Total Routed Amount",
      value: `$${(summary.total_routed || 0).toLocaleString()}`,
      icon: <TrendingUp size={24} />,
    },
    {
      label: "Network Routing Pool",
      value: `$${(summary.total_pool || 0).toLocaleString()}`,
      icon: <ShieldCheck size={24} />,
    },
    {
      label: "Avg Routing %",
      value: `${(summary.avg_routing_percentage || 0).toFixed(2)}%`,
      trend: { value: 1.2, direction: "up" },
      icon: <Activity size={24} />,
    },
    {
      label: "Active Nodes",
      value: orgs.length,
      icon: <Building2 size={24} />,
    },
  ];

  return (
    <BLVPageContainer 
      title="Routing Engine" 
      subtitle="Complete view of all routing events, attribution pools, and node performance"
    >
      <div className="flex justify-between items-center gap-blv-lg">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-blv-md top-1/2 transform -translate-y-1/2 text-blv-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search routing by node or organization..." 
            className="w-full bg-blv-bg-secondary border border-blv-border rounded-blv-lg pl-blv-xl pr-blv-lg py-blv-md text-blv-text placeholder-blv-text-tertiary focus:outline-none focus:border-blv-accent transition-all duration-200"
          />
        </div>
      </div>

      <BLVTotalsRow metrics={totalsMetrics} />
      
      <BLVSeparationLine />

      <div className="space-y-blv-lg">
        <BLVSectionHeader
          title="Node Performance"
          subtitle="Drill down into specific routing nodes to view attribution details"
          icon={<Building2 size={20} />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-blv-lg">
          {orgs.length === 0 ? (
            <BLVCard>
              <p className="text-blv-text-secondary">No routing nodes found.</p>
            </BLVCard>
          ) : (
            orgs.map((org: any) => (
              <Link key={org.id} href={`/admin/routing/${org.id}`}>
                <BLVCard hoverable className="group h-full flex flex-col justify-between">
                  <div className="space-y-blv-lg">
                    <div className="flex items-center gap-blv-lg">
                      <div className="w-12 h-12 bg-blv-bg rounded-blv-xl flex items-center justify-center text-blv-text-tertiary group-hover:text-blv-accent transition-colors duration-300">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-blv-lg font-bold text-blv-text group-hover:text-blv-accent transition-colors duration-300">
                          {org.name}
                        </h3>
                        <p className="text-blv-xs text-blv-text-tertiary font-mono mt-blv-xs">{org.slug}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-blv-md pt-blv-md">
                      <BLVMetric label="Routed" value={`$${(org.routed_sum || 0).toLocaleString()}`} size="sm" />
                      <BLVMetric label="Pool" value={`$${parseFloat(org.routing_pool || 0).toLocaleString()}`} size="sm" />
                    </div>
                  </div>
                  
                  <div className="mt-blv-xl pt-blv-lg border-t border-blv-border flex items-center justify-between group-hover:border-blv-accent transition-colors duration-300">
                    <span className="text-blv-xs text-blv-text-tertiary font-bold uppercase tracking-tighter">View Node Details</span>
                    <ChevronRight size={18} className="text-blv-text-tertiary group-hover:text-blv-accent transform group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </BLVCard>
              </Link>
            ))
          )}
        </div>
      </div>

      <BLVSeparationLine />

      <div className="space-y-blv-lg">
        <BLVSectionHeader
          title="Recent Routing Events"
          subtitle="Latest activity from the BLVΞ attribution engine"
          icon={<History size={20} />}
        />
        
        <BLVCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-blv-bg border-b border-blv-border">
                  <th className="px-blv-lg py-blv-md text-blv-xs font-bold text-blv-text-tertiary uppercase tracking-widest">Time</th>
                  <th className="px-blv-lg py-blv-md text-blv-xs font-bold text-blv-text-tertiary uppercase tracking-widest">Node</th>
                  <th className="px-blv-lg py-blv-md text-blv-xs font-bold text-blv-text-tertiary uppercase tracking-widest text-right">Amount</th>
                  <th className="px-blv-lg py-blv-md text-blv-xs font-bold text-blv-text-tertiary uppercase tracking-widest text-right">Attribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blv-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-blv-bg transition-colors duration-200">
                    <td className="px-blv-lg py-blv-lg">
                      <span className="text-blv-sm font-medium text-blv-text">14:2{i} PM</span>
                    </td>
                    <td className="px-blv-lg py-blv-lg">
                      <span className="text-blv-sm font-medium text-blv-text">{orgs[i % orgs.length]?.name || "Network Node"}</span>
                    </td>
                    <td className="px-blv-lg py-blv-lg text-right">
                      <span className="text-blv-sm font-bold text-blv-text">${(Math.random() * 500).toFixed(2)}</span>
                    </td>
                    <td className="px-blv-lg py-blv-lg text-right">
                      <span className="text-blv-sm font-bold text-blv-accent">${(Math.random() * 50).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BLVCard>
      </div>
    </BLVPageContainer>
  );
}
