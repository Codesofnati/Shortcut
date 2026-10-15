"use client";
import { useEffect, useState } from "react";

const CONTACT_TYPES = [
  { value: "telegram", label: "Telegram", emoji: "✈️", placeholder: "https://t.me/username" },
  { value: "facebook", label: "Facebook", emoji: "📘", placeholder: "https://facebook.com/page" },
  { value: "instagram", label: "Instagram", emoji: "📸", placeholder: "https://instagram.com/username" },
  { value: "whatsapp", label: "WhatsApp", emoji: "💬", placeholder: "https://wa.me/2519xxxxxxxx" },
  { value: "email", label: "Email", emoji: "✉️", placeholder: "support@example.com" },
  { value: "phone", label: "Phone", emoji: "📞", placeholder: "+251 9xx xxx xxx" },
  { value: "custom", label: "Custom Link", emoji: "🔗", placeholder: "https://example.com" },
];

type Contact = {
  id: string;
  type: string;
  label: string;
  value: string;
  iconUrl: string | null;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState("telegram");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_URL}/api/contacts`);
      const data = await res.json();
      if (data.success) setContacts(data.contacts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const currentTypeObj = CONTACT_TYPES.find((t) => t.value === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = editingId ? `/api/contacts/${editingId}` : "/api/contacts";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          label,
          value,
          iconUrl,
          description,
          sortOrder: Number(sortOrder),
          active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        handleReset();
        fetchContacts();
        alert(editingId ? "Contact updated!" : "Contact added!");
      } else {
        alert(data.message || "Failed to save contact");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving contact");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: Contact) => {
    setEditingId(c.id);
    setType(c.type);
    setLabel(c.label);
    setValue(c.value);
    setIconUrl(c.iconUrl || "");
    setDescription(c.description || "");
    setSortOrder(String(c.sortOrder));
    setActive(c.active);
  };

  const handleReset = () => {
    setEditingId(null);
    setType("telegram");
    setLabel("");
    setValue("");
    setIconUrl("");
    setDescription("");
    setSortOrder("0");
    setActive(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact channel?")) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchContacts();
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting contact");
    }
  };

  const inputCls =
    "w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 focus:ring-4 focus:ring-purple-500/10 transition text-xs";

  return (
    <div className="relative p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-2">
              Broker Admin
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-serif italic">
                Channels.
              </span>
            </h1>
            <p className="text-neutral-400 text-sm mt-2">
              Manage how users reach you — Telegram, Facebook, Instagram, email, and more.
            </p>
          </div>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl text-xs font-bold transition"
          >
            ← Back to Overview
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl h-fit overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-purple-500/15 blur-3xl rounded-full" />

            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold tracking-tight">
                  {editingId ? "Edit Channel" : "Add Contact Channel"}
                </h3>
                {editingId && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 border border-purple-400/20 px-2.5 py-1 rounded-full">
                    Editing
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Channel Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={inputCls}
                  >
                    {CONTACT_TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="bg-neutral-900">
                        {t.emoji} {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Display Label
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Support Bot, Sales, @shortcut"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Link / Value
                  </label>
                  <input
                    type="text"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={currentTypeObj?.placeholder}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Icon URL (optional)
                  </label>
                  <input
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://example.com/icon.png"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Description (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Fastest reply on Telegram"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="w-4 h-4 rounded bg-white/5 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-neutral-300 font-medium">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-bold rounded-xl transition cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer text-xs shadow-lg shadow-purple-900/40 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">
                      {loading ? "Saving..." : editingId ? "Update" : "Add Channel"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="md:col-span-2 relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full" />

            <div className="relative p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-base font-bold tracking-tight">
                Active Channels
              </h3>
              <span className="text-[10px] font-mono font-bold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {contacts.length} total
              </span>
            </div>

            <div className="relative divide-y divide-white/5">
              {contacts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex flex-col items-center gap-2">
                    <span className="text-3xl opacity-40">📭</span>
                    <p className="text-sm font-medium text-neutral-400">
                      No contact channels yet.
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      Add one using the form on the left.
                    </p>
                  </div>
                </div>
              ) : (
                contacts.map((c) => {
                  const meta = CONTACT_TYPES.find((t) => t.value === c.type);
                  return (
                    <div
                      key={c.id}
                      className="p-4 px-6 flex justify-between items-center hover:bg-white/[0.03] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {c.iconUrl ? (
                          <img
                            src={c.iconUrl}
                            alt=""
                            className="w-10 h-10 rounded-2xl object-cover bg-white/5 border border-white/10 p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0">
                            {meta?.emoji || "🔗"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm tracking-tight truncate">
                              {c.label}
                            </h4>
                            {!c.active && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-red-300 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                                Hidden
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-neutral-500 block truncate">
                            {c.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}