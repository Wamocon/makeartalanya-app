import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2327] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#9B8A8F]" />
          Settings
        </h1>
        <p className="text-sm text-[#9B8A8F] mt-1">Studio configuration and preferences</p>
      </div>

      <div className="grid gap-4">
        <div className="bg-white rounded-xl border border-[#F0E8EB] p-6">
          <h2 className="font-medium text-[#2D2327] mb-2">Studio Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[#F0E8EB]">
              <span className="text-[#9B8A8F]">Studio Name</span>
              <span className="text-[#2D2327] font-medium">Make Art Studio</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0E8EB]">
              <span className="text-[#9B8A8F]">Location</span>
              <span className="text-[#2D2327] font-medium">Alanya, Turkey</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0E8EB]">
              <span className="text-[#9B8A8F]">Timezone</span>
              <span className="text-[#2D2327] font-medium">Europe/Istanbul (UTC+3)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#9B8A8F]">Default Language</span>
              <span className="text-[#2D2327] font-medium">English</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#F0E8EB] p-6">
          <h2 className="font-medium text-[#2D2327] mb-2">Subscription Settings</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[#F0E8EB]">
              <span className="text-[#9B8A8F]">Default Validity</span>
              <span className="text-[#2D2327] font-medium">3 months</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0E8EB]">
              <span className="text-[#9B8A8F]">Max Freezes Per Sub</span>
              <span className="text-[#2D2327] font-medium">2</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#9B8A8F]">Accepted Currencies</span>
              <span className="text-[#2D2327] font-medium">EUR, TRY, USD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
