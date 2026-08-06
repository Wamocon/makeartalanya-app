-- 0026 — Track the thumbnail object as well as the main one
--
-- An uploaded item is two objects in the bucket, not one: the asset (1800px
-- WebP, or the video file) and the rail tile (720px WebP, or the video's poster
-- frame). 0024 only recorded storage_path, so deleting an item removed the asset
-- and silently stranded its tile in the bucket for ever.
--
-- Deriving the tile's key from the asset's was the tempting fix and the wrong
-- one: the two keys are independent uuids issued by separate signed-URL calls,
-- and a rule that reconstructs one from the other quietly rots the first time
-- that changes. Storing it is one column and no assumptions.

ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS thumb_storage_path text;

-- Only storage-backed rows have a tile to track. A bundled row's thumbnail is
-- committed to the repo under public/gallery/ and is not ours to delete.
ALTER TABLE public.gallery_items
  DROP CONSTRAINT IF EXISTS gallery_items_thumb_storage;
ALTER TABLE public.gallery_items
  ADD CONSTRAINT gallery_items_thumb_storage CHECK (
    thumb_storage_path IS NULL OR storage_path IS NOT NULL
  );

COMMENT ON COLUMN public.gallery_items.thumb_storage_path IS
  'Bucket key of the rail tile / video poster. NULL for bundled rows. Deleted alongside storage_path.';
