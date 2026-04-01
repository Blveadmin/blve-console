"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVSparkline,
} from "@/components/blve";
import {
  Users,
  Building2,
  ChevronRight,
  Mail,
  Calendar,
  RefreshCw,
  AlertCircle,
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

const SPARK_MEMBERS = [10, 18, 22, 30, 28, 36, 40, 48, 52, 60];
const SPARK_ORGS    = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6];

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

  if (loading) {
    return (
      <BLVPageContainer title="Members" subtitle="Manage and monitor all members in the BLVΞ network">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin text-[#3B82F6]" size={36} />
        </div>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Members" subtitle="Manage and monitor all members in the BLVΞ network">
        <BLVCard>
          <div className="flex items-center gap-4 text-[#F87171]">
            <AlertCircle size={22} />
            <p className="text-sm">{error}</p>
          </div>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const members = data?.members || [];
  const orgs    = data?.orgs || [];

  const totalsMetrics = [
    {
      label: "Total Members",
      value: members.length,
      icon: <Users size={22} />,
      trend: { value: 5.3, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_MEMBERS} color="#4ADE80" />,
    },
    {
      label: "Active Organizations",
      value: orgs.length,
      icon: <Building2 size={22} />,
      trend: { value: 0, direction: "up" as const },
      sparkline: <BLVSparkline data={SPARK_ORGS} color="#A78BFA" />,
    },
  ];

  return (
    <BLVPageContainer
      title="Members"
      subtitle="Manage and monitor all members in the BLVΞ network"
    >
      {/* KPI Row */}
      <BLVTotalsRow metrics={totalsMetrics} />

      <BLVSeparationLine />

      {/* Members List */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="All Members"
          subtitle={`${members.length} member${members.length !== 1 ? "s" : ""} registered`}
          icon={<Users size={20} />}
        />

        {members.length === 0 ? (
          <BLVCard>
            <p className="text-sm text-[rgba(255,255,255,0.60)]">No members found.</p>
          </BLVCard>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const org = orgs.find((o) => o.id === member.org_id);
              const joinedDate = new Date(member.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <Link key={member.id} href={`/admin/members/${member.id}`}>
                  <BLVCard hoverable className="group">
                    <div className="flex items-center justify-between">
                      {/* Left: avatar + info */}
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-[#0B0E11] rounded-xl flex items-center justify-center text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] transition-colors duration-200 flex-shrink-0">
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white group-hover:text-[#3B82F6] transition-colors duration-200">
                            {member.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)] font-medium">
                              <Mail size={11} />
                              {member.email}
                            </div>
                            <span className="text-[rgba(255,255,255,0.20)]">·</span>
                            <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.35)] font-medium">
                              <Calendar size={11} />
                              Joined {joinedDate}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: org + chevron */}
                      <div className="flex items-center gap-8">
                        <div className="hidden md:block text-right">
                          <p className="text-sm font-semibold text-white">
                            {org ? org.name : "No Organization"}
                          </p>
                          <p className="text-xs text-[rgba(255,255,255,0.35)] font-medium uppercase tracking-wider">
                            Organization
                          </p>
                        </div>
                        <ChevronRight
                          size={20}
                          className="text-[rgba(255,255,255,0.35)] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all duration-200"
                        />
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
