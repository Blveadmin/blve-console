import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import LoginClient from "./LoginClient";
import { redirect } from "next/navigation";
import {
  BLVPageContainer,
  BLVCard,
  BLVSeparationLine,
} from "@/components/blve";
import { ShieldCheck, Zap } from "lucide-react";

export default async function LoginPage() {
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

  // ⭐ If user is logged in → redirect to /admin
  if (user) {
    redirect("/admin");
  }

  return (
    <BLVPageContainer 
      title="Login" 
      subtitle="Access your BLVΞ Console account"
    >
      <div className="max-w-md mx-auto py-12 md:py-20 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest border border-gray-100">
            <ShieldCheck size={14} className="text-black" />
            Secure Access
          </div>
          <h1 className="text-4xl font-black text-black tracking-tighter">
            WELCOME BACK
          </h1>
          <p className="text-gray-500 font-medium">
            Sign in to manage your organizations and monitor network performance.
          </p>
        </div>

        <BLVCard className="p-8 space-y-6 shadow-xl shadow-black/5">
          <LoginClient />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Secure Login</span>
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </BLVCard>

        <div className="text-center">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
            © 2026 BLVΞ Network
          </p>
        </div>
      </div>
    </BLVPageContainer>
  );
}
