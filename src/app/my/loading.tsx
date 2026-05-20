export default function MyLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting skeleton */}
      <div>
        <div className="h-7 w-48 bg-[#F0E8EB] rounded-lg" />
        <div className="h-4 w-36 bg-[#F5F0F2] rounded-lg mt-2" />
      </div>

      {/* Subscription card skeleton */}
      <div className="bg-white rounded-2xl border border-[#F0E8EB] p-6">
        <div className="h-5 w-28 bg-[#F0E8EB] rounded mb-4" />
        <div className="h-10 w-20 bg-[#F5F0F2] rounded mb-3" />
        <div className="h-2.5 w-full bg-[#F5F0F2] rounded-full" />
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="h-20 bg-white rounded-2xl border border-[#F0E8EB]" />
        <div className="h-20 bg-white rounded-2xl border border-[#F0E8EB]" />
        <div className="h-20 bg-white rounded-2xl border border-[#F0E8EB] col-span-2 lg:col-span-1" />
      </div>

      {/* Classes skeleton */}
      <div>
        <div className="h-5 w-32 bg-[#F0E8EB] rounded mb-4" />
        <div className="space-y-2.5">
          <div className="h-16 bg-white rounded-2xl border border-[#F0E8EB]" />
          <div className="h-16 bg-white rounded-2xl border border-[#F0E8EB]" />
        </div>
      </div>
    </div>
  );
}
