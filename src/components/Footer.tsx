const footerLinks = ["Analysis", "How it works", "Subscribe", "About"];

const Footer = () => {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1280px] px-5 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-serif text-xl text-paper tracking-tight mb-1">
            Earnings <span className="italic text-gold">Canvas</span>
          </div>
          <div className="font-sans text-[12px] text-ink-30">
            India's Earnings Intelligence, For Serious Investors
          </div>
        </div>
        <nav className="flex items-center gap-6">
          {footerLinks.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-30 hover:text-paper transition-colors duration-200"
            >
              {l}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-ink-60 mx-auto max-w-[1280px] px-5 py-6">
        <p className="font-sans text-[11px] text-ink-60 leading-relaxed">
          Earnings Canvas is an educational and informational publication. Content is not investment advice and does not constitute a recommendation to buy, sell or hold any security. SEBI Research Analyst registration pending under Meridian Research Advisory. All analyses are for informational purposes only.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
