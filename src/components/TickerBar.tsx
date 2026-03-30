const tickerItems = [
  { text: "Q4FY26 EARNINGS SEASON BEGINS APRIL 2026", color: "text-paper" },
  { text: "·", color: "text-paper" },
  { text: "SBIN — Net profit ₹21,028 Cr", color: "text-paper" },
  { text: "▲24.5% YoY", color: "text-green-text" },
  { text: "·", color: "text-paper" },
  { text: "GNPA at 1.57% — two-decade low", color: "text-paper" },
  { text: "·", color: "text-paper" },
  { text: "HBL Engineering — proximity fuse certification imminent", color: "text-paper" },
  { text: "·", color: "text-paper" },
  { text: "Domestic NIM recovery: 3.02% trough → 3.12%", color: "text-paper" },
  { text: "·", color: "text-paper" },
  { text: "20 companies covered last quarter", color: "text-paper" },
  { text: "·", color: "text-paper" },
  { text: "150+ hours of earnings calls", color: "text-paper" },
  { text: "·", color: "text-paper" },
];

const TickerBar = () => {
  const content = tickerItems.map((item, i) => (
    <span key={i} className={`${item.color} mx-2`}>
      {item.text}
    </span>
  ));

  return (
    <div className="bg-ink overflow-hidden py-2.5">
      <div className="ticker-animate flex whitespace-nowrap font-mono text-[12px] tracking-wide">
        <div className="flex items-center">{content}</div>
        <div className="flex items-center">{content}</div>
      </div>
    </div>
  );
};

export default TickerBar;
