"use client";

import { useState, useOptimistic, useActionState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Pencil, Trash2, Baby, Calendar } from "lucide-react";

interface Child {
  id: string;
  full_name: string;
  birth_date: string;
  notes: string | null;
}

export default function MyChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [loaded, setLoaded] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load children on first render
  if (!loaded) {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("children")
          .select("*")
          .eq("parent_id", user.id)
          .order("birth_date")
          .then(({ data }) => {
            if (data) setChildren(data);
            setLoaded(true);
          });
      }
    });
  }

  const [optimisticChildren, addOptimistic] = useOptimistic(
    children,
    (state: Child[], newChild: Child) => [...state, newChild]
  );

  async function handleSave(formData: FormData) {
    const fullName = formData.get("full_name") as string;
    const birthDate = formData.get("birth_date") as string;
    const notes = formData.get("notes") as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingChild) {
      const { data } = await supabase
        .from("children")
        .update({ full_name: fullName, birth_date: birthDate, notes: notes || null })
        .eq("id", editingChild.id)
        .select()
        .single();
      if (data) {
        setChildren((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      }
    } else {
      const tempChild: Child = {
        id: crypto.randomUUID(),
        full_name: fullName,
        birth_date: birthDate,
        notes: notes || null,
      };
      addOptimistic(tempChild);

      const { data } = await supabase
        .from("children")
        .insert({ parent_id: user.id, full_name: fullName, birth_date: birthDate, notes: notes || null })
        .select()
        .single();
      if (data) {
        setChildren((prev) => [...prev.filter((c) => c.id !== tempChild.id), data]);
      }
    }

    setShowForm(false);
    setEditingChild(null);
  }

  async function handleDelete(id: string) {
    setChildren((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("children").delete().eq("id", id);
  }

  function getAge(birthDate: string) {
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#2D2327]">Children</h1>
        <button
          onClick={() => { setShowForm(true); setEditingChild(null); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#DCA8B2] text-white text-sm font-medium hover:bg-[#B87A88] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Child
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          action={handleSave}
          className="bg-white rounded-xl border border-[#F0E8EB] p-4 space-y-3"
        >
          <div>
            <label className="text-xs font-medium text-[#9B8A8F]">Full Name</label>
            <input
              name="full_name"
              defaultValue={editingChild?.full_name || ""}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#F0E8EB] text-sm focus:outline-none focus:border-[#DCA8B2]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#9B8A8F]">Birth Date</label>
            <input
              name="birth_date"
              type="date"
              defaultValue={editingChild?.birth_date || ""}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#F0E8EB] text-sm focus:outline-none focus:border-[#DCA8B2]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#9B8A8F]">Notes (allergies, etc.)</label>
            <textarea
              name="notes"
              defaultValue={editingChild?.notes || ""}
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#F0E8EB] text-sm focus:outline-none focus:border-[#DCA8B2] resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#DCA8B2] text-white text-sm font-medium hover:bg-[#B87A88]"
            >
              {editingChild ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingChild(null); }}
              className="px-4 py-2 rounded-lg border border-[#F0E8EB] text-sm text-[#9B8A8F] hover:bg-[#F5E6EA]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Children list */}
      {optimisticChildren.length > 0 ? (
        <div className="space-y-3">
          {optimisticChildren.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-4 bg-white rounded-xl border border-[#F0E8EB] p-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#F5E6EA] flex items-center justify-center">
                <Baby className="w-5 h-5 text-[#DCA8B2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#2D2327]">{child.full_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-[#9B8A8F]">
                    <Calendar className="w-3 h-3" />
                    {getAge(child.birth_date)} years old
                  </span>
                  {child.notes && (
                    <span className="text-xs text-[#9B8A8F]">• {child.notes}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingChild(child); setShowForm(true); }}
                  className="p-2 rounded-lg hover:bg-[#F5E6EA] text-[#9B8A8F] hover:text-[#2D2327] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(child.id)}
                  className="p-2 rounded-lg hover:bg-[#E5686B]/10 text-[#9B8A8F] hover:text-[#E5686B] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : loaded ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[#F0E8EB]">
          <Baby className="w-10 h-10 text-[#9B8A8F]/30 mx-auto mb-3" />
          <p className="text-[#9B8A8F] font-medium">No children added yet</p>
          <p className="text-xs text-[#9B8A8F] mt-1">Add your child to book age-appropriate classes</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-[#9B8A8F]">Loading...</p>
        </div>
      )}
    </div>
  );
}
