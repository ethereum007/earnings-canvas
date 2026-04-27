"use client";
import { useState } from "react";
import { Copy, Check, Twitter, Linkedin, MessageCircle } from "lucide-react";
import type { DistributionCopy } from "@/types/earnings";
import { cn } from "@/lib/utils";

type Tab = "twitter" | "linkedin" | "whatsapp";

export default function DistributionCopyPanel({
  copy,
}: {
  copy: DistributionCopy;
}) {
  const [tab, setTab] = useState<Tab>(
    copy.twitter?.length
      ? "twitter"
      : copy.linkedin
        ? "linkedin"
        : "whatsapp"
  );
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!copy) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/40 overflow-hidden">
      <div className="flex border-b border-white/5">
        {copy.twitter?.length ? (
          <TabBtn
            active={tab === "twitter"}
            onClick={() => setTab("twitter")}
            icon={<Twitter size={14} />}
            label="X thread"
          />
        ) : null}
        {copy.linkedin ? (
          <TabBtn
            active={tab === "linkedin"}
            onClick={() => setTab("linkedin")}
            icon={<Linkedin size={14} />}
            label="LinkedIn"
          />
        ) : null}
        {copy.whatsapp ? (
          <TabBtn
            active={tab === "whatsapp"}
            onClick={() => setTab("whatsapp")}
            icon={<MessageCircle size={14} />}
            label="WhatsApp"
          />
        ) : null}
      </div>

      <div className="p-5">
        {tab === "twitter" && copy.twitter?.length && (
          <div className="space-y-3">
            {copy.twitter.map((tweet, i) => (
              <div
                key={i}
                className="rounded-xl bg-zinc-950 border border-white/5 p-4 relative group"
              >
                <button
                  onClick={() => handleCopy(tweet, `tw-${i}`)}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition opacity-0 group-hover:opacity-100"
                  aria-label="Copy"
                >
                  {copied === `tw-${i}` ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
                <div className="text-[10px] text-zinc-500 mb-2 font-mono">
                  Tweet {i + 1} / {copy.twitter!.length}
                </div>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {tweet}
                </p>
              </div>
            ))}
            <button
              onClick={() =>
                handleCopy(copy.twitter!.join("\n\n"), "tw-all")
              }
              className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-400 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              {copied === "tw-all" ? (
                <>
                  <Check size={14} /> Copied full thread
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy full thread
                </>
              )}
            </button>
          </div>
        )}

        {tab === "linkedin" && copy.linkedin && (
          <div className="rounded-xl bg-zinc-950 border border-white/5 p-4 relative group">
            <button
              onClick={() => handleCopy(copy.linkedin!, "li")}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
              aria-label="Copy"
            >
              {copied === "li" ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} />
              )}
            </button>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed pr-8">
              {copy.linkedin}
            </p>
          </div>
        )}

        {tab === "whatsapp" && copy.whatsapp && (
          <div className="rounded-xl bg-zinc-950 border border-white/5 p-4 relative group">
            <button
              onClick={() => handleCopy(copy.whatsapp!, "wa")}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
              aria-label="Copy"
            >
              {copied === "wa" ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} />
              )}
            </button>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed pr-8">
              {copy.whatsapp}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-xs font-medium border-b-2 transition flex items-center gap-2 -mb-px",
        active
          ? "text-white border-emerald-400"
          : "text-zinc-500 border-transparent hover:text-zinc-300"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
