-- 0025 — Single-statement reorder for a gallery category
--
-- The admin grid fires a reorder on every drop, sending the category's full id
-- list. Applying that as one UPDATE joined against the array keeps it atomic:
-- the order is either entirely the one the admin sees or entirely unchanged.
-- Issuing ~70 separate UPDATEs instead would be 70 round-trips from a
-- serverless function and could leave the rail half-sorted if one failed.
--
-- WITH ORDINALITY is what makes it a single statement — it turns the array into
-- (id, index) pairs, so position falls straight out of the caller's ordering
-- rather than needing a counter maintained in application code.

CREATE OR REPLACE FUNCTION public.fn_gallery_reorder(p_category text, p_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  n integer;
BEGIN
  UPDATE public.gallery_items g
     SET position = o.ord
    FROM unnest(p_ids) WITH ORDINALITY AS o(id, ord)
   WHERE g.id = o.id
     AND g.category = p_category;

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

-- Deliberately NOT security definer, and not callable by the app's public keys.
-- Reordering goes through /api/admin/gallery/reorder, which checks requireAdmin
-- and then talks to the database with the service role. A definer function
-- reachable from the browser would hand anonymous visitors a write path into a
-- table whose whole RLS story is "reads only".
REVOKE ALL ON FUNCTION public.fn_gallery_reorder(text, uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_gallery_reorder(text, uuid[]) FROM anon;
REVOKE ALL ON FUNCTION public.fn_gallery_reorder(text, uuid[]) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.fn_gallery_reorder(text, uuid[]) TO service_role;

COMMENT ON FUNCTION public.fn_gallery_reorder(text, uuid[]) IS
  'Rewrites gallery_items.position to 1..n for the given ids within one category. Returns rows updated.';
