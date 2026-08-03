"use client";

import { useMemo, useState } from "react";
import {
  Search, ChevronDown, ChevronRight, Phone, Mail, Baby, Trash2,
  ShieldCheck, MessageSquare, Download,
} from "lucide-react";

export interface Registration {
  id: string;
  created_at: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  parent_relationship: string | null;
  child_name: string;
  child_birth_date: string | null;
  child_gender: string | null;
  child_health_notes: string | null;
  emergency_contact: string | null;
  // NULL only for registrations created before migration 0022.
  authorized_pickup: string | null;
  branch: string;
  package_id: string | null;
  preferred_language: string;
  message: string | null;
  status: "new" | "contacted" | "enrolled" | "archived";
  consent_kvkk: boolean;
  consent_liability: boolean;
  consent_media: boolean;
  consent_version: string;
  consented_at: string | null;
}

const STATUSES = ["new", "contacted", "enrolled", "archived"] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-[#DCA8B2]/10 text-[#B87A88] border-[#DCA8B2]/30",
  contacted: "bg-[#A9C7E5]/10 text-[#5A87AD] border-[#A9C7E5]/30",
  enrolled: "bg-[#6BBF7A]/10 text-[#4A9459] border-[#6BBF7A]/30",
  archived: "bg-[var(--muted)]/10 text-[var(--muted)] border-[var(--border)]",
};

const BRANCH_LABEL: Record<string, string> = {
  painting: "Painting",
  chess: "Chess",
  crafts: "Crafts",
  individual: "Individual",
};

function age(birthDate: string | null): string {
  if (!birthDate) return "—";
  const years = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  return Number.isFinite(years) ? `${years}y` : "—";
}

/** Digits only, so the wa.me link works regardless of how the number was typed. */
function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

