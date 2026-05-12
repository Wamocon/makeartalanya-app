import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

type BookingRow = {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  preferred_language: "tr" | "en" | "ru" | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  message: string | null;
  created_at: string;
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export default async function AdminPage() {
  const admin = createAdminClient();

  if (!admin) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 sm:p-10">
        <div className="max-w-3xl mx-auto bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-3">Admin Dashboard Setup Required</h1>
          <p className="text-sm text-[var(--muted)] mb-4">
            To view booking requests, add these server environment variables in Vercel and local environment:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1 text-[var(--muted)]">
            <li>SUPABASE_SERVICE_ROLE_KEY</li>
            <li>ADMIN_DASHBOARD_USER</li>
            <li>ADMIN_DASHBOARD_PASSWORD</li>
          </ul>
          <p className="text-sm text-[var(--muted)] mt-4">
            After adding variables, redeploy and open this page again.
          </p>
          <Link href="/" className="inline-block mt-6 text-sm text-[var(--pink-dark)] hover:underline">
            ← Back to landing page
          </Link>
        </div>
      </main>
    );
  }

  const { data, error } = await admin
    .from("bookings")
    .select("id, guest_name, guest_email, guest_phone, preferred_language, status, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const bookings = (data || []) as BookingRow[];

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const totalCount = bookings.length;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Make Art Studio Admin</h1>
            <p className="text-sm text-[var(--muted)]">Booking requests overview</p>
          </div>
          <Link href="/" className="text-sm text-[var(--pink-dark)] hover:underline">
            Open Landing Page
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-[var(--border)] rounded-xl p-4">
            <div className="text-xs uppercase text-[var(--muted)]">Total</div>
            <div className="text-2xl font-bold mt-1">{totalCount}</div>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-xl p-4">
            <div className="text-xs uppercase text-[var(--muted)]">Pending</div>
            <div className="text-2xl font-bold mt-1 text-amber-600">{pendingCount}</div>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-xl p-4">
            <div className="text-xs uppercase text-[var(--muted)]">Confirmed</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{confirmedCount}</div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            Error loading bookings: {error.message}
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--pink-light)] text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Language</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-[var(--border)] align-top">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(booking.created_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{booking.guest_name || "-"}</td>
                      <td className="px-4 py-3">
                        <div>{booking.guest_email || "-"}</div>
                        <div className="text-[var(--muted)]">{booking.guest_phone || "-"}</div>
                      </td>
                      <td className="px-4 py-3 uppercase">{booking.preferred_language || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-[var(--blue-light)]">
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[340px] whitespace-pre-wrap break-words text-[var(--muted)]">
                        {booking.message || "-"}
                      </td>
                    </tr>
                  ))}

                  {bookings.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-[var(--muted)]" colSpan={6}>
                        No booking requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
