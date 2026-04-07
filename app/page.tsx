"use client";

import Link from "next/link";
import {
  BLVPageContainer,
  BLVCard,
  BLVSectionHeader,
  BLVSeparationLine,
} from "@/components/blve";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  LayoutDashboard 
} from "lucide-react";

export default function LandingPage() {
  return (
    <BLVPageContainer 
      title="BLVΞ Console" 
      subtitle="The next generation of transaction routing and organization management"
    >
      {/* HERO SECTION */}
      <div className="py-12 md:py-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest border border-gray-100">
          <Zap size={14} className="text-black" />
          Enterprise Ready
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none">
          MANAGE YOUR <br />
          <span className="text-gray-400">NETWORK</span> WITH EASE
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-500 font-medium leading-relaxed">
          BLVΞ provides a comprehensive suite of tools for organizations to manage members, 
          monitor transactions, and optimize routing pools in real-time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 text-base font-bold shadow-lg shadow-black/10"
          >
            Get Started <ArrowRight size={20} />
          </Link>
          <Link
            href="/admin"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black border-2 border-black rounded-xl hover:bg-gray-50 transition-all duration-200 text-base font-bold"
          >
            Admin Dashboard <LayoutDashboard size={20} />
          </Link>
        </div>
      </div>

      <BLVSeparationLine />

      {/* FEATURES SECTION */}
      <div className="space-y-12 py-12">
        <BLVSectionHeader
          title="Core Capabilities"
          subtitle="Everything you need to scale your organization"
          icon={<ShieldCheck size={20} />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BLVCard className="p-8 space-y-6 hover:border-gray-300 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
              <Building2 size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-black">Organization Hierarchy</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Manage complex parent-child organization structures with granular control over routing pools and permissions.
              </p>
            </div>
          </BLVCard>

          <BLVCard className="p-8 space-y-6 hover:border-gray-300 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
              <Users size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-black">Member Management</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Onboard and manage members across your entire network. Track activity and performance with detailed analytics.
              </p>
            </div>
          </BLVCard>

          <BLVCard className="p-8 space-y-6 hover:border-gray-300 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
              <TrendingUp size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-black">Real-time Analytics</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Monitor transaction volume, routing efficiency, and fee generation with our high-performance dashboard.
              </p>
            </div>
          </BLVCard>
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-12 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
          © 2026 BLVΞ Network. All rights reserved.
        </p>
      </div>
    </BLVPageContainer>
  );
}
