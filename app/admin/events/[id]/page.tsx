"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";
import {
  Calendar,
  Building2,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  TrendingUp,
  ArrowRight,
  History,
} from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  routing_amount: number;
  timestamp: string;
  event_id?: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  org_id: string;
};

type Event = {
  id: string;
  name: string;
  org_id: string;
  date: string;
  status: string;
  attendance?: string[];
};

type Org = {
  id: string;
  name: string;
};

type OrgDashboardResponse = {
  orgs?: Org[];
  events?: Event[];
  members?: Member[];
  transactions?: Transaction[];
  error?: string;
};

export default function EventDetailPage() {
  const params = useParams() as { id: string };
  const eventId = params.id;

  const [event, setEvent] = useState<Event | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [attendance, setAttendance] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org-dashboard");
        const json = (await res.json()) as OrgDashboardResponse;

        if (!res.ok) {
          setError(json.error || "Failed to load event data.");
          return;
        }

        const events = json.events || [];
        const orgs = json.orgs || [];
        const txs = json.transactions || [];
        const members = json.members || [];

        const ev = events.find((e: any) => e.id === eventId);
        if (!ev) {
          setError("Event not found");
          return;
        }

        const o = orgs.find((oo: any) => oo.id === ev.org_id) || null;
        const attendingMembers = members.filter((m: any) =>
          (ev.attendance || []).includes(m.id)
        );
        const eventTx = txs.filter((t: any) => t.event_id === eventId);

        setEvent(ev);
        setOrg(o);
        setAttendance(attendingMembers);
        setTransactions(eventTx);
      } catch (e) {
        console.error(e);
        setError("Failed to load event data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [eventId]);

  // ─────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <BLVPageContainer title="Event Details">
        <BLVCard>
          <p className="text-red-700 font-medium">{error}</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────
  if (loading || !event) {
    return (
      <BLVPageContainer title="Event Details">
        <BLVCard className="p-12 flex flex-col items-center justify-center space-y-4">
          <Clock size={40} className="text-gray-300 animate-spin" />
          <p className="text-gray-500 font-medium">Loading event details…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  const totalRouting = transactions.reduce((sum, t) => sum + (t.routing_amount || 0), 0);
  const totalTx = transactions.length;
  const avgTx = totalTx > 0 ? transactions.reduce((s, t) => s + t.amount, 0) / totalTx : 0;

  // ─────────────────────────────────────────────────────────────────
  // TOTALS ROW METRICS
  // ─────────────────────────────────────────────────────────────────
  const totalsMetrics = [
    {
      label: "Total Transactions",
      value: totalTx,
      icon: <ArrowRight size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Avg Transaction",
      value: `$${avgTx.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Routing Impact",
      value: `$${totalRouting.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <History size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];

  return (
    <BLVPageContainer 
      title={event.name} 
      subtitle="Detailed event performance and attendance"
    >
      {/* TOTALS ROW */}
      <BLVTotalsRow metrics={totalsMetrics} />

      {/* SEPARATION LINE */}
      <BLVSeparationLine />

      {/* EVENT INFO & ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BLVCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Event Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-gray-900 font-medium">
                {event.date ? new Date(event.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }) : "No date set"}
              </span>
            </div>
            {org && (
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-gray-400" />
                <Link href={`/admin/orgs/${org.id}`} className="text-gray-900 font-medium hover:underline">
                  {org.name}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  event.status === "active"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-gray-50 text-gray-500 border border-gray-100"
                }`}
              >
                {event.status === "active" ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <AlertCircle size={12} />
                )}
                {event.status || "pending"}
              </span>
            </div>
          </div>
        </BLVCard>
        
        <div className="flex flex-col justify-center gap-4">
          <Link
            href="/admin/events"
            className="flex items-center justify-between px-6 py-4 bg-white text-black border-2 border-black rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold"
          >
            <div className="flex items-center gap-3">
              <Calendar size={20} />
              Back to All Events
            </div>
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>

      {/* ATTENDANCE */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Attendance"
          subtitle={`${attendance.length} member${attendance.length !== 1 ? "s" : ""} attended this event`}
          icon={<Users size={20} />}
        />
        
        <BLVCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No attendees recorded for this event.
                    </td>
                  </tr>
                ) : (
                  attendance.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {m.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {m.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="inline-flex items-center gap-1 text-sm font-bold text-gray-400 group-hover:text-black transition-colors"
                        >
                          View Profile <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </BLVCard>
      </div>

      {/* TRANSACTIONS */}
      <div className="space-y-6">
        <BLVSectionHeader
          title="Event Transactions"
          subtitle="Latest transactions associated with this event"
          icon={<History size={20} />}
        />
        
        <BLVCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Routing</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No transactions recorded for this event.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const date = new Date(t.timestamp);
                    const formatted_timestamp = date.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          ${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${t.routing_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatted_timestamp}
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
