"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Check } from "lucide-react";

interface SettingsMap {
  [key: string]: string | number | boolean;
}

const SETTING_LABELS: Record<string, { label: string; description: string; type: "text" | "number" | "toggle" }> = {
  cancellation_policy_hours: { label: "Cancellation Policy (hours)", description: "Hours before class to allow free cancellation", type: "number" },
  no_show_deducts_lesson: { label: "No-show Deducts Lesson", description: "Deduct a lesson credit when student doesn't show up", type: "toggle" },
  max_freeze_days: { label: "Max Freeze Days", description: "Maximum days a subscription can be frozen", type: "number" },
  waitlist_offer_hours: { label: "Waitlist Offer (hours)", description: "Hours to hold a waitlist spot before releasing", type: "number" },
  session_generation_weeks_ahead: { label: "Schedule Ahead (weeks)", description: "How many weeks ahead to auto-generate sessions", type: "number" },
  default_subscription_days: { label: "Default Subscription Length (days)", description: "Default validity period for new subscriptions", type: "number" },
  booking_opens_days_ahead: { label: "Booking Opens (days)", description: "How many days ahead clients can book classes", type: "number" },
  class_reminder_hours_before: { label: "Reminder Before Class (hours)", description: "Send reminder this many hours before class", type: "number" },
  sub_expiry_warning_days: { label: "Expiry Warning (days)", description: "Warn client this many days before subscription expires", type: "number" },
  sub_low_lessons_threshold: { label: "Low Lessons Warning", description: "Warn when remaining lessons drop to this number", type: "number" },
  studio_timezone: { label: "Studio Timezone", description: "Timezone for schedule calculations", type: "text" },
};

export default function SettingsClient() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveSetting(key: string, value: unknown) {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSaved(key);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#DCA8B2]" />
      </div>
    );
  }

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
          <h2 className="font-medium text-[#2D2327] mb-4">Studio Configuration</h2>
          <div className="space-y-4">
            {Object.entries(SETTING_LABELS).map(([key, meta]) => {
              const value = settings[key];
              const displayValue = typeof value === "string" ? value.replace(/^"|"$/g, "") : value;

              return (
                <div key={key} className="flex items-center justify-between py-3 border-b border-[#F0E8EB] last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#2D2327]">{meta.label}</p>
                    <p className="text-[11px] text-[#9B8A8F]">{meta.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {meta.type === "toggle" ? (
                      <button
                        onClick={() => {
                          const newVal = String(displayValue) !== "true";
                          setSettings({ ...settings, [key]: newVal });
                          saveSetting(key, newVal);
                        }}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          String(displayValue) === "true" ? "bg-[#DCA8B2]" : "bg-slate-200"
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          String(displayValue) === "true" ? "translate-x-5" : "translate-x-0.5"
                        }`} />
                      </button>
                    ) : (
                      <input
                        type={meta.type}
                        value={String(displayValue ?? "")}
                        onChange={(e) => setSettings({ ...settings, [key]: meta.type === "number" ? Number(e.target.value) : e.target.value })}
                        className="w-24 px-2 py-1.5 text-sm text-right border border-[#F0E8EB] rounded-lg focus:outline-none focus:border-[#DCA8B2]"
                      />
                    )}
                    {meta.type !== "toggle" && (
                      <button
                        onClick={() => saveSetting(key, settings[key])}
                        disabled={saving === key}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        {saving === key ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9B8A8F]" />
                        ) : saved === key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Save className="w-3.5 h-3.5 text-[#9B8A8F]" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
