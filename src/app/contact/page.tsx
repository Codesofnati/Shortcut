import Navbar from "../components/navbar";
import { db } from "../../../api/src/db";
import { contactChannels } from "../../../api/src/db/schema";
import { asc, eq } from "drizzle-orm";

type Channel = {
  id: string;
  type: string;
  label: string;
  value: string;
  iconUrl: string | null;
  description: string | null;
};

const TYPE_META: Record<
  string,
  { emoji: string; color: string; bg: string; border: string }
> = {
  telegram: {
    emoji: "✈️",
    color: "text-sky-600",
    bg: "from-sky-50 to-white",
    border: "border-sky-100",
  },
  facebook: {
    emoji: "📘",
    color: "text-blue-600",
    bg: "from-blue-50 to-white",
    border: "border-blue-100",
  },
  instagram: {
    emoji: "📸",
    color: "text-pink-600",
    bg: "from-pink-50 to-white",
    border: "border-pink-100",
  },
  whatsapp: {
    emoji: "💬",
    color: "text-emerald-600",
    bg: "from-emerald-50 to-white",
    border: "border-emerald-100",
  },
  email: {
    emoji: "✉️",
    color: "text-purple-600",
    bg: "from-purple-50 to-white",
    border: "border-purple-100",
  },
  phone: {
    emoji: "📞",
    color: "text-amber-600",
    bg: "from-amber-50 to-white",
    border: "border-amber-100",
  },
  custom: {
    emoji: "🔗",
    color: "text-neutral-600",
    bg: "from-neutral-50 to-white",
    border: "border-neutral-100",
  },
};

function getHref(channel: Channel) {
  if (channel.type === "email") return `mailto:${channel.value}`;
  if (channel.type === "phone") return `tel:${channel.value.replace(/\s+/g, "")}`;
  return channel.value;
}

export default async function ContactPage() {
  let channels: Channel[] = [];
  try {
    channels = await db
      .select()
      .from(contactChannels)
      .where(eq(contactChannels.active, true))
      .orderBy(asc(contactChannels.sortOrder), asc(contactChannels.createdAt));
  } catch (error) {
    console.error("Failed to load contacts:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBFBFA] via-white to-[#FAF8FF] text-neutral-900 font-sans relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] bg-purple-300/25 blur-[140px] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-300/20 blur-[140px] rounded-full translate-y-1/3 -translate-x-1/3" />

      <Navbar />

      <main className="relative max-w-5xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50/80 border border-purple-200/70 rounded-full text-purple-700 text-[11px] font-bold tracking-[0.1em] backdrop-blur-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            GET IN TOUCH
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Talk to us,{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 font-serif italic">
                anytime.
              </span>
              <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-purple-200/50 -z-0 rounded-full" />
            </span>
          </h1>
          <p className="text-neutral-600 text-sm mt-4 max-w-lg mx-auto leading-relaxed">
            Pick the channel that works best for you. We reply fast — usually within a
            few minutes during business hours.
          </p>
        </div>

        {/* Contact grid */}
        {channels.length === 0 ? (
          <div className="relative bg-white/85 backdrop-blur-sm border border-neutral-200/80 rounded-3xl p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_40px_-20px_rgba(139,92,246,0.15)] overflow-hidden">
            <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-purple-200/40 blur-3xl rounded-full" />
            <div className="relative">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 border border-purple-200 flex items-center justify-center text-2xl">
                📭
              </div>
              <p className="text-neutral-800 font-bold text-base">
                No contact channels available yet.
              </p>
              <p className="text-xs text-neutral-500 mt-1.5">
                Please check back soon — we're setting things up.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {channels.map((channel) => {
              const meta = TYPE_META[channel.type] || TYPE_META.custom;
              return (
                <a
                  key={channel.id}
                  href={getHref(channel)}
                  target={channel.type === "email" || channel.type === "phone" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className={`group relative bg-gradient-to-br ${meta.bg} ${meta.border} border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                >
                  {/* Soft glow on hover */}
                  <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 bg-white/40 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-start gap-4">
                    {channel.iconUrl ? (
                      <img
                        src={channel.iconUrl}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover bg-white border border-neutral-200 p-1 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                        {meta.emoji}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[10px] uppercase tracking-[0.15em] font-bold ${meta.color} mb-1`}
                      >
                        {channel.type}
                      </p>
                      <h3 className="font-bold text-lg tracking-tight text-neutral-900 truncate">
                        {channel.label}
                      </h3>
                      {channel.description && (
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                          {channel.description}
                        </p>
                      )}
                      <p className="text-[11px] font-mono text-neutral-500 mt-2 truncate">
                        {channel.value}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 mt-1 w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-sm font-bold transition-transform group-hover:translate-x-0.5 ${meta.color}`}
                    >
                      →
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-[11px] text-neutral-400 font-medium mt-12">
          For order-specific questions, please include your order ID in the message.
        </p>
      </main>
    </div>
  );
}