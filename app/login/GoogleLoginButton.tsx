"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Chrome } from "lucide-react";

export default function GoogleLoginButton() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin() {
    console.log("LOGIN CLICKED");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) console.error(error);
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black border-2 border-black rounded-xl hover:bg-gray-50 transition-all duration-200 text-base font-bold shadow-sm"
    >
      <Chrome size={20} />
      Continue with Google
    </button>
  );
}
