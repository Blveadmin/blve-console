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
        <div className="flex items-center justify-center py-[var(--blv-2xl)]">
          <RefreshCw className="animate-spin text-[var(--blv-accent)]" size={40} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Merchants" subtitle="Manage and monitor merchant network participants">
        <BLVCard>
          <div className="flex items-center gap-[var(--blv-lg)] text-red-400">
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
      trend: { value: 0, direction: "up" },
    },
    {
      label: "Active Terminals",
      value: merchants.length * 2,
      icon: <Building2 size={24} />,
      trend: { value: 0, direction: "up" },
    },
    {
      label: "Network Coverage",
      value: "94%",
      trend: { value: 2.4, direction: "up" },
      icon: <MapPin size={24} />,
    },
    {
      label: "Avg Transaction",
      value: "$42.50",
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" },
    },
  ];

  return (
    <BLVPageContainer 
      title="Merchants" 
      subtitle="Comprehensive view of all merchant network participants and their performance"
    >
      <div className="flex justify-between items-center gap-[var(--blv-lg)]">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-blv-md top-1/2 transform -translate-y-1/2 text-[var(--blv-text-primary)]-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Search merchants by name or location..." 
            className="w-full bg-[var(--blv-bg)]-secondary border border-[var(--blv-border)] rounded-[var(--blv-radius-lg)] pl-[var(--blv-xl)] pr-[var(--blv-lg)] py-[var(--blv-md)] text-[var(--blv-text-primary)] placeholder-blv-text-tertiary focus:outline-none focus:border-blv-accent transition-all duration-200"
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--blv-lg)]">
          {merchants.length === 0 ? (
            <BLVCard>
              <p className="text-[var(--blv-text-primary)]-secondary">No merchants found.</p>
            </BLVCard>
          ) : (
            merchants.map((merchant: any) => (
              <Link key={merchant.id} href={`/admin/merchants/${merchant.id}`}>
                <BLVCard hoverable className="group h-full flex flex-col justify-between">
                  <div className="space-y-blv-lg">
                    <div className="flex items-center gap-[var(--blv-lg)]">
                      <div className="w-12 h-12 bg-[var(--blv-bg)] rounded-[var(--blv-radius-xl)] flex items-center justify-center text-[var(--blv-text-primary)]-tertiary group-hover:text-[var(--blv-accent)] transition-colors duration-300">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h3 className="text-[1.125rem] font-bold text-[var(--blv-text-primary)] group-hover:text-[var(--blv-accent)] transition-colors duration-300">
                          {merchant.name}
                        </h3>
                        <p className="text-[0.75rem] text-[var(--blv-text-primary)]-tertiary font-mono mt-[var(--blv-xs)]">
                          {merchant.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-[var(--blv-md)] pt-blv-md">
                      <div className="flex items-center gap-[var(--blv-xs)] text-[0.75rem] text-[var(--blv-text-primary)]-tertiary font-medium uppercase tracking-wider">
                        <Tag size={12} />
                        Retail
                      </div>
                      <div className="flex items-center gap-[var(--blv-xs)] text-[0.75rem] text-[var(--blv-text-primary)]-tertiary font-medium uppercase tracking-wider">
                        <MapPin size={12} />
                        Miami, FL
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-[var(--blv-xl)] pt-blv-lg border-t border-[var(--blv-border)] flex items-center justify-between group-hover:border-blv-accent transition-colors duration-300">
                    <span className="text-[0.75rem] text-[var(--blv-text-primary)]-tertiary font-bold uppercase tracking-tighter">
                      View Details
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-[var(--blv-text-primary)]-tertiary group-hover:text-[var(--blv-accent)] transform group-hover:translate-x-1 transition-all duration-300"
                    />
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