export default function RegistrationsTable({
  registrations,
  initialStatus = "all",
}: {
  registrations: Registration[];
  /** Pre-selected filter, set by the ?status= the dashboard cards link with. */
  initialStatus?: string;
}) {
  const [rows, setRows] = useState(registrations);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.parent_name.toLowerCase().includes(q) ||
        r.child_name.toLowerCase().includes(q) ||
        r.parent_phone.toLowerCase().includes(q) ||
        (r.parent_email ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  async function updateStatus(id: string, status: string) {
    setBusy(id);
    setError(null);
    const previous = rows;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as Registration["status"] } : r)));

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRows(previous);
        setError(data.error || "Could not update status");
      }
    } catch {
      setRows(previous);
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string, childName: string) {
    if (!confirm(`Permanently delete the registration for ${childName}? This cannot be undone.`)) {
      return;
    }
    setBusy(id);
    setError(null);
    const previous = rows;
    setRows((prev) => prev.filter((r) => r.id !== id));

    try {
      const res = await fetch(`/api/admin/registrations?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRows(previous);
        setError(data.error || "Could not delete");
      }
    } catch {
      setRows(previous);
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  function exportCsv() {
    const header = [
      "created_at", "status", "branch", "parent_name", "parent_phone", "parent_email",
      "child_name", "child_birth_date", "preferred_language", "consent_version",
    ];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      header.join(","),
      ...filtered.map((r) =>
        [
          r.created_at, r.status, r.branch, r.parent_name, r.parent_phone, r.parent_email ?? "",
          r.child_name, r.child_birth_date ?? "", r.preferred_language, r.consent_version,
        ].map(escape).join(","),
      ),
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parent, child, phone…"
            className="pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[#DCA8B2]/30 focus:border-[#DCA8B2] w-60 transition-all placeholder:text-[var(--muted)]"
          />
        </div>

        <div className="flex gap-1">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-[var(--foreground)] text-white"
                  : "bg-white border border-[var(--border)] text-[var(--muted)] hover:border-[#DCA8B2]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border)] bg-white text-[var(--muted)] hover:border-[#DCA8B2] disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[var(--border)]">
          <Baby className="w-10 h-10 text-[var(--muted)]/30 mx-auto mb-3" />
          <p className="text-[var(--muted)] font-medium">
            {rows.length === 0 ? "No registrations yet" : "Nothing matches that filter"}
          </p>
          {rows.length === 0 && (
            <p className="text-xs text-[var(--muted)] mt-1">
              Submissions from /kayit will appear here.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const isOpen = expanded === r.id;
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-[var(--border)] overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                    className="p-1 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] shrink-0"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-[var(--foreground)]">{r.child_name}</span>
                      <span className="text-xs text-[var(--muted)]">({age(r.child_birth_date)})</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background)] text-[var(--muted)]">
                        {BRANCH_LABEL[r.branch] ?? r.branch}
                      </span>
                      <span className="text-xs uppercase text-[var(--muted)]">{r.preferred_language}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
                      {r.parent_name} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <a
                    href={waLink(r.parent_phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#6BBF7A]/10 text-[#4A9459] hover:bg-[#6BBF7A]/20 transition-colors shrink-0"
                  >
                    <Phone className="w-3 h-3" /> WhatsApp
                  </a>

                  <select
                    value={r.status}
                    disabled={busy === r.id}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className={`text-xs font-medium capitalize px-2 py-1.5 rounded-lg border cursor-pointer disabled:opacity-50 shrink-0 ${STATUS_STYLES[r.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {isOpen && (
                  <div className="border-t border-[var(--border)] bg-[var(--background)]/40 px-4 py-4 grid gap-4 sm:grid-cols-2 text-sm">
                    <Field label="Parent / guardian">
                      {r.parent_name}
                      {r.parent_relationship && (
                        <span className="text-[var(--muted)]"> · {r.parent_relationship}</span>
                      )}
                    </Field>
                    <Field label="Phone (WhatsApp)">
                      <a href={waLink(r.parent_phone)} target="_blank" rel="noopener noreferrer" className="text-[#B87A88] hover:underline">
                        {r.parent_phone}
                      </a>
                    </Field>
                    <Field label="Email">
                      {r.parent_email ? (
                        <a href={`mailto:${r.parent_email}`} className="text-[#B87A88] hover:underline inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {r.parent_email}
                        </a>
                      ) : "—"}
                    </Field>
                    <Field label="Emergency contact">{r.emergency_contact || "—"}</Field>
                    <Field label="Child">
                      {r.child_name}
                      {r.child_gender && <span className="text-[var(--muted)]"> · {r.child_gender}</span>}
                      {r.child_birth_date && (
                        <span className="text-[var(--muted)]"> · {new Date(r.child_birth_date).toLocaleDateString()}</span>
                      )}
                    </Field>
                    <Field label="Package interest">{r.package_id || "—"}</Field>

                    {/* Staff check this before releasing a child (agreement 3.5). */}
                    <div className="sm:col-span-2">
                      <Field label="Authorised to collect the child">
                        {r.authorized_pickup ? (
                          <span className="whitespace-pre-line">{r.authorized_pickup}</span>
                        ) : (
                          <span className="text-[var(--muted)]">— not recorded, ask the parent before release</span>
                        )}
                      </Field>
                    </div>

                    {r.child_health_notes && (
                      <div className="sm:col-span-2">
                        <Field label="Health notes">
                          <span className="text-[#B87A88]">{r.child_health_notes}</span>
                        </Field>
                      </div>
                    )}

                    {r.message && (
                      <div className="sm:col-span-2">
                        <Field label="Message">
                          <span className="inline-flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 mt-0.5 shrink-0 text-[var(--muted)]" />
                            {r.message}
                          </span>
                        </Field>
                      </div>
                    )}

                    <div className="sm:col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-[var(--border)]">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#6BBF7A]" />
                        KVKK {r.consent_kvkk ? "✓" : "✗"} · Liability {r.consent_liability ? "✓" : "✗"} · Media {r.consent_media ? "✓" : "✗"}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {r.consent_version}
                        {r.consented_at && ` · ${new Date(r.consented_at).toLocaleString()}`}
                      </span>
                      <button
                        onClick={() => remove(r.id, r.child_name)}
                        disabled={busy === r.id}
                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#E5686B] hover:bg-[#E5686B]/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-0.5">{label}</p>
      <p className="text-sm text-[var(--foreground)]">{children}</p>
    </div>
  );
}
