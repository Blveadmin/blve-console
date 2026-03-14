import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export default async function MembersPage() {
  // Auth check
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/admin/members")}`);
  }

  // Fetch members
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading members.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Members</h1>

      {(!members || members.length === 0) && (
        <p className="text-gray-600">No members found.</p>
      )}

      {members && members.length > 0 && (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Org</th>
              <th className="p-2 border">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-2 border">{m.name || "—"}</td>
                <td className="p-2 border">{m.email || "—"}</td>
                <td className="p-2 border">{m.org_id || "—"}</td>
                <td className="p-2 border">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

