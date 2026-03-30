import { useState } from "react";

const stats = [
  { number: "20+", label: "Companies covered every earnings season" },
  { number: "150h", label: "Earnings calls attended last quarter alone" },
  { number: "3", label: "Tiers: flash cards, deep dives, advisory" },
];

const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="border-b border-ink">
      <div className="mx-auto max-w-[1280px] px-5 py-8 md:py-12 grid grid-cols-1 md:grid-cols-[1fr_380px] gap-12 md:gap-16">
        {/* Left column */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-[1px] bg-gold" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
              India's Earnings Intelligence
            </span>
          </div>

          <h1 className="font-serif text-[42px] md:text-[64px] leading-[1.08] text-ink mb-8">
            Read earnings like
            <br />
            an{" "}
            <span className="italic text-gold">institutional</span>
            <br />
            analyst does.
          </h1>

          <p className="font-sans text-[17px] text-ink-60 leading-relaxed max-w-[540px] mb-10">
            We attend the calls, read the transcripts, and parse the numbers so
            you can see what management is actually signalling — not just what the
            headlines say. Every quarter, across 20+ companies.
          </p>

          <form onSubmit={handleSubmit} className="border border-ink flex max-w-[520px]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 bg-white px-4 py-3 font-sans text-[14px] text-ink placeholder:text-ink-30 outline-none"
              required
            />
            <button
              type="submit"
              className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-6 py-3 hover:bg-gold transition-colors duration-200 whitespace-nowrap"
            >
              {submitted ? "Done! ✓" : "Subscribe Free"}
            </button>
          </form>

          {submitted ? (
            <p className="font-sans text-[12px] text-green-text mt-3">
              Done! Check your inbox.
            </p>
          ) : (
            <p className="font-sans text-[12px] text-ink-30 mt-3">
              Free access to flash cards. No credit card. Unsubscribe anytime.
            </p>
          )}
        </div>

        {/* Right sidebar */}
        <div className="border-l border-ink-30 pl-8 md:pl-12 flex flex-col justify-center">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`py-6 ${i < stats.length - 1 ? "border-b border-ink-30" : ""}`}
            >
              <div className="font-serif text-[42px] text-ink leading-none mb-2">
                {stat.number}
              </div>
              <div className="font-sans text-[13px] text-ink-60 leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
