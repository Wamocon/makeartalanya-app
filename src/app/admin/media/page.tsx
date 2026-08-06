import { requireAdminPage } from "@/lib/auth-guard";
import { GalleryManager } from "@/components/admin/gallery/GalleryManager";
import {
  GALLERY_ROW_COLUMNS,
  rowToItem,
  type GalleryItemRow,
} from "@/lib/gallery/types";

/**
 * Gallery manager.
 *
 * Server-rendered with the full list already in hand: this replaced a client
 * page that uploaded into a Supabase bucket nothing on the site ever read, so
 * every upload landed in storage and was never seen again.
 *
 * requireAdminPage hands back a service-role client on purpose — an admin signed
 * in through the legacy admin_session cookie has no Supabase JWT, so is_admin()
 * is false for them and an RLS-scoped read returns hidden rows as if they did
 * not exist. Which is exactly the set this screen is for.
 */
export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const { admin } = await requireAdminPage();

  const { data, error } = await admin
    .from("gallery_items")
    .select(GALLERY_ROW_COLUMNS)
    .order("category", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-semibold text-red-800">The gallery could not be loaded.</p>
        <p className="mt-1 font-mono text-xs text-red-700">{error.message}</p>
      </div>
    );
  }

  const items = (data as GalleryItemRow[]).map(rowToItem);

  return <GalleryManager initialItems={items} />;
}
