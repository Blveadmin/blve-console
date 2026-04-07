import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import {
  BLVPageContainer,
  BLVCard,
  BLVSectionHeader,
  BLVSeparationLine,
} from "@/components/blve";
import { 
  Users, 
  Building2, 
  Store, 
  ChevronRight, 
  ShieldCheck 
} from "lucide-react";

export default async function SelectRolePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase
    .from("members")
    .select("role_member, role_org_owner, role_merchant_owner")
    .eq("id", user.id)
    .single();

  if (!roles) redirect("/login");

  // Auto-redirect if only one role
  const trueRoles = Object.entries(roles).filter(([_, v]) => v === true);

  if (trueRoles.length === 1) {
    const role = trueRoles[0][0];

    if (role === "role_member") redirect("/member");
    if (role === "role_org_owner") redirect("/org");
    if (role === "role_merchant_owner") redirect("/merchant");
  }

  // Otherwise show role selector
  return (
    <BLVPageContainer 
      title="Select Role" 
      subtitle="Choose the dashboard you want to access"
    >
      <div className="max-w-2xl mx-auto py-12 md:py-20 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest border border-gray-100">
            <ShieldCheck size={14} className="text-black" />
            Identity Verified
          </div>
          <h1 className="text-4xl font-black text-black tracking-tighter">
            CHOOSE YOUR <span className="text-gray-400">DASHBOARD</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Your account has multiple roles. Please select which portal you would like to enter.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {roles.role_member && (
            <Link href="/member">
              <BLVCard className="p-6 hover:border-gray-300 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
                      <Users size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">Member Dashboard</h3>
                      <p className="text-sm text-gray-500 font-medium">Access your personal member profile and activity.</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-300 group-hover:text-black transition-colors" />
                </div>
              </BLVCard>
            </Link>
          )}

          {roles.role_org_owner && (
            <Link href="/org">
              <BLVCard className="p-6 hover:border-gray-300 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
                      <Building2 size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">Organization Console</h3>
                      <p className="text-sm text-gray-500 font-medium">Manage your organization, sub-orgs, and members.</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-300 group-hover:text-black transition-colors" />
                </div>
              </BLVCard>
            </Link>
          )}

          {roles.role_merchant_owner && (
            <Link href="/merchant">
              <BLVCard className="p-6 hover:border-gray-300 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
                      <Store size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">Merchant Portal</h3>
                      <p className="text-sm text-gray-500 font-medium">Monitor transactions and routing for your merchant account.</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-300 group-hover:text-black transition-colors" />
                </div>
              </BLVCard>
            </Link>
          )}
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
