"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function OrgConsole() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
    }
    checkAuth();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Organization Console</h1>
      <p className="mt-4">This is the BLVΞ org owner dashboard.</p>
    </div>
  );
}
