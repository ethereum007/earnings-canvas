const PricingSection = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="border-b border-ink">
      <div className="mx-auto max-w-[1280px] px-5 py-16">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-60 block mb-8">
          Subscription Tiers
        </span>

        <div className="border border-ink grid grid-cols-1 lg:grid-cols-3">
          {/* Free */}
          <div className="p-8 border-b lg:border-b-0 lg:border-r border-ink-30">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-30">Free</span>
            <div className="font-serif text-[36px] text-ink mt-2">₹0</div>
            <span className="font-sans text-[13px] text-ink-30 block mb-6">forever</span>
            <ul className="space-y-3 mb-8">
              {[
                "Earnings flash cards — 5 numbers, 1 verdict, 1 thing to watch",
                "Coverage across 20+ companies per season",
                "Sector trend summaries",
                "Weekly email during earnings season",
              ].map((f, i) => (
                <li key={i} className="font-sans text-[13px] text-ink-60 leading-relaxed">
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="block text-center border border-ink font-mono text-[11px] uppercase tracking-[0.1em] text-ink px-5 py-3 hover:bg-ink hover:text-paper transition-colors duration-200"
            >
              Subscribe free
            </a>
          </div>

          {/* Earnings Digest — Featured */}
          <div className="p-8 bg-ink text-paper relative border-b lg:border-b-0 lg:border-r border-ink-30">
            <div className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-[0.1em] text-gold">
              Most popular
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-30">Earnings Digest</span>
            <div className="font-serif text-[36px] text-paper mt-2">₹999<span className="text-[16px] font-sans">/mo</span></div>
            <span className="font-sans text-[13px] text-ink-30 block mb-6">or ₹8,999/year · save 25%</span>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "Full deep-dive analysis per company",
                "Bull/bear framework with scenario targets",
                "Management guidance tracker",
                "Sector rotation commentary",
                "Earnings season preview",
              ].map((f, i) => (
                <li key={i} className="font-sans text-[13px] text-ink-30 leading-relaxed">
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="block text-center bg-gold font-mono text-[11px] uppercase tracking-[0.1em] text-ink px-5 py-3 hover:bg-gold-light transition-colors duration-200"
            >
              Start reading
            </a>
          </div>

          {/* Edge Community */}
          <div className="p-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-30">Edge Community</span>
            <div className="font-serif text-[36px] text-ink mt-2">₹2,999<span className="text-[16px] font-sans">/mo</span></div>
            <span className="font-sans text-[13px] text-ink-30 block mb-6">or ₹24,999/year</span>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Digest",
                "Bi-weekly live session — 3 companies, live Q&A",
                "Telegram community",
                "Quarterly portfolio review webinar",
                "Priority email support",
              ].map((f, i) => (
                <li key={i} className="font-sans text-[13px] text-ink-60 leading-relaxed">
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="block text-center border border-ink font-mono text-[11px] uppercase tracking-[0.1em] text-ink px-5 py-3 hover:bg-ink hover:text-paper transition-colors duration-200"
            >
              Join community
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
