"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BLVPageContainer,
  BLVSectionHeader,
  BLVCard,
  BLVSeparationLine,
} from "@/components/blve";
import {
  Calendar,
  Building2,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Event = {
  id: string;
  name: string;
  org_id: string;
  date: string;
  status: string;
};

type Org = {
  id: string;
  name: string;
};

type OrgDashboardResponse = {
  orgs?: Org[];
  events?: Event[];
  error?: string;
};

export default function EventsListPage() {
  const [data, setData] = useState<OrgDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard");
        const json = (await res.json()) as OrgDashboardResponse;

        if (!res.ok) {
          setError(json.error || "Failed to load events data.");
          return;
        }

        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load events data.");
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
      <BLVPageContainer title="Events">
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
      <BLVPageContainer title="Events">
        <BLVCard>
          <p className="text-gray-600">Loading events data…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const events = data.events || [];
  const orgs = data.orgs || [];

  return (
    <BLVPageContainer 
      title="Events" 
      subtitle="Manage and monitor network-wide events and activities"
    >
      <div className="space-y-6">
        <BLVSectionHeader
          title="All Events"
          subtitle={`${events.length} event${events.length !== 1 ? "s" : ""} currently scheduled`}
          icon={<Calendar size={20} />}
        />
        
        <BLVCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Event Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Organization</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No events found in the network.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => {
                    const org = orgs.find((o: any) => o.id === ev.org_id);
                    const date = ev.date ? new Date(ev.date) : null;
                    const formatted_date = date ? date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }) : "—";

                    return (
                      <tr key={ev.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {ev.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {org ? (
                            <Link
                              href={`/admin/orgs/${org.id}`}
                              className="inline-flex items-center gap-2 hover:text-black transition-colors"
                            >
                              <Building2 size={14} className="text-gray-400" />
                              {org.name}
                            </Link>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            {formatted_date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              ev.status === "active"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : "bg-gray-50 text-gray-500 border border-gray-100"
                            }`}
                          >
                            {ev.status === "active" ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {ev.status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/events/${ev.id}`}
                            className="inline-flex items-center gap-1 text-sm font-bold text-gray-400 group-hover:text-black transition-colors"
                          >
                            View <ChevronRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </BLVCard>
      </div>
    </BLVPageContainer>
  );
}
