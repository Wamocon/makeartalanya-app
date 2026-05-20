import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Make Art Studio Alanya",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--pink-dark)] hover:underline mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to homepage
        </Link>
        
        <div className="bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-[var(--muted)] mb-6">Last updated: 12 May 2026</p>

          <section className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
            <p>
              This page explains how Make Art Studio Alanya processes personal data from website visitors and booking requests.
            </p>
            <p>
              We process the following data when you send a booking request: name, email address, phone number, preferred language,
              selected package information, and optional message text.
            </p>
            <p>
              The purpose of processing is to contact you about your request, manage booking communication, and provide our art class services.
            </p>
            <p>
              Your data is stored in Supabase (EU infrastructure where available) and is only accessible to authorized personnel.
            </p>
            <p>
              You can request access, correction, or deletion of your personal data by contacting us via the contact details in the imprint.
            </p>
            <p className="font-semibold text-[var(--foreground)]">
              Note: This template must be reviewed and finalized with legal counsel for your exact business and jurisdiction.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
