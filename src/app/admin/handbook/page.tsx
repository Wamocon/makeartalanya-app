import InternalHandbookClient from "./HandbookClient";

export const metadata = {
  title: "Internal Operations Manual | Make Art Studio Admin",
  /* Staff-only document — keep it out of search results even though the admin
     gate in proxy.ts already blocks unauthenticated access. */
  robots: { index: false, follow: false },
};

export default function AdminHandbookPage() {
  return <InternalHandbookClient />;
}
