const SampleAnalysis = () => {
  return (
    <section id="analysis" className="border-b border-ink">
      <div className="mx-auto max-w-[1280px] px-5 py-16">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-60">
            Latest Analyses
          </span>
          <a href="#pricing" className="font-sans text-[13px] text-gold hover:text-gold-light transition-colors duration-200">
            Full access →
          </a>
        </div>

        {/* Three-column grid */}
        <div className="border border-ink grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr]">
          {/* SBIN Column */}
          <div className="p-6 lg:border-r border-ink-30 border-b lg:border-b-0">
            <span className="font-mono text-[11px] text-ink-30">Banking · Q3FY26 · 07 Feb 2026</span>
            <h3 className="font-serif text-[22px] text-ink mt-2 mb-1">State Bank of India</h3>
            <span className="font-mono text-[11px] text-ink-30 block mb-4">NSE: SBIN · Large Cap PSU Banking</span>
            <div className="inline-block bg-green-bg text-green-text font-mono text-[11px] px-3 py-1 mb-4">
              ▲ Beat — Structural recovery confirmed
            </div>
            <p className="font-sans text-[13px] text-ink-60 leading-relaxed mb-6">
              The NIM trough story is playing out exactly as management called it — U-shaped, with the floor at 3.02% in June 2025 and now recovering to 3.12%. The ₹30,642 crore provision buffer sitting outside PCR — equal to 170% of net NPAs — is the number most analysts are ignoring. GNPA at 1.57% is a two-decade low. SME credit at 21% YoY is the alpha engine.
            </p>
            {/* KPI Table */}
            <div className="border-t border-ink-30">
              {[
                ["Net profit YoY", "+24.49%", true],
                ["Domestic NIM", "3.12% ▲ QoQ", true],
                ["Gross NPA", "1.57% ▼", true],
                ["Credit growth", "15.14% YoY", true],
                ["ROE (9MFY26)", "20.68%", false],
              ].map(([label, value, isGreen], i) => (
                <div key={i} className="flex justify-between py-2.5 border-b border-ink-10 font-mono text-[12px]">
                  <span className="text-ink-60">{label as string}</span>
                  <span className={isGreen ? "text-green-text" : "text-ink"}>{value as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HBL Column */}
          <div className="p-6 lg:border-r border-ink-30 border-b lg:border-b-0">
            <span className="font-mono text-[11px] text-ink-30">Defence · AGM · Sep 2025</span>
            <h3 className="font-serif text-[22px] text-ink mt-2 mb-1">HBL Engineering</h3>
            <span className="font-mono text-[11px] text-ink-30 block mb-4">NSE: HBLPOWER · Mid Cap Defence</span>
            <div className="inline-block bg-green-bg text-green-text font-mono text-[11px] px-3 py-1 mb-4">
              ▲ Undercover compounder
            </div>
            <p className="font-sans text-[13px] text-ink-60 leading-relaxed mb-6">
              Dr. Prasad's AGM was a rare unfiltered window. The proximity fuse certification — pending since September — is the single most important event to track. 100% indigenised fuse manufacturing puts HBL in a strategic position no competitor can replicate. Fuses set to become #2 business by FY28.
            </p>
            <div className="border-t border-ink-30">
              {[
                ["FY26 budget", "₹3,000 Cr", false],
                ["FY30 aspiration", "₹4,500 Cr", false],
                ["Forex revenue", "₹300 Cr+ ▲", true],
                ["Key trigger", "Fuse cert pending", false],
              ].map(([label, value, isGreen], i) => (
                <div key={i} className="flex justify-between py-2.5 border-b border-ink-10 font-mono text-[12px]">
                  <span className="text-ink-60">{label as string}</span>
                  <span className={isGreen ? "text-green-text" : "text-ink"}>{value as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teaser Column */}
          <div className="p-6 bg-paper-2">
            <span className="font-mono text-[11px] text-ink-30">Q4FY26 Season Preview</span>
            <h3 className="font-serif text-[20px] text-ink mt-2 mb-1">Coming next</h3>
            <span className="font-mono text-[11px] text-ink-60 block mb-4">20 companies · April–May 2026</span>
            <p className="font-sans text-[13px] text-ink-60 leading-relaxed mb-6">
              Every result we cover this quarter includes: the one number management doesn't highlight, the guidance delta vs last quarter, and a clear 'what to watch' for the next 90 days.
            </p>
            <div className="font-mono text-[11px] text-ink-30 mb-6">
              Banks · Pharma · Defence · IT · NBFCs · PSU plays
            </div>
            <a
              href="#pricing"
              className="inline-block border border-ink font-mono text-[11px] uppercase tracking-[0.1em] text-ink px-5 py-2.5 hover:bg-ink hover:text-paper transition-colors duration-200"
            >
              Subscribe for access →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleAnalysis;
