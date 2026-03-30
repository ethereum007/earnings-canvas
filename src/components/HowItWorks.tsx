const steps = [
  {
    num: "01",
    title: "We attend the calls",
    body: "Every earnings call, AGM transcript, and analyst presentation — live or recorded.",
  },
  {
    num: "02",
    title: "We parse the numbers",
    body: "Not just revenue and PAT. NIM trajectories, slippage ratios, provision buffers, guidance deltas.",
  },
  {
    num: "03",
    title: "We write the brief",
    body: "One document. The bull case, the bear case, and the one trigger to watch.",
  },
  {
    num: "04",
    title: "You get the edge",
    body: "Flash cards free. Deep dives on subscription. Live Q&A sessions for paid members.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="border-b border-ink">
      <div className="mx-auto max-w-[1280px] px-5 py-16 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-12">
        {/* Left */}
        <div>
          <h2 className="font-serif text-[28px] md:text-[32px] text-ink leading-tight mb-4">
            150 hours of calls. Distilled for you.
          </h2>
          <p className="font-sans text-[14px] text-ink-60 leading-relaxed">
            Our process turns raw earnings data into institutional-grade intelligence you can act on.
          </p>
        </div>

        {/* Right 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {steps.map((step) => (
            <div key={step.num}>
              <div className="font-serif text-[48px] text-ink-10 leading-none mb-2">
                {step.num}
              </div>
              <div className="font-sans text-[15px] font-medium text-ink mb-2">
                {step.title}
              </div>
              <p className="font-sans text-[13px] text-ink-60 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
