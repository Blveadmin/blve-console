"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Building2, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle,
  MapPin,
  Tag,
  Search,
  TrendingUp
} from "lucide-react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";

export default function MerchantsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/merchants");
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || "Failed to load merchant data.");
          return;
        }
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load merchant data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Merchants" subtitle="Manage and monitor merchant network participants">
        <div className="flex items-center justify-center py-blv-2xl">
          <RefreshCw className="animate-spin text-blv-accent" size={40} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Merchants" subtitle="Manage and monitor merchant network participants">
        <BLVCard>
          <div className="flex items-center gap-blv-lg text-red-400">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const merchants = data?.merchants || [];
  
  const totalsMetrics = [
    {
      label: "Total Merchants",
      value: merchants.length,
      icon: <CreditCard size={24} />,
    },
    {
      label: "Active Terminals",
      value: merchants.length * 2, // Placeholder for narrative
      icon: <Building2 size={24} />,
    },
    {
      label: "Network Coverage",
      value: "94%", // Placeholder for narrative
      trend: { value: 2.4, direction: "up" },
      icon: <MapPin size={24} />,
    },
    {
      label: "Avg Transaction",
      value: "$42.50", // Placeholder for narrative
      icon: <TrendingUp size={24} />,
    },
  ];

  return (
    <BLVPageContainer 
      title="Merchants" 
      subtitle="Comprehensive view of all merchant network participants and their performance"
    >
      <div className="flex justify-between items-center gap-blv-lg">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-blv-md top-1/2 transform -translate-y-1/2 text-blv-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search merchants by name or location..." 
            className="w-full bg-blv-bg-secondary border border-blv-border rounded-blv-lg pl-blv-xl pr-blv-lg py-blv-md text-blv-text placeholder-blv-text-tertiary focus:outline-none focus:border-blv-accent transition-all duration-200"
          />
        </div>
      </div>

      <BLVTotalsRow metrics={totalsMetrics} />
      
      <BLVSeparationLine />

      <div className="space-y-blv-lg">
        <BLVSectionHeader
          title="Merchant Directory"
          subtitle="Real-time list of all merchants participating in the BLVΞ network"
          icon={<CreditCard size={20} />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-blv-lg">
          {merchants.length === 0 ? (
            <BLVCard>
              <p className="text-blv-text-secondary">No merchants found.</p>
            </BLVCard>
          ) : (
            merchants.map((merchant: any) => (
              <Link key={merchant.id} href={`/admin/merchants/${merchant.id}`}>
                <BLVCard hoverable className="group h-full flex flex-col justify-between">
                  <div className="space-y-blv-lg">
                    <div className="flex items-center gap-blv-lg">
                      <div className="w-12 h-12 bg-blv-bg rounded-blv-xl flex items-center justify-center text-blv-text-tertiary group-hover:text-blv-accent transition-colors duration-300">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h3 className="text-blv-lg font-bold text-blv-text group-hover:text-blv-accent transition-colors duration-300">
                          {merchant.name}
                        </h3>
                        <p className="text-blv-xs text-blv-text-tertiary font-mono mt-blv-xs">{merchant.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-blv-md pt-blv-md">
                      <div className="flex items-center gap-blv-xs text-blv-xs text-blv-text-tertiary font-medium uppercase tracking-wider">
                        <Tag size={12} />
                        Retail
                      </div>
                      <div className="flex items-center gap-blv-xs text-blv-xs text-blv-text-tertiary font-medium uppercase tracking-wider">
                        <MapPin size={12} />
                        Miami, FL
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-blv-xl pt-blv-lg border-t border-blv-border flex items-center justify-between group-hover:border-blv-accent transition-colors duration-300">
                    <span className="text-blv-xs text-blv-text-tertiary font-bold uppercase tracking-tighter">View Details</span>
                    <ChevronRight size={18} className="text-blv-text-tertiary group-hover:text-blv-accent transform group-hover:translate-x-1 transition-all duration-300" />
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
