#!/usr/bin/env python3
"""
Seed Reliance Q4 FY26 — full canonical-structure rich-report data.
Idempotent — uses upsert on (company_id, quarter).
Run after migrations 20260427000000 + 20260427000100 are applied.
"""
import json
import urllib.request

SUPA = "https://pnmioozueiudekegjbql.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubWlvb3p1ZWl1ZGVrZWdqYnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA2MzA0MiwiZXhwIjoyMDkwNjM5MDQyfQ.kQWCF-mHz8uqYzIatAb39ITtizcoJRMHUnuqpyRdRIc"
H = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
}

COMPANY_ID = 2
QUARTER = "Q4 FY2026"


def req(method, path, body=None, prefer=None):
    url = f"{SUPA}/rest/v1/{path}"
    data = json.dumps(body).encode() if body is not None else None
    headers = dict(H)
    if prefer:
        headers["Prefer"] = prefer
    r = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(r) as resp:
            text = resp.read().decode()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} on {method} {path}: {e.read().decode()}")
        raise


# ── 1. earnings_season row (drives /earnings tracker grid)
sector_kpis = [
    # O2C / Refining bank (Reliance is diversified; show top-line by segment)
    {"label": "Jio subscribers", "value": "524 Mn", "delta": "+36 Mn YoY", "negative": False},
    {"label": "Jio ARPU", "value": "₹214", "delta": "+3.8% YoY", "negative": False},
    {"label": "Jio EBITDA margin", "value": "52.4%", "delta": "+230 bps", "negative": False},
    {"label": "Retail stores", "value": "20,160", "delta": "+1,564 in FY26", "negative": False},
    {"label": "Retail customers", "value": "387 Mn", "delta": "+10.9% YoY", "negative": False},
    {"label": "Retail EBITDA margin", "value": "7.9%", "delta": "−60 bps (deliberate)", "negative": True},
    {"label": "5G subscribers", "value": "268 Mn", "delta": "~55% of traffic", "negative": False},
    {"label": "Fixed broadband", "value": "27.1 Mn", "delta": "~43% mkt share", "negative": False},
    {"label": "Hyper-local orders", "value": "+300% YoY", "delta": "JioMart customers +98%", "negative": False},
]

season_row = {
    "company_id": COMPANY_ID,
    "quarter": QUARTER,
    "result_status": "IN LINE",
    "result_date": "2026-04-24",
    "revenue_act": 325290,
    "pat_act": 16971,
    "ebitda_act": 48588,
    "revenue_yoy_pct": 12.9,
    "pat_yoy_pct": -12.5,
    "verdict_score": 6.0,
    "verdict_summary": "Q4 PAT fell 8.9% — but that's not the story. Jio is now Reliance's biggest profit engine. Mukesh Ambani confirmed the IPO is 'advancing steadily.' Stock is down 16.5% from highs. Most bad news is priced in.",
    "verdict_signals": [
        {"color": "green", "text": "Jio Platforms strongest margin quarter ever (52.4%)"},
        {"color": "green", "text": "Retail crossed 20,000 stores; hyper-local +300%"},
        {"color": "blue", "text": "Jio Platforms IPO 'advancing steadily' — first explicit signal"},
        {"color": "amber", "text": "O2C EBITDA −3.7% (voluntary fuel-price hold)"},
        {"color": "red", "text": "KGD6 natural decline — Oil & Gas EBITDA −18.1%"},
    ],
    "beat_quality": [
        {"ok": True, "text": "Revenue beat (+12.9% YoY)"},
        {"ok": True, "text": "EBITDA roughly flat despite O2C drag"},
        {"ok": False, "text": "PAT missed — partly one-offs and policy choices"},
        {"ok": True, "text": "Capex disciplined (+12.5% YoY)"},
    ],
    "sector_kpis": sector_kpis,
}

print("Upserting earnings_season...")
req(
    "POST",
    "earnings_season?on_conflict=company_id,quarter",
    [season_row],
    prefer="return=representation,resolution=merge-duplicates",
)

