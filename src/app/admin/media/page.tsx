"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type UploadedFile = { url: string; filename: string; bucket: string };

function UploadZone({
  bucket,
  label,
  accept,
  uploaded,
  onUploaded,
}: {
  bucket: string;
  label: string;
  accept: string;
  uploaded: UploadedFile[];
  onUploaded: (f: UploadedFile) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", bucket);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      onUploaded({ url: json.url, filename: json.filename, bucket });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{label}</h2>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? "border-[var(--pink-dark)] bg-[var(--pink-light)]" : "border-[var(--border)] bg-white hover:border-[var(--pink-dark)]"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={bucket === "gallery"}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">{uploading ? (
          <svg className="w-8 h-8 animate-spin text-[var(--pink)]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
        ) : (
          <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        )}</div>
        <p className="text-sm font-medium text-[var(--foreground)]">
          {uploading ? "Uploading…" : "Click or drag & drop"}
        </p>
        <p className="text-xs text-[var(--muted)] mt-1">JPEG, PNG, WebP - max 10 MB</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</div>
      )}

      {/* Uploaded previews */}
      {uploaded.length > 0 && (
        <div className={bucket === "gallery" ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "flex gap-4"}>
          {uploaded.map((f) => (
            <div key={f.filename} className="relative group rounded-xl overflow-hidden border border-[var(--border)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.filename} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-white text-[var(--foreground)] px-3 py-1 rounded-full font-medium hover:bg-[var(--pink-light)]"
                >
                  Open
                </a>
                <DeleteButton filename={f.filename} bucket={f.bucket} />
              </div>
            </div>
          ))}
        </div>
      )}

      {uploaded.length === 0 && (
        <p className="text-xs text-[var(--muted)] text-center">No images uploaded yet in this session.</p>
      )}
    </div>
  );
}

function DeleteButton({ filename, bucket }: { filename: string; bucket: string }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this image?")) return;
    setDeleting(true);
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, bucket }),
    });
    setDeleting(false);
    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs bg-red-500 text-white px-3 py-1 rounded-full font-medium hover:bg-red-600 disabled:opacity-50"
    >
      {deleting ? "…" : "Delete"}
    </button>
  );
}

export default function AdminMediaPage() {
  const [galleryUploads, setGalleryUploads] = useState<UploadedFile[]>([]);
  const [photoUploads, setPhotoUploads] = useState<UploadedFile[]>([]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30 text-[var(--foreground)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Media Upload</h1>
            <p className="text-xs text-[var(--muted)]">Gallery images and instructor photo</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] bg-white border border-[var(--border)] px-3.5 py-2 rounded-xl transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Bookings
            </Link>
            <Link href="/admin/content" className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] bg-white border border-[var(--border)] px-3.5 py-2 rounded-xl transition-all">
              Content
            </Link>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm">
          <UploadZone
            bucket="gallery"
            label="Gallery Images (Student Artwork)"
            accept="image/jpeg,image/png,image/webp"
            uploaded={galleryUploads}
            onUploaded={(f) => setGalleryUploads((prev) => [f, ...prev])}
          />
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm">
          <UploadZone
            bucket="instructor"
            label="Instructor Photo"
            accept="image/jpeg,image/png,image/webp"
            uploaded={photoUploads}
            onUploaded={(f) => setPhotoUploads((prev) => [f, ...prev])}
          />
        </div>

        <div className="bg-white/60 border border-blue-100 rounded-2xl p-5 text-sm text-[var(--foreground)] space-y-1.5">
          <p className="font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            How it works
          </p>
          <p className="text-xs text-[var(--muted)]">Images are uploaded to <strong>Supabase Storage</strong> and immediately publicly accessible.</p>
          <p className="text-xs text-[var(--muted)]">Gallery images will automatically appear on the website. The instructor photo replaces the default placeholder.</p>
        </div>
      </div>
    </main>
  );
}
