"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
} from "@/components/blve";
import {
  Users,
  Building2,
  ChevronRight,
  Mail,
  Calendar,
} from "lucide-react";

type Member = {
  id: string;
  name: string;
  email: string;
  org_id: string;
  created_at: string;
};

type Org = {
  id: string;
  name: string;
};

type OrgDashboardResponse = {
  members?: Member[];
  orgs?: Org[];
  error?: string;
};

export default function MembersListPage() {
  const [data, setData] = useState<OrgDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard");
        const json = (await res.json()) as OrgDashboardResponse;

        if (!res.ok) {
          setError(json.error || "Failed to load member data.");
          return;
        }

        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load member data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BLVPageContainer title="Members">
        <BLVCard>
          <p className="text-red-700 font-medium">{error}</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────
  if (loading || !data) {
    return (
      <BLVPageContainer title="Members">
        <BLVCard>
          <p className="text-gray-600">Loading members…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const members = data.members || [];
  const orgs = data.orgs || [];

  // ─────────────────────────────────────────────────────────────────
  // TOTALS ROW METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalsMetrics = [
    {
      label: "Total Members",
      value: members.length,
      icon: <Users size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Active Organizations",
      value: orgs.length,
      icon: <Building2 size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer 
      title="Members" 
      subtitle="Manage and monitor all members in the BLVΞ network"
    >
      {/* TOTALS ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      {/* SEPARATION LINE */}
      <BLVSeparationLine />

      {/* MEMBERS LIST */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="All Members"
          subtitle={`${members.length} member${members.length !== 1 ? "s" : ""} registered`}
          icon={<Users size={20} />}
        />
        
        {members.length === 0 ? (
          <BLVCard>
            <p className="text-gray-600">No members found.</p>
          </BLVCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {members.map((member) => {
              const org = orgs.find((o) => o.id === member.org_id);
              const joinedDate = new Date(member.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <Link key={member.id} href={`/admin/members/${member.id}`}>
                  <BLVCard className="hover:border-gray-300 transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
                          <Users size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                            {member.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                              <Mail size={12} />
                              {member.email}
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                              <Calendar size={12} />
                              Joined {joinedDate}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-12">
                        <div className="hidden md:block text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {org ? org.name : "No Organization"}
                          </p>
                          <p className="text-xs text-gray-500 font-medium uppercase">Organization</p>
                        </div>
                        
                        <div className="text-gray-300 group-hover:text-gray-900 transition-colors">
                          <ChevronRight size={24} />
                        </div>
                      </div>
                    </div>
                  </BLVCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </BLVPageContainer>
  );
}
