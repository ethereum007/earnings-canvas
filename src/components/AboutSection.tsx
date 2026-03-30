const credentials = [
  { icon: "RA", title: "SEBI Research Analyst", sub: "Registration in progress — Meridian Research Advisory" },
  { icon: "MF", title: "MFD / AMFI Licensed", sub: "Active mutual fund distributor" },
  { icon: "XV", title: "NISM Series XV Certified", sub: "Research Analyst certification" },
  { icon: "10", title: "10+ years in Indian equity markets", sub: "Fundamental analysis + active trading" },
  { icon: "20", title: "20+ companies per quarter", sub: "Banking, defence, pharma, PSUs, NBFCs" },
];

const AboutSection = () => {
  return (
    <section id="about" className="border-b border-ink">
      <div className="mx-auto max-w-[1280px] px-5 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left */}
        <div>
          <h2 className="font-serif text-[28px] md:text-[32px] text-ink leading-tight mb-6">
            Built by someone who actually does the work.
          </h2>
          <div className="space-y-4 font-sans text-[14px] text-ink-60 leading-relaxed">
            <p>
              Earnings Canvas is run by a SEBI Research Analyst (registration in progress) and AMFI-licensed MFD with over a decade in Indian equity markets — as both an analyst and an active investor.
            </p>
            <p>
              Last quarter: 150 hours across earnings calls, AGM transcripts, and analyst presentations. The SBIN analysis above is a live example of what paid subscribers receive — not a summary, but the actual framework.
            </p>
            <p>
              Based in Hyderabad. Covering India's markets from a practitioner's lens, not a sell-side one.
            </p>
          </div>
        </div>

        {/* Right — Credentials */}
        <div className="border border-ink-30">
          {credentials.map((c, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 p-5 ${i < credentials.length - 1 ? "border-b border-ink-10" : ""}`}
            >
              <div className="w-9 h-9 bg-ink-10 flex items-center justify-center font-mono text-[12px] text-ink shrink-0">
                {c.icon}
              </div>
              <div>
                <div className="font-sans text-[14px] font-medium text-ink">{c.title}</div>
                <div className="font-sans text-[12px] text-ink-30">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
