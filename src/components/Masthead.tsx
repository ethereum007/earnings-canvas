import { useState } from "react";

const navLinks = [
  { label: "Analysis", href: "#analysis" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Subscribe", href: "#pricing" },
  { label: "About", href: "#about" },
];

const Masthead = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header className="border-b border-ink">
      {/* Top row */}
      <div className="mx-auto max-w-[1280px] px-5 py-3 flex items-center justify-between">
        <div className="font-serif text-xl tracking-tight text-ink">
          Earnings <span className="italic text-gold">Canvas</span>
        </div>
        <div className="hidden md:block font-mono text-[11px] text-ink-60 tracking-wide">
          India's Earnings Intelligence&ensp;|&ensp;Q4FY26 Results Season — April 2026
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-ink-30 mx-auto max-w-[1280px] px-5 py-2.5 flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => handleNav(e, l.href)}
              className="font-sans text-[13px] text-ink-60 hover:text-ink transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#pricing"
          onClick={(e) => handleNav(e, "#pricing")}
          className="font-mono text-[11px] uppercase tracking-[0.1em] bg-ink text-paper px-5 py-2 hover:bg-gold transition-colors duration-200"
        >
          Get Free Access
        </a>
      </div>
    </header>
  );
};

export default Masthead;
