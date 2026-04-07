"use client";

import { useEffect, useState } from "react";
import {
  BLVPageContainer,
  BLVSectionHeader,
  BLVCard,
  BLVSeparationLine,
} from "@/components/blve";
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function MemberProfilePage() {
  const [member, setMember] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard");
        const json = await res.json();

        const members = json.members || [];
        const orgs = json.orgs || [];

        // Logged-in user ID from your API
        const currentUserId = json.user?.id;

        const m = members.find((mm: any) => mm.id === currentUserId);

        if (!m) {
          setError("Profile not found. Please ensure you are logged in.");
          return;
        }

        const o = orgs.find((oo: any) => oo.id === m.org_id) || null;

        setMember(m);
        setOrg(o);
      } catch (e) {
        console.error(e);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <BLVPageContainer title="Your Profile">
        <BLVCard className="p-12 flex flex-col items-center justify-center space-y-4">
          <RefreshCw size={40} className="text-gray-300 animate-spin" />
          <p className="text-gray-500 font-medium">Loading profile…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  if (error) {
    return (
      <BLVPageContainer title="Your Profile">
        <BLVCard className="p-12 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Error Loading Profile</h2>
            <p className="text-gray-500 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-bold"
          >
            Retry
          </button>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  return (
    <BLVPageContainer 
      title="Your Profile" 
      subtitle="Manage your personal information and account settings"
    >
      <div className="max-w-2xl space-y-12">
        {/* PROFILE INFO */}
        <div className="space-y-6">
          <BLVSectionHeader
            title="Personal Information"
            subtitle="Your identity within the BLVΞ network"
            icon={<User size={20} />}
          />
          
          <BLVCard className="p-8 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 border-2 border-gray-100">
                <User size={40} />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-black tracking-tighter uppercase">
                  {member.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-black" />
                  Verified Member
                </div>
              </div>
            </div>

            <BLVSeparationLine />

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Email Address</p>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-900 font-bold">{member.email}</span>
                </div>
              </div>

              {org && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Primary Organization</p>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Building2 size={18} className="text-gray-400" />
                    <span className="text-gray-900 font-bold">{org.name}</span>
                  </div>
                </div>
              )}
            </div>
          </BLVCard>
        </div>

        {/* ACCOUNT STATUS */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <ShieldCheck size={20} />
            Account Security
          </h3>
          <p className="text-gray-500 font-medium leading-relaxed">
            Your account is currently active and verified. To change your email or password, 
            please contact your organization administrator or the BLVΞ support team.
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
            © 2026 BLVΞ Network
          </p>
        </div>
      </div>
    </BLVPageContainer>
  );
}