# ── 2. earnings_analyses row with full canonical content
analysis = {
    "company_id": COMPANY_ID,
    "quarter": QUARTER,
    "summary": "Reliance reported a mixed Q4 FY26 — revenue up 12.9% but PAT down 12.5%. Jio Platforms posted its strongest margin quarter ever (52.4%) and management confirmed the IPO is advancing. O2C absorbed conflict-driven costs and held retail fuel prices, dragging segment EBITDA −3.7%.",
    "investment_signal": "HOLD",
    "signal_rationale": "Most bad news is priced in (stock −16.5% from 52w high). Jio IPO is the catalyst from here.",
    "sentiment_score": 0.62,
    "sentiment_label": "cautiously positive",
    "mgmt_tone": "confident",
    "mgmt_confidence": 0.78,
    "transcript_date": "2026-04-24",

    "long_form_intro": (
        "Q4 PAT fell 8.9% — but that's not the story. Jio is now Reliance's biggest "
        "profit engine. Mukesh Ambani confirmed the IPO is *\"advancing steadily.\"* "
        "Stock is down 16.5% from highs. Most bad news is priced in.\n\n"
        "FY26 was a record year: Revenue **₹11.76 lakh Cr** (+9.8%), EBITDA **₹2.08 lakh Cr** "
        "(+13.4%), PAT **₹95,754 Cr** (+17.8%) — all-time highs.\n\n"
        "**One catch:** ₹8,924 Cr of FY26 EBITDA came from sale of listed investments. "
        "Strip it out and underlying growth is ~9%."
    ),

    "report_highlights": [
        {"kind": "worked", "text": "**Jio Platforms** had its strongest margin quarter ever (52.4%). Retail crossed **20,000 stores**. Hyper-local commerce orders **+300%**."},
        {"kind": "broke", "text": "**O2C EBITDA fell 3.7%** despite refining cracks running 148% above last year. Reliance voluntarily absorbed costs to support consumers (held fuel prices, diverted LPG)."},
        {"kind": "disclosure", "text": "**Jio Platforms IPO is 'advancing steadily.'** First explicit timeline signal from Mukesh Ambani."},
        {"kind": "capital", "text": "**₹6/share dividend** declared — first of 2026."},
    ],

    "key_numbers": [
        {"label": "Revenue", "value": "₹3,25,290 Cr", "yoy_pct": 12.9, "verdict": "beat"},
        {"label": "EBITDA", "value": "₹48,588 Cr", "yoy_pct": -0.3, "verdict": "beat est."},
        {"label": "PAT", "value": "₹16,971 Cr", "yoy_pct": -12.5, "verdict": "lower end"},
        {"label": "EPS", "value": "₹12.54", "yoy_pct": -12.5},
        {"label": "Capex", "value": "₹40,560 Cr", "yoy_pct": 12.5},
    ],

    "annual_context": {
        "fiscal_year": "FY26",
        "label": "A record year",
        "metrics": [
            {"label": "Revenue", "value": "₹11.76L Cr", "yoy_pct": 9.8},
            {"label": "EBITDA", "value": "₹2.08L Cr", "yoy_pct": 13.4},
            {"label": "PAT", "value": "₹95,754 Cr", "yoy_pct": 17.8},
        ],
        "caveat": "₹8,924 Cr of FY26 EBITDA came from sale of listed investments. Strip it out and underlying growth is ~9%.",
    },

    "segments": [
        {"name": "Digital Services", "ebitda": "₹20,041 Cr", "yoy_pct": 16.0, "color": "green", "note": "Jio compounding"},
        {"name": "O2C", "ebitda": "₹14,520 Cr", "yoy_pct": -3.7, "color": "red", "note": "ME conflict + price holds"},
        {"name": "Reliance Retail", "ebitda": "₹6,921 Cr", "yoy_pct": 3.1, "color": "green", "note": "Margin invested in HLC"},
        {"name": "Oil & Gas", "ebitda": "₹4,195 Cr", "yoy_pct": -18.1, "color": "red", "note": "KGD6 natural decline"},
        {"name": "Others (incl. New Energy)", "ebitda": "₹2,746 Cr", "yoy_pct": 21.0, "color": "green", "note": "Quiet build-out"},
    ],

    "segment_narratives": [
        {
            "segment": "Jio Platforms",
            "label": "the standout",
            "key_stats": [
                {"label": "Subscribers", "value": "524 Mn", "sub": "+36 Mn YoY", "positive": True},
                {"label": "ARPU", "value": "₹214", "sub": "+3.8% YoY (no tariff hike)", "positive": True},
                {"label": "EBITDA margin", "value": "52.4%", "sub": "+230 bps · highest ever", "positive": True},
                {"label": "5G subs", "value": "268 Mn", "sub": "~55% of traffic", "positive": True},
                {"label": "Fixed broadband", "value": "27.1 Mn", "sub": "~43% mkt share", "positive": True},
                {"label": "AirFiber", "value": "~13 Mn", "sub": "75%+ of FY26 fixed BB adds", "positive": True},
            ],
            "body_md": (
                "**Financials:**\n\n"
                "- Revenue ₹38,259 Cr (+12.6% YoY)\n"
                "- EBITDA ₹20,060 Cr (+17.9% YoY)\n"
                "- PAT ₹7,935 Cr (+13.0%)\n\n"
                "> **Why this matters for the IPO valuation:** At Jio's FY26 EBITDA of ₹76,255 Cr "
                "and a 12–15x EV/EBITDA multiple (in line with global telco-tech), the listing could "
                "land at **$110–135 Bn equity value**. SEBI's recent relaxation on large-cap dilution "
                "norms (2.5% vs 5%) makes the path easier."
            ),
        },
        {
            "segment": "Reliance Retail",
            "label": "invest now, harvest later",
            "key_stats": [
                {"label": "Stores", "value": "20,160", "sub": "+333 in Q4, +1,564 in FY26", "positive": True},
                {"label": "Registered customers", "value": "387 Mn", "sub": "+10.9% YoY", "positive": True},
                {"label": "Quarterly transactions", "value": "585 Mn", "sub": "+62% YoY", "positive": True},
                {"label": "EBITDA margin", "value": "7.9%", "sub": "−60 bps (deliberate)", "positive": False},
                {"label": "Hyper-local orders", "value": "+300% YoY", "sub": "JioMart customers +98%", "positive": True},
                {"label": "Revenue", "value": "₹98,232 Cr", "sub": "+10.8% YoY", "positive": True},
            ],
            "body_md": (
                "> **Why margins fell:** Deliberate. The 60 bps compression is the cost of building "
                "India's widest hyper-local delivery network — 3,100+ stores across 1,200+ cities, "
                "5,100+ pin codes. JioMart customers nearly doubled (+98% YoY). When this network "
                "reaches scale, margins expand.\n\n"
                "> **Quietly building inside RR:** Blinkit + Zepto + Myntra + Tata Cliq — under one "
                "roof. AjioRush now offers 4-hour fashion delivery in 600+ cities. No one else in "
                "India has this stack."
            ),
        },
        {
            "segment": "O2C",
            "label": "why the PAT missed",
            "key_stats": [
                {"label": "Q4 EBITDA", "value": "₹14,520 Cr", "sub": "−3.7% YoY", "positive": False},
                {"label": "Singapore Gasoil cracks", "value": "+148% YoY", "sub": "vs prior year base", "positive": True},
                {"label": "Jet/Kero cracks", "value": "+175% YoY", "sub": "vs prior year base", "positive": True},
            ],
            "body_md": (
                "Q4 EBITDA fell 3.7% **despite** refining cracks running at multi-year highs. "
                "Five compounding headwinds:\n\n"
                "1. **Crude premiums spiked** post Strait of Hormuz disruption\n"
                "2. **Freight + insurance costs elevated** on conflict-zone shipping\n"
                "3. **RIL voluntarily diverted propane/butane to LPG** at lower realisations\n"
                "4. **RIL held retail fuel prices steady** — absorbing under-recoveries\n"
                "5. **SAED reintroduction** on diesel/ATF exports hit export economics\n\n"
                "> **What this means:** This wasn't an operational miss. Reliance chose national "
                "priorities over margin capture in a single quarter. Sets up a base-effect tailwind "
                "for Q1 FY27 if the conflict normalises."
            ),
        },
    ],

    "key_quotes": [
        {
            "speaker": "Mukesh Ambani",
            "title": "CMD, Reliance Industries",
            "quote": "Jio Platforms listing is advancing steadily.",
            "interpretation": "The strongest IPO timeline signal yet. Read with SEBI's recent dilution-norm relaxation, this points to a DRHP filing in the next 2–3 quarters.",
        },
        {
            "speaker": "Akash Ambani",
            "title": "Chairman, Reliance Jio Infocomm",
            "quote": "Jio is the digital gateway to the Intelligence era.",
            "interpretation": "A deliberate framing shift — from connectivity to AI infrastructure. Jio is positioning as India's AI distribution layer, not just a telco.",
        },
        {
            "speaker": "Isha Ambani",
            "title": "ED, Reliance Retail Ventures",
            "quote": "FY26 marks a year of profitable growth at scale for Reliance Retail.",
            "interpretation": "FY27 priorities: AI-embedded merchandising, sharper pricing architecture, disciplined execution. Translation: margin restoration is on the agenda once the hyper-local build-out is done.",
        },
    ],

    "dodged_questions": [
        "Specific timeline for Jio Platforms DRHP filing",
        "O2C margin trajectory for FY27 — recovery shape post-conflict",
        "New Energy giga-factory commissioning + revenue guidance",
        "Retail margin restoration path — when does HLC hit breakeven",
        "KGD6 decline — when does the field stabilise",
    ],

    "next_quarter_watchlist": [
        {"emoji": "🎯", "color": "green", "text": "Jio Platforms IPO filing — likely 2–3 quarters out"},
        {"emoji": "📊", "color": "amber", "text": "Q1 FY27 O2C margin recovery — does normalisation lift back to 9–10%?"},
        {"emoji": "⚡", "color": "blue", "text": "New Energy first revenue — solar giga-factory + battery storage"},
        {"emoji": "🛒", "color": "amber", "text": "Retail margin trajectory — Q1/Q2 FY27 stabilisation watch"},
        {"emoji": "📱", "color": "green", "text": "Jio ARPU — next tariff hike window opens H2 FY27"},
        {"emoji": "🏏", "color": "blue", "text": "JioStar IPL 2026 monetisation — converting 515 Mn opening-weekend audience"},
    ],

    "sector_echo": [
        {"ticker": "BHARTIARTL", "name": "Bharti Airtel", "color": "red", "note": "Jio's 36 Mn adds + ARPU growth raises competitive bar — Bharti Q4 needs to match"},
        {"ticker": "IDEA", "name": "Vodafone Idea", "color": "red", "note": "Continued share loss confirms structural decline"},
        {"ticker": "ONGC", "name": "ONGC", "color": "amber", "note": "Sector signal: gas realisations under pressure, KGD6 decline"},
        {"ticker": "OIL", "name": "OIL India", "color": "amber", "note": "KGD6 decline read-across to upstream peers"},
        {"ticker": "HINDPETRO", "name": "HPCL", "color": "amber", "note": "RIL's voluntary fuel-price hold + SAED return = OMC under-recovery persists"},
        {"ticker": "BPCL", "name": "BPCL", "color": "amber", "note": "Same OMC under-recovery dynamic"},
        {"ticker": "IOC", "name": "Indian Oil", "color": "amber", "note": "Same OMC under-recovery dynamic"},
        {"ticker": "DMART", "name": "Avenue Supermarts", "color": "red", "note": "RR hyper-local scaling raises grocery competitive intensity"},
        {"ticker": "TRENT", "name": "Trent (Zudio)", "color": "red", "note": "AjioRush 4-hr delivery pressures Zudio's value proposition"},
        {"ticker": "ZOMATO", "name": "Zomato", "color": "red", "note": "JioMart hyper-local +300% YoY — direct quick-commerce threat"},
        {"ticker": "PVRINOX", "name": "PVR Inox", "color": "red", "note": "JioStar dominance + 500 Mn MAU JioHotstar reduces window"},
    ],

    "trade_idea": {
        "setup": "Stock −16.5% from 52w high (₹1,611), −14.5% YTD. Most bad news priced in; Jio IPO is the unlock",
        "entry": "₹1,330–1,360",
        "stop_loss": "₹1,275",
        "targets": [
            {"price": "₹1,500", "upside_pct": 11},
            {"price": "₹1,610", "upside_pct": 19, "catalyst": "Jio IPO catalyst"},
        ],
        "risk_reward": "1:2.5 to 1:4",
        "sizing": "3–5% of portfolio for long-only",
        "hedge": "Pair-trade with short ONGC for energy hedge variant",
        "view_horizon": "3–6 months",
        "verify_levels": True,
    },

    "recent_announcements": [
        {"date": "24 Apr 2026", "text": "Q4 FY26 audited results + ₹6 dividend"},
        {"date": "24 Apr 2026", "text": "Investor presentation FY26 / Q4 FY26"},
        {"date": "Feb 2026", "text": "RCPL acquired Southern Health Foods (Manna) for ₹156.42 Cr"},
        {"date": "Feb 2026", "text": "RCPL acquired majority stake in Goodness Group (Nexba), Australia"},
        {"date": "Feb 2026", "text": "Updates on Axis Capital + Nuvama investor conferences"},
        {"date": "Jan 2026", "text": "Q3 FY26 results + concall transcript"},
    ],

    "bottom_line": [
        {"emoji": "✅", "text": "HOLD · accumulate on weakness"},
        {"emoji": "🎯", "text": "Jio IPO is the catalyst from here"},
        {"emoji": "📊", "text": "Most bad news priced in at ₹1,330–1,360"},
        {"emoji": "⏱️", "text": "3–6 month view to ₹1,500–1,610"},
    ],

    "distribution_copy": {
        "twitter": [
            "Reliance Q4 FY26: PAT down 8.9%. Everyone's talking about the miss.\n\nThat's not the story.\n\nThe story is Jio just became Reliance's biggest profit engine. And the IPO is officially advancing. 🧵",
            "The numbers:\n\n• Revenue ₹3.25L Cr (+12.9%)\n• EBITDA ₹48,588 Cr (flat)\n• PAT ₹16,971 Cr (-12.5%)\n• FY26 PAT ₹95,754 Cr — record\n\nFY26 underlying growth ~9% after stripping ₹8,924 Cr investment-sale gains.",
            "Why PAT missed:\n\nO2C EBITDA -3.7% despite cracks +148% YoY.\n\nReliance voluntarily held fuel prices, diverted LPG, ate Strait of Hormuz costs.\n\nNot operational. Policy choice. Sets up Q1 FY27 base-effect tailwind.",
            "Why Jio is the story:\n\n• 524 Mn subs (+36 Mn YoY)\n• 5G now 55% of wireless traffic\n• EBITDA margin 52.4% (highest ever)\n• ARPU ₹214 (+3.8% with no tariff hike)\n• IPO 'advancing steadily' — Ambani's words\n\nFY26 EBITDA ₹76,255 Cr → $110-135B IPO valuation.",
            "Verdict: HOLD · Conviction 6/10\n\nAccumulate ₹1,330-1,360. Stop ₹1,275. Targets ₹1,500 / ₹1,610.\n\nRR 1:2.5 to 1:4. 3-6 month view.\n\nFull report: earningscanvas.in/company/RELIANCE/Q4-FY2026",
        ],
        "linkedin": (
            "**Reliance Q4 FY26: A tale of two companies inside one balance sheet.**\n\n"
            "Q4 PAT fell 8.9%. Most analyst notes will lead with that.\n\n"
            "Wrong frame.\n\n"
            "The real story: Jio Platforms is now Reliance's biggest profit engine, "
            "with its strongest margin quarter ever (52.4%). Mukesh Ambani confirmed "
            "the IPO is 'advancing steadily' — the most explicit timeline signal yet. "
            "Stock is down 16.5% from highs. Most bad news is already priced in.\n\n"
            "FY26 was a record year: Revenue ₹11.76L Cr (+9.8%), EBITDA ₹2.08L Cr (+13.4%), "
            "PAT ₹95,754 Cr (+17.8%). One caveat: ₹8,924 Cr came from investment sales — "
            "underlying growth is ~9%.\n\n"
            "Three takeaways for institutional readers:\n\n"
            "→ The mix shift is structural — Digital Services is now 41% of segment EBITDA, "
            "up from ~37% a year ago. Reliance is now a digital-first platform with energy "
            "assets attached.\n\n"
            "→ The Q4 PAT miss isn't operational. Reliance voluntarily absorbed ME-conflict "
            "costs and held fuel prices. This sets up a base-effect tailwind for Q1 FY27 "
            "if the conflict normalises.\n\n"
            "→ At Jio FY26 EBITDA of ₹76,255 Cr and 12–15x EV/EBITDA, the IPO could land "
            "at $110–135 Bn equity value. SEBI's relaxed dilution norms make the path easier.\n\n"
            "Verdict: HOLD · Conviction 6/10. Accumulate on weakness ₹1,330–1,360. "
            "3–6 month targets ₹1,500–1,610.\n\n"
            "Full report: earningscanvas.in/company/RELIANCE/Q4-FY2026\n\n"
            "#Reliance #Q4Results #IndianMarkets #EarningsAnalysis #Jio"
        ),
        "whatsapp": (
            "🔵 Reliance Q4 FY26 — quick read\n\n"
            "✅ Jio EBITDA margin 52.4% — highest ever\n"
            "✅ Retail crossed 20,000 stores; hyper-local +300%\n"
            "✅ ₹6/share dividend — first of 2026\n\n"
            "⚠️ PAT down 12.5% (one-offs + policy choices, not operational)\n"
            "⚠️ O2C EBITDA -3.7% (voluntary fuel-price hold)\n\n"
            "🎯 Jio Platforms IPO 'advancing steadily' — Ambani\n\n"
            "📊 Verdict: HOLD · accumulate ₹1,330-1,360, target ₹1,500-1,610.\n\n"
            "Full report → earningscanvas.in/company/RELIANCE/Q4-FY2026"
        ),
    },
}

print("Upserting earnings_analyses...")
req(
    "POST",
    "earnings_analyses?on_conflict=company_id,quarter",
    [analysis],
    prefer="return=representation,resolution=merge-duplicates",
)

print("\nReliance Q4 FY2026 seeded.")
print("Page: /company/RELIANCE/Q4-FY2026")
