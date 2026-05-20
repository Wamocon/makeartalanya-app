import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#FDF2F4] flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎨</span>
        </div>
        <h1 className="text-4xl font-bold text-[#2D2327] mb-2">404</h1>
        <p className="text-lg text-[#9B8A8F] mb-6">
          This page doesn&apos;t exist — maybe it was moved or the link is broken.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#DCA8B2] text-white text-sm font-medium rounded-xl hover:bg-[#B87A88] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/schedule"
            className="px-5 py-2.5 border border-[#F0E8EB] text-[#2D2327] text-sm font-medium rounded-xl hover:border-[#DCA8B2] transition-colors"
          >
            View Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
