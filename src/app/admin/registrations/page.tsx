import { requireAdminPage } from "@/lib/auth-guard";
import { ClipboardList } from "lucide-react";
import RegistrationsTable, { type Registration } from "./RegistrationsTable";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const { admin } = await requireAdminPage();

  const { data, error } = await admin
    .from("registrations")
    .select(
      `id, created_at, parent_name, parent_phone, parent_email, parent_relationship,
       child_name, child_birth_date, child_gender, child_health_notes, emergency_contact,
       branch, package_id, preferred_language, message, status,
       consent_kvkk, consent_liability, consent_media, consent_version, consented_at`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const registrations = (data ?? []) as Registration[];

  const counts = {
    total: registrations.length,
    new: registrations.filter((r) => r.status === "new").length,
    contacted: registrations.filter((r) => r.status === "contacted").length,
    enrolled: registrations.filter((r) => r.status === "enrolled").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-[#DCA8B2]" />
          Registrations
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Submissions from the public form at <code className="text-xs">/kayit</code>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, color: "var(--foreground)" },
          { label: "New", value: counts.new, color: "#DCA8B2" },
          { label: "Contacted", value: counts.contacted, color: "#A9C7E5" },
          { label: "Enrolled", value: counts.enrolled, color: "#6BBF7A" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[var(--border)] p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[var(--muted)]">{s.label}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-sm">
          Error loading registrations: {error.message}
        </div>
      ) : (
        <RegistrationsTable registrations={registrations} />
      )}
    </div>
  );
}
