#!/usr/bin/env python3
"""
publish_from_markdown.py

Convert a canonical EarningsCanvas markdown article into the rich-report
JSON shape and upsert into Supabase via REST. Idempotent on (company_id, quarter).

Usage:
    python publish_from_markdown.py path/to/RELIANCE_Q4FY26.md
    python publish_from_markdown.py path/to/RELIANCE_Q4FY26.md --dry-run

Output URL:
    https://earningscanvas.in/company/{SYMBOL}/{QUARTER-SLUG}
    e.g. https://earningscanvas.in/company/RELIANCE/Q4-FY2026
"""

import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

SUPA_URL = "https://pnmioozueiudekegjbql.supabase.co"
SERVICE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubWlvb3p1ZWl1ZGVrZWdqYnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA2MzA0MiwiZXhwIjoyMDkwNjM5MDQyfQ.kQWCF-mHz8uqYzIatAb39ITtizcoJRMHUnuqpyRdRIc"
)
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}


# ────────────────────────────────────────────────────────────────────
# Supabase REST helpers
# ────────────────────────────────────────────────────────────────────
def supa(method: str, path: str, body: Any = None, prefer: str | None = None):
    url = f"{SUPA_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body is not None else None
    headers = dict(HEADERS)
    if prefer:
        headers["Prefer"] = prefer
    r = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(r) as resp:
            text = resp.read().decode()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        print(f"HTTP {e.code} on {method} {path}\n{body_text}")
        # Re-raise with original payload attached so caller can retry
        raise type(e)(e.url, e.code, body_text, e.headers, None)


def supa_upsert_resilient(table_path: str, row: dict[str, Any], on_conflict: str) -> Any:
    """
    POST upsert that auto-retries with offending columns removed when the
    schema cache reports them missing. Lets the publisher work even if a
    new migration hasn't been applied yet — drops the new fields gracefully
    instead of erroring.
    """
    payload = dict(row)
    for _ in range(8):
        try:
            return supa(
                "POST",
                f"{table_path}?on_conflict={on_conflict}",
                [payload],
                prefer="return=minimal,resolution=merge-duplicates",
            )
        except urllib.error.HTTPError as e:
            txt = (e.reason if isinstance(e.reason, str) else str(e.reason)) or ""
            # PGRST204 = column not found in schema cache
            m = re.search(r"Could not find the '([^']+)' column", txt)
            if not m:
                raise
            col = m.group(1)
            if col not in payload:
                raise
            print(f"  [warn] schema-cache missing '{col}', retrying without it")
            payload.pop(col, None)
    raise RuntimeError("upsert failed after dropping known-missing columns")


# ────────────────────────────────────────────────────────────────────
# Parsing utilities
# ────────────────────────────────────────────────────────────────────
def split_sections(md: str) -> dict[str, str]:
    """Split markdown into sections keyed by '## Heading' (drops trailing context)."""
    parts: dict[str, str] = {}
    current_key = "__preamble__"
    current_buf: list[str] = []
    for line in md.splitlines():
        m = re.match(r"^##\s+(.+?)\s*$", line)
        if m:
            parts[current_key] = "\n".join(current_buf).strip()
            current_key = m.group(1).strip()
            current_buf = []
        else:
            current_buf.append(line)
    parts[current_key] = "\n".join(current_buf).strip()
    return parts


def split_subsections(text: str) -> list[tuple[str, str]]:
    """Split text into (h3_heading, body) tuples."""
    items: list[tuple[str, str]] = []
    cur_heading: str | None = None
    cur_buf: list[str] = []
    for line in text.splitlines():
        m = re.match(r"^###\s+(.+?)\s*$", line)
        if m:
            if cur_heading is not None:
                items.append((cur_heading, "\n".join(cur_buf).strip()))
            cur_heading = m.group(1).strip()
            cur_buf = []
        elif cur_heading is not None:
            cur_buf.append(line)
    if cur_heading is not None:
        items.append((cur_heading, "\n".join(cur_buf).strip()))
    return items


def find_section(sections: dict[str, str], *prefixes: str) -> str:
    """Find the first section whose key starts with any of the prefixes (case-insensitive)."""
    for key, body in sections.items():
        for p in prefixes:
            if key.lower().startswith(p.lower()):
                return body
    return ""


def strip_md_emphasis(s: str) -> str:
    """Strip outer **bold** / *italic* / __bold__ / _italic_ markers."""
    s = s.strip()
    for pair in ("**", "__", "*", "_"):
        if s.startswith(pair) and s.endswith(pair):
            s = s[len(pair) : -len(pair)]
    return s.strip()


def parse_md_table(text: str) -> list[list[str]]:
    """Parse a markdown table → list of [cells]. Skips header/separator rows."""
    rows: list[list[str]] = []
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        if re.match(r"^\|[\s\-:|]+\|$", line):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        rows.append(cells)
    return rows


def parse_yoy_pct(s: str) -> float | None:
    """Extract a YoY percentage from cells like '+12.9%' or '−0.3%' or '**+16.0%**'."""
    s = strip_md_emphasis(s).replace("−", "-").replace("–", "-").replace("—", "-")
    m = re.search(r"([+-]?\d+(?:\.\d+)?)\s*%", s)
    return float(m.group(1)) if m else None


def parse_amount_cr(s: str) -> float | None:
    """Extract a numeric value from cells like '₹3,25,290 Cr' or '₹16,971 Cr'."""
    s = strip_md_emphasis(s)
    s = s.replace("₹", "").replace(",", "").strip()
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)", s)
    if not m:
        return None
    val = float(m.group(1))
    if "Lakh Cr" in s or "L Cr" in s.lower() or "lakh" in s.lower():
        val *= 100000  # 1 Lakh Cr = 100,000 Cr
    return val


# ────────────────────────────────────────────────────────────────────
# Section parsers
# ────────────────────────────────────────────────────────────────────
def parse_title_header(preamble: str) -> dict[str, Any]:
    """Parse the '# Company · Quarter' line + subtitle (NSE: TICKER · Reported DATE)."""
    out: dict[str, Any] = {}
    title_m = re.search(r"^#\s+(.+?)$", preamble, re.MULTILINE)
    if title_m:
        title = title_m.group(1)
        # Extract company name + quarter
        m = re.search(r"^(.+?)\s*[·•]\s*(Q[1-4]\s*FY\s*\d{2,4})", title)
        if m:
            out["company"] = m.group(1).strip()
            q = m.group(2).replace(" ", "")  # 'Q4FY26'
            qm = re.match(r"Q([1-4])FY(\d+)", q)
            if qm:
                qnum, year = qm.group(1), qm.group(2)
                full_year = f"20{year}" if len(year) == 2 else year
                out["quarter"] = f"Q{qnum} FY{full_year}"
    sub_m = re.search(r"NSE:\s*([A-Z0-9]+)", preamble)
    if sub_m:
        out["symbol"] = sub_m.group(1)
    date_m = re.search(r"Reported\s+(.+?)(?:\s*[·•]|\s*$)", preamble)
    if date_m:
        date_str = date_m.group(1).strip()
        out["report_date_text"] = date_str
        try:
            from datetime import datetime
            dt = datetime.strptime(date_str, "%d %B %Y")
            out["result_date"] = dt.strftime("%Y-%m-%d")
        except (ValueError, ImportError):
            pass
    sector_m = re.search(r"Reported\s+\S+\s+\S+\s+\S+\s*[·•]\s*([^\n]+)", preamble)
    if sector_m:
        out["sector_hint"] = sector_m.group(1).strip()
    return out


def parse_tldr(body: str) -> dict[str, Any]:
    """Parse '## TL;DR' blockquote: verdict / conviction / one-liner / story."""
    text = re.sub(r"^>\s*", "", body, flags=re.MULTILINE).strip()
    out: dict[str, Any] = {}
    m = re.search(r"Verdict:\s*([A-Z]+)\s*[·•]\s*Conviction\s*(\d+(?:\.\d+)?)\s*/\s*10", text)
    if m:
        out["investment_signal"] = m.group(1)
        out["verdict_score"] = float(m.group(2))
    # First non-verdict paragraph is the one-line thesis; "The story:" para is the verdict_summary
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    thesis = None
    story = None
    for p in paragraphs:
        if "Verdict:" in p or "Conviction" in p:
            continue
        if p.lower().startswith("**the story:**") or p.lower().startswith("the story:"):
            story = re.sub(r"^\*?\*?the story:\*?\*?\s*", "", p, flags=re.IGNORECASE)
            continue
        if thesis is None:
            thesis = p
    summary_parts = [x for x in (thesis, story) if x]
    if summary_parts:
        out["verdict_summary"] = " ".join(summary_parts)
    return out


def parse_60_second(body: str) -> list[dict[str, str]]:
    """Parse 4 emoji-prefixed bullets — worked / broke / disclosure / capital."""
    kind_map = {"📈": "worked", "📉": "broke", "🎯": "disclosure", "💰": "capital"}
    out = []
    for emoji, kind in kind_map.items():
        # Match the emoji and grab text up to the next emoji or end
        pattern = re.escape(emoji) + r"\s*(.+?)(?=\n\s*(?:📈|📉|🎯|💰)|\Z)"
        m = re.search(pattern, body, re.DOTALL)
        if m:
            text = m.group(1).strip()
            # Strip leading "**Label:**" if present
            text = re.sub(r"^\*\*[^*]+:\*\*\s*", "", text).strip()
            out.append({"kind": kind, "text": text})
    return out


def parse_headline_numbers(body: str) -> dict[str, Any]:
    """Parse '## Headline numbers · QX FYxx' table + annual context para + caveat blockquote."""
    rows = parse_md_table(body)
    out: dict[str, Any] = {"key_numbers": []}
    for row in rows[1:]:  # skip header
        if len(row) < 4:
            continue
        label, qval, yoy, verdict = row[0], row[1], row[2], row[3]
        out["key_numbers"].append({
            "label": label,
            "value": strip_md_emphasis(qval),
            "yoy_pct": parse_yoy_pct(yoy),
            "verdict": strip_md_emphasis(verdict),
        })
        lo = label.lower()
        if lo == "revenue":
            out["revenue_act"] = parse_amount_cr(qval)
            out["revenue_yoy_pct"] = parse_yoy_pct(yoy)
        elif lo == "ebitda":
            out["ebitda_act"] = parse_amount_cr(qval)
        elif lo == "pat":
            out["pat_act"] = parse_amount_cr(qval)
            out["pat_yoy_pct"] = parse_yoy_pct(yoy)

    # Annual context paragraph (starts with '**FYxx ... record year:**' or similar)
    annual_m = re.search(
        r"\*\*FY(\d{2,4})\s+was\s+a\s+record\s+year:\*\*\s*(.+?)(?=\n\n|\n>|\Z)",
        body,
        re.DOTALL | re.IGNORECASE,
    )
    if annual_m:
        fy = f"FY{annual_m.group(1)}"
        prose = annual_m.group(2).strip()
        # Extract metrics like 'Revenue ₹X Cr (+Y%)'
        ac_metrics = []
        for mm in re.finditer(
            r"(Revenue|EBITDA|PAT)\s+₹([\d.,]+\s*(?:lakh|Lakh|L)?\s*Cr)\s*\(([^)]+)\)",
            prose,
        ):
            ac_metrics.append({
                "label": mm.group(1),
                "value": f"₹{mm.group(2).strip()}",
                "yoy_pct": parse_yoy_pct(mm.group(3)),
            })
        # Caveat: blockquote starting with '> **One catch:**'
        caveat = None
        cm = re.search(r">\s*\*\*One catch:\*\*\s*(.+?)(?=\n>|\Z)", body, re.DOTALL)
        if cm:
            caveat = cm.group(1).strip().replace("\n>", "\n").strip()
        if ac_metrics:
            out["annual_context"] = {
                "fiscal_year": fy,
                "label": "A record year",
                "metrics": ac_metrics,
                "caveat": caveat,
            }

    return out


def parse_segment_scorecard(body: str) -> list[dict[str, Any]]:
    """Parse the segment table. Color from emoji prefix (🟢 → green, 🔴 → red, 🟡 → amber)."""
    EMOJI_COLOR = {"🟢": "green", "🔴": "red", "🟡": "amber", "🟠": "amber"}
    rows = parse_md_table(body)
    out = []
    for row in rows[1:]:
        if len(row) < 4:
            continue
        seg, ebitda, yoy, note = row[0], row[1], row[2], row[3]
        color = "gray"
        for em, c in EMOJI_COLOR.items():
            if seg.startswith(em):
                color = c
                seg = seg[len(em):].strip()
                break
        out.append({
            "name": strip_md_emphasis(seg),
            "ebitda": strip_md_emphasis(ebitda),
            "yoy_pct": parse_yoy_pct(yoy),
            "color": color,
            "note": strip_md_emphasis(note),
        })
    return out


def parse_segment_narratives(sections: dict[str, str]) -> list[dict[str, Any]]:
    """Each per-segment H2 section becomes a narrative entry. Heading 'Segment · label'."""
    SKIP_PREFIXES = (
        "tl;dr", "the 60-second read", "headline numbers", "segment scorecard",
        "what management said", "concall q&a", "forward tracker", "sector echo",
        "trade idea", "live chart", "nse corporate announcements", "bottom line",
        "distribution copy", "strategic threads", "annual", "concall",
        "snapshot", "p&l vs consensus", "p&l vs", "pnl",
    )
    out = []
    for key, body in sections.items():
        kl = key.lower()
        if any(kl.startswith(p) for p in SKIP_PREFIXES):
            continue
        if key in ("__preamble__", "__title__"):
            continue
        # Split heading into "Segment · label"
        seg_name, label = key, None
        for sep in ("·", "•", "—", "-"):
            if sep in key:
                parts = [p.strip() for p in key.split(sep, 1)]
                if len(parts) == 2:
                    seg_name, label = parts
                    break
        # Extract bullet stats above the financials block as key_stats
        key_stats: list[dict[str, Any]] = []
        # The convention: "**Metric** — value commentary" inside the first bulleted list
        first_list = re.search(r"((?:^- .+\n?)+)", body, re.MULTILINE)
        if first_list:
            for li in re.findall(r"^-\s+(.+)$", first_list.group(1), re.MULTILINE):
                # **Bold metric** then '—' or '-' then value
                mm = re.match(r"\*\*([^*]+)\*\*\s*[—–-]\s*(.+)", li)
                if mm:
                    val_part = mm.group(2).strip()
                    sub = None
                    # If there's a parenthetical, treat as sub
                    pm = re.match(r"([^(]+?)\s*\(([^)]+)\)\s*$", val_part)
                    if pm:
                        val = pm.group(1).strip()
                        sub = pm.group(2).strip()
                    else:
                        val = val_part
                    key_stats.append({
                        "label": mm.group(1).strip(),
                        "value": val,
                        "sub": sub,
                        "positive": True,
                    })
        out.append({
            "segment": seg_name.strip(),
            "label": label,
            "key_stats": key_stats[:6] if key_stats else None,
            "body_md": body.strip(),
        })
    return out


def parse_management(body: str) -> list[dict[str, str]]:
    """Parse 'What management said' — quote → speaker → interpretation pattern."""
    out = []
    # Match: > *"quote"*\n> — Name, Title\n\nInterpretation paragraph
    pattern = re.compile(
        r">\s*\*?\*?[\"“”]([^\"“”]+)[\"“”]\*?\*?\s*\n>\s*[—–-]\s*(.+?)(?:\n\n|\Z)(.*?)(?=\n>\s*\*?\*?[\"“”]|\Z)",
        re.DOTALL,
    )
    for m in pattern.finditer(body):
        quote = m.group(1).strip()
        speaker_line = m.group(2).strip()
        interp = m.group(3).strip()
        # Speaker → "Name, Title"
        speaker, title = speaker_line, None
        if "," in speaker_line:
            parts = [p.strip() for p in speaker_line.split(",", 1)]
            speaker, title = parts[0], parts[1]
        out.append({
            "speaker": speaker,
            "title": title,
            "quote": quote,
            "interpretation": interp,
        })
    return out


def parse_qa_intelligence(body: str) -> dict[str, Any]:
    """Parse 'Concall Q&A intelligence' — currently just watchlist questions list."""
    out: dict[str, Any] = {"watchlist": [], "qa": []}
    # Watchlist questions: bulleted list under "**Watchlist questions for the call:**"
    wm = re.search(
        r"\*\*Watchlist questions for the call:\*\*\s*\n(.*?)(?=\n\n##|\Z)",
        body,
        re.DOTALL,
    )
    if wm:
        for line in wm.group(1).splitlines():
            lm = re.match(r"^-\s+(.+)$", line.strip())
            if lm:
                out["watchlist"].append(lm.group(1).strip())
    return out


def parse_forward_tracker(body: str) -> list[dict[str, str]]:
    """Parse 'Forward tracker' — emoji-led bullets."""
    out = []
    for line in body.splitlines():
        m = re.match(r"^-\s+(\S+)\s+(.+)$", line.strip())
        if m:
            emoji, rest = m.group(1), m.group(2)
            text = re.sub(r"^\*\*([^*]+)\*\*\s*[—–-]\s*", r"\1 — ", rest).strip()
            out.append({"emoji": emoji, "color": "blue", "text": text})
    return out


def parse_sector_echo(body: str) -> list[dict[str, str]]:
    """Parse 'Sector echo' table. Color from emoji."""
    EMOJI_COLOR = {"🟢": "green", "🔴": "red", "🟡": "amber", "🟠": "amber"}
    rows = parse_md_table(body)
    out = []
    for row in rows[1:]:
        if len(row) < 2:
            continue
        stock_cell, note = row[0], row[1]
        color = "amber"
        for em, c in EMOJI_COLOR.items():
            if stock_cell.startswith(em):
                color = c
                stock_cell = stock_cell[len(em):].strip()
                break
        # Stock cell may contain multiple tickers e.g. "ONGC, OIL India"
        # Take first token before comma as primary ticker name
        ticker_name = stock_cell.split(",")[0].strip()
        ticker_upper = re.sub(r"\s+", "", ticker_name.upper())[:20]
        out.append({
            "ticker": ticker_upper,
            "name": ticker_name,
            "color": color,
            "note": strip_md_emphasis(note),
        })
    return out


def parse_trade_idea(body: str) -> dict[str, Any] | None:
    """Parse the fenced code block in 'Trade idea'."""
    cb = re.search(r"```\s*(.+?)\s*```", body, re.DOTALL)
    if not cb:
        return None
    block = cb.group(1)
    out: dict[str, Any] = {"targets": []}
    # 'Setup    text'
    sm = re.search(r"Setup\s+(.+?)(?=\n\s*Entry|\n\n)", block, re.DOTALL)
    if sm:
        out["setup"] = re.sub(r"\s+", " ", sm.group(1).strip())
    em = re.search(r"Entry\s+(.+?)(?:\n|$)", block)
    if em:
        out["entry"] = em.group(1).strip()
    sl = re.search(r"Stop\s+(.+?)(?:\n|$)", block)
    if sl:
        out["stop_loss"] = sl.group(1).strip()
    for tm in re.finditer(r"Target\s*\d*\s+(.+?)(?:\n|$)", block):
        target_str = tm.group(1).strip()
        # 'price (+pct%, catalyst)'
        m = re.match(r"(\S+)\s*\(([+-]?\d+(?:\.\d+)?)%(?:,\s*(.+))?\)", target_str)
        if m:
            t: dict[str, Any] = {"price": m.group(1)}
            t["upside_pct"] = float(m.group(2))
            if m.group(3):
                t["catalyst"] = m.group(3).strip()
            out["targets"].append(t)
        else:
            out["targets"].append({"price": target_str.split()[0]})
    rrm = re.search(r"RR\s+(.+?)(?:\n|$)", block)
    if rrm:
        out["risk_reward"] = rrm.group(1).strip()
    sz = re.search(r"Sizing\s+(.+?)(?:\n|$)", block)
    if sz:
        out["sizing"] = sz.group(1).strip()
    hd = re.search(r"Hedge\s+(.+?)(?:\n|$)", block)
    if hd:
        out["hedge"] = hd.group(1).strip()
    # Verify-levels disclaimer indicator
    out["verify_levels"] = "verify levels" in body.lower()
    # Horizon from the header '· 3–6 month view'
    hh = re.search(r"·\s*(.+?month.+?view)", body)
    if hh:
        out["view_horizon"] = hh.group(1).strip()
    return out


def parse_announcements(body: str) -> list[dict[str, str]]:
    """Parse 'NSE corporate announcements' bulleted list."""
    out = []
    for line in body.splitlines():
        m = re.match(r"^-\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)$", line.strip())
        if m:
            out.append({"date": m.group(1).strip(), "text": m.group(2).strip()})
    return out


def parse_bottom_line(body: str) -> list[dict[str, str]]:
    """Parse 'Bottom line' emoji-bullets. Skips the trailing '*Last updated*' line."""
    out = []
    for line in body.splitlines():
        s = line.strip()
        if not s:
            continue
        # Skip italic-wrapped meta lines like '*Last updated: ...*'
        if s.startswith("*") and s.endswith("*"):
            continue
        if "Last updated" in s or "pending transcript" in s.lower():
            continue
        m = re.match(r"^(\S+)\s+(.+)$", s)
        if not m:
            continue
        emoji = m.group(1)
        # Reject pure-word "emojis" (real emoji chars are non-alphanumeric)
        if re.match(r"^[\w*]", emoji):
            continue
        out.append({"emoji": emoji, "text": m.group(2)})
    return out


def parse_strategic_threads(body: str) -> list[dict[str, Any]]:
    """Parse 'Strategic threads' subsections (### Title) into the schema shape."""
    out: list[dict[str, Any]] = []
    for heading, content in split_subsections(body):
        if not content.strip():
            continue
        thread: dict[str, Any] = {
            "title": heading,
            "category": "other",
            "the_move": "",
            "evidence": "",
            "forward_read": "",
            "impact_horizon": "12-24m",
            "segments_affected": [],
            "hindrances": [],
            "next_q_check": "",
            "confidence": "medium",
        }

        cm = re.search(r"\*\*Category:\*\*\s*([^\n]+)", content)
        if cm:
            cat = cm.group(1).split("|")[0].strip().lower()
            if cat in ("capital", "product", "m&a", "pricing", "capex", "regulatory", "partnership", "other"):
                thread["category"] = cat

        hm = re.search(r"\*\*Horizon:\*\*\s*([^\n]+)", content)
        if hm:
            hor = hm.group(1).split("|")[0].strip()
            if hor in ("0-3m", "3-6m", "6-12m", "12-24m", "24m+"):
                thread["impact_horizon"] = hor

        confm = re.search(r"\*\*Confidence:\*\*\s*([^\n]+)", content)
        if confm:
            conf = confm.group(1).split("|")[0].strip().lower()
            if conf in ("high", "medium", "low"):
                thread["confidence"] = conf

        am = re.search(r"\*\*Affects:\*\*\s*([^\n]+)", content)
        if am:
            thread["segments_affected"] = [
                s.strip().rstrip(",") for s in re.split(r",|·|•", am.group(1)) if s.strip()
            ]

        mm = re.search(r"\*\*The move:\*\*\s*(.+?)(?=\n\n|\*\*Evidence|\Z)", content, re.DOTALL)
        if mm:
            thread["the_move"] = mm.group(1).strip()

        em = re.search(
            r"\*\*Evidence:\*\*\s*[\"“”]([^\"“”]+)[\"“”]\s*[—–-]\s*(.+?)(?=\n\n|\*\*The read|\Z)",
            content,
            re.DOTALL,
        )
        if em:
            thread["evidence"] = em.group(1).strip()
            thread["evidence_speaker"] = em.group(2).strip()

        rm = re.search(r"\*\*The read:\*\*\s*(.+?)(?=\n\n|\*\*What could break|\Z)", content, re.DOTALL)
        if rm:
            thread["forward_read"] = rm.group(1).strip()

        bm = re.search(
            r"\*\*What could break this:\*\*\s*\n(.+?)(?=\n\n|\*\*Next-quarter check|\Z)",
            content,
            re.DOTALL,
        )
        if bm:
            for line in bm.group(1).splitlines():
                lm = re.match(r"^-\s+(.+)$", line.strip())
                if lm:
                    thread["hindrances"].append(lm.group(1).strip())

        nm = re.search(r"\*\*Next-quarter check:\*\*\s*(.+?)(?=\n\n|\Z)", content, re.DOTALL)
        if nm:
            thread["next_q_check"] = nm.group(1).strip()

        out.append(thread)
    return out


def parse_pnl_layer(body: str) -> dict[str, Any] | None:
    """
    Parse '## P&L vs Consensus' section. Expects:

      | Metric | Estimate | Actual | Surprise | YoY | Verdict | Driver |
      | Revenue | ₹70,500 Cr | ₹70,698 Cr | +0.3% | +9.6% | INLINE | INR weakness |
      ...

      > **Caveat:** ...

      **Verdict:** POSITIVE — short oneliner
    """
    if not body.strip():
        return None

    metrics: list[dict[str, Any]] = []
    for row in parse_md_table(body)[1:]:  # skip header
        if len(row) < 3:
            continue
        m: dict[str, Any] = {
            "metric": strip_md_emphasis(row[0]),
            "estimate": strip_md_emphasis(row[1]) if len(row) >= 2 else None,
            "actual": strip_md_emphasis(row[2]) if len(row) >= 3 else None,
        }
        if len(row) >= 4:
            sp = parse_yoy_pct(row[3])
            if sp is not None:
                m["surprise_pct"] = sp
        if len(row) >= 5:
            yo = parse_yoy_pct(row[4])
            if yo is not None:
                m["yoy_pct"] = yo
        if len(row) >= 6:
            v = strip_md_emphasis(row[5]).upper().strip(" .")
            if v in ("BEAT", "INLINE", "MISS"):
                m["verdict"] = v
        if len(row) >= 7:
            drv = strip_md_emphasis(row[6])
            if drv and drv != "—":
                m["driver"] = drv
        # Filter out empty/dash actuals
        if m.get("actual") and m["actual"] != "—":
            metrics.append(m)

    if not metrics:
        return None

    out: dict[str, Any] = {"metrics": metrics}

    # Caveats — blockquoted '> **Caveat:** ...' lines
    caveats: list[str] = []
    for cm in re.finditer(
        r">\s*\*\*(?:Caveat|One catch|Note):\*\*\s*(.+?)(?=\n>\s*\*\*|\n\n|\Z)",
        body,
        re.DOTALL,
    ):
        text = re.sub(r"\n>\s*", " ", cm.group(1)).strip()
        caveats.append(text)
    if caveats:
        out["caveats"] = caveats

    # Verdict oneliner — '**Verdict:** POSITIVE — short oneliner'
    vm = re.search(
        r"\*\*Verdict:\*\*\s*(POSITIVE|MIXED|NEGATIVE|NEUTRAL)\s*[—–-]?\s*(.*)",
        body,
        re.IGNORECASE,
    )
    if vm and vm.group(2).strip():
        out["verdict_oneliner"] = vm.group(2).strip()

    return out


def parse_snapshot(body: str) -> dict[str, Any]:
    """
    Parse '## Snapshot' section. Recognised keys (any subset):

      Headline basis: OPERATIONAL | REPORTED
      Guidance: RAISED | MAINTAINED | CUT | WITHDRAWN | NOT_GIVEN
      Estimate revision: UP|FLAT|DOWN, magnitude LT_2|2_TO_5|GT_5, metric "FY27 EPS"
      Stock reaction: +2.4% (+1.8% vs Nifty IT)
      Position bias: BUY | ADD | HOLD | REDUCE | SELL | UNDER_REVIEW
      Conviction: HIGH | MEDIUM | LOW
      Next catalyst: 2026-07-10 — Q1 FY27 results
      Rollup: POSITIVE | MIXED | NEGATIVE | NEUTRAL — short oneliner
      Three things that mattered:
        - thing one
        - thing two
        - thing three
    """
    out: dict[str, Any] = {}
    if not body.strip():
        return out

    def grab(key: str) -> str | None:
        m = re.search(
            rf"\*\*{re.escape(key)}:\*\*\s*(.+?)(?=\n\s*\*\*|\Z)",
            body,
            re.DOTALL | re.IGNORECASE,
        )
        return m.group(1).strip() if m else None

    if v := grab("Headline basis"):
        v = v.upper().strip(" .")
        if v in ("OPERATIONAL", "REPORTED"):
            out["headline_verdict_basis"] = v

    if v := grab("Guidance"):
        v = v.upper().strip(" .").replace(" ", "_")
        if v in ("RAISED", "MAINTAINED", "CUT", "WITHDRAWN", "NOT_GIVEN", "N/A"):
            out["guidance_verdict"] = "NOT_GIVEN" if v == "N/A" else v

    if v := grab("Estimate revision"):
        # e.g. "UP, 2-5%, FY27 EPS"  or  "UP · 2_TO_5 · FY27 EPS"
        parts = [p.strip() for p in re.split(r"[,·]", v)]
        if parts:
            d = parts[0].upper()
            if d in ("UP", "FLAT", "DOWN"):
                out["estimate_revision_direction"] = d
        if len(parts) >= 2:
            mag = parts[1].upper().replace("-", "_TO_").replace("%", "").strip()
            mag = mag.replace("_TO__TO_", "_TO_")
            mag_map = {
                "<2": "LT_2", "LT_2": "LT_2",
                "2_TO_5": "2_TO_5", "2_5": "2_TO_5",
                ">5": "GT_5", "GT_5": "GT_5",
            }
            if mag in mag_map:
                out["estimate_revision_magnitude"] = mag_map[mag]
        if len(parts) >= 3:
            out["estimate_revision_metric"] = parts[2]

    if v := grab("Stock reaction"):
        # e.g. "+2.4% (+1.8% vs Nifty IT)"
        m = re.match(r"\s*([+-]?\d+(?:\.\d+)?)%\s*(?:\(([+-]?\d+(?:\.\d+)?)%\s*vs\s*(.+?)\))?", v)
        if m:
            out["stock_reaction_pct"] = float(m.group(1))
            if m.group(2):
                out["stock_reaction_vs_index_pct"] = float(m.group(2))
            if m.group(3):
                out["stock_reaction_index_name"] = m.group(3).strip()

    if v := grab("Position bias"):
        v = v.upper().strip(" .").replace(" ", "_")
        if v in ("BUY", "ADD", "HOLD", "REDUCE", "SELL", "UNDER_REVIEW"):
            out["position_bias"] = v

    if v := grab("Conviction"):
        v = v.upper().strip(" .")
        if v in ("HIGH", "MEDIUM", "LOW"):
            out["conviction"] = v

    if v := grab("Next catalyst"):
        # e.g. "2026-07-10 — Q1 FY27 results"  or "Q1 FY27 results"
        m = re.match(r"\s*(\d{4}-\d{2}-\d{2})\s*[—–-]\s*(.+)", v)
        if m:
            out["next_catalyst_date"] = m.group(1)
            out["next_catalyst_event"] = m.group(2).strip()
        else:
            out["next_catalyst_event"] = v.strip()

    if v := grab("Rollup"):
        # e.g. "POSITIVE — short oneliner"
        m = re.match(r"\s*(POSITIVE|MIXED|NEGATIVE|NEUTRAL)\s*[—–-]?\s*(.*)", v, re.IGNORECASE)
        if m:
            out["rollup_verdict"] = m.group(1).upper()
            if m.group(2).strip():
                out["rollup_verdict_oneliner"] = m.group(2).strip()

    # Three things that mattered — bulleted list
    tm = re.search(
        r"\*\*Three things that mattered:\*\*\s*\n((?:^\s*-\s+.+\n?)+)",
        body,
        re.MULTILINE,
    )
    if tm:
        items = []
        for line in tm.group(1).splitlines():
            lm = re.match(r"^\s*-\s+(.+)$", line)
            if lm:
                items.append(lm.group(1).strip())
        if items:
            out["three_things_that_mattered"] = items[:3]

    return out


def parse_distribution(body: str) -> dict[str, Any] | None:
    """Parse 'Distribution copy' subsections."""
    if not body.strip():
        return None
    out: dict[str, Any] = {}
    subs = split_subsections(body)
    for heading, content in subs:
        hl = heading.lower()
        if "twitter" in hl or "x thread" in hl:
            tweets = re.findall(r"\*\*\d+/\*\*\s*(.+?)(?=\n\n\*\*\d+/|\Z)", content, re.DOTALL)
            out["twitter"] = [t.strip() for t in tweets]
        elif "linkedin" in hl:
            out["linkedin"] = content.strip()
        elif "whatsapp" in hl:
            out["whatsapp"] = content.strip()
    return out or None


# ────────────────────────────────────────────────────────────────────
# Main pipeline
# ────────────────────────────────────────────────────────────────────
def fetch_company_id(symbol: str) -> int | None:
    rows = supa("GET", f"companies?select=id&symbol=eq.{symbol}")
    if rows:
        return rows[0]["id"]
    return None


def parse_markdown(md: str) -> dict[str, Any]:
    sections = split_sections(md)
    preamble = sections.get("__preamble__", "")
    header = parse_title_header(preamble)

    tldr = parse_tldr(find_section(sections, "TL;DR"))
    highlights = parse_60_second(find_section(sections, "The 60-second read", "60-second"))
    headline = parse_headline_numbers(find_section(sections, "Headline numbers"))
    segments = parse_segment_scorecard(find_section(sections, "Segment scorecard"))
    seg_narratives = parse_segment_narratives(sections)
    quotes = parse_management(find_section(sections, "What management said"))
    qa = parse_qa_intelligence(find_section(sections, "Concall Q&A"))
    forward = parse_forward_tracker(find_section(sections, "Forward tracker"))
    echo = parse_sector_echo(find_section(sections, "Sector echo"))
    trade = parse_trade_idea(find_section(sections, "Trade idea"))
    announcements = parse_announcements(find_section(sections, "NSE corporate announcements", "Recent announcements"))
    bottom = parse_bottom_line(find_section(sections, "Bottom line"))
    threads = parse_strategic_threads(find_section(sections, "Strategic threads"))
    distribution = parse_distribution(find_section(sections, "Distribution copy"))
    snapshot = parse_snapshot(find_section(sections, "Snapshot"))
    pnl_layer = parse_pnl_layer(find_section(sections, "P&L vs Consensus", "P&L vs consensus"))

    return {
        "header": header,
        "tldr": tldr,
        "highlights": highlights,
        "headline": headline,
        "segments": segments,
        "seg_narratives": seg_narratives,
        "quotes": quotes,
        "qa": qa,
        "forward": forward,
        "echo": echo,
        "trade": trade,
        "announcements": announcements,
        "bottom": bottom,
        "threads": threads,
        "distribution": distribution,
        "snapshot": snapshot,
        "pnl_layer": pnl_layer,
    }


def derive_status(headline: dict[str, Any], tldr: dict[str, Any]) -> str:
    """
    Derive result_status from the headline beat-miss column.
    Conservative: any non-beat metric on a numeric row (revenue/EBITDA/PAT) → IN LINE.
    Two or more miss markers → MISS.
    """
    misses = 0
    has_inline = False
    all_beat = True
    counted = 0
    primary_metrics = {"revenue", "ebitda", "pat"}
    for kn in headline.get("key_numbers", []):
        if (kn.get("label") or "").strip().lower() not in primary_metrics:
            continue
        v = (kn.get("verdict") or "").lower()
        if not v or v == "—":
            continue
        counted += 1
        if "miss" in v:
            misses += 1
            all_beat = False
        elif "beat" in v:
            pass
        else:  # warn / lower / inline / inline-est etc.
            has_inline = True
            all_beat = False
    if counted == 0:
        return "IN LINE"
    if misses >= 2:
        return "MISS"
    if all_beat:
        return "BEAT"
    return "IN LINE"


def publish(parsed: dict[str, Any], dry_run: bool = False) -> str:
    h = parsed["header"]
    symbol = h.get("symbol")
    quarter = h.get("quarter")
    if not symbol or not quarter:
        raise SystemExit(f"Cannot extract symbol/quarter from header: {h}")

    company_id = fetch_company_id(symbol)
    if not company_id:
        raise SystemExit(
            f"Company {symbol} not found in 'companies' table. Insert it first."
        )

    headline = parsed["headline"]
    tldr = parsed["tldr"]

    season_row = {
        "company_id": company_id,
        "quarter": quarter,
        "result_status": derive_status(headline, tldr),
        "result_date": h.get("result_date"),
        "revenue_act": headline.get("revenue_act"),
        "ebitda_act": headline.get("ebitda_act"),
        "pat_act": headline.get("pat_act"),
        "revenue_yoy_pct": headline.get("revenue_yoy_pct"),
        "pat_yoy_pct": headline.get("pat_yoy_pct"),
        "verdict_score": tldr.get("verdict_score"),
        "verdict_summary": tldr.get("verdict_summary"),
    }
    # Filter null + empty so re-running with partial markdown doesn't wipe fields
    season_row = {k: v for k, v in season_row.items() if v not in (None, [], "", {})}

    long_form_intro = None
    headline_body = parsed.get("__longform_seed__")
    if headline_body:
        long_form_intro = headline_body

    analysis_row: dict[str, Any] = {
        "company_id": company_id,
        "quarter": quarter,
        "summary": tldr.get("verdict_summary"),
        "investment_signal": tldr.get("investment_signal"),
        "report_highlights": parsed["highlights"],
        "annual_context": headline.get("annual_context"),
        "key_numbers": headline.get("key_numbers"),
        "segments": parsed["segments"],
        "segment_narratives": parsed["seg_narratives"],
        "key_quotes": parsed["quotes"],
        "dodged_questions": parsed["qa"]["watchlist"],
        "next_quarter_watchlist": parsed["forward"],
        "sector_echo": parsed["echo"],
        "trade_idea": parsed["trade"],
        "recent_announcements": parsed["announcements"],
        "bottom_line": parsed["bottom"],
        "strategic_threads": parsed["threads"],
        "distribution_copy": parsed["distribution"],
        "pnl_layer": parsed["pnl_layer"],
        # Snapshot card fields (each may or may not be present)
        **parsed["snapshot"],
    }
    analysis_row = {k: v for k, v in analysis_row.items() if v not in (None, [], "", {})}

    if dry_run:
        print("=== DRY RUN ===")
        print(f"Symbol: {symbol}, Quarter: {quarter}, company_id: {company_id}")
        print(f"Status: {season_row.get('result_status')}, "
              f"Signal: {analysis_row.get('investment_signal')}")
        print(f"Highlights: {len(parsed['highlights'])}")
        print(f"Segments: {len(parsed['segments'])}")
        print(f"Segment narratives: {len(parsed['seg_narratives'])}")
        print(f"Key quotes: {len(parsed['quotes'])}")
        print(f"Strategic threads: {len(parsed['threads'])}")
        print(f"Forward tracker: {len(parsed['forward'])}")
        print(f"Sector echo: {len(parsed['echo'])}")
        print(f"Watchlist questions: {len(parsed['qa']['watchlist'])}")
        print(f"Announcements: {len(parsed['announcements'])}")
        print(f"Bottom line: {len(parsed['bottom'])}")
        print(f"Trade idea: {'yes' if parsed['trade'] else 'no'}")
        print(f"Distribution: {list(parsed['distribution'].keys()) if parsed['distribution'] else 'none'}")
        snap = parsed["snapshot"]
        print(f"Snapshot: {len(snap)} fields — keys={list(snap.keys())}")
        if parsed["pnl_layer"]:
            print(f"P&L Layer: {len(parsed['pnl_layer']['metrics'])} metrics")
        return f"/company/{symbol}/{quarter.replace(' ', '-')}"

    print(f"Upserting earnings_season for {symbol} {quarter}…")
    supa_upsert_resilient("earnings_season", season_row, "company_id,quarter")

    print(f"Upserting earnings_analyses for {symbol} {quarter}…")
    supa_upsert_resilient("earnings_analyses", analysis_row, "company_id,quarter")

    return f"/company/{symbol}/{quarter.replace(' ', '-')}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("markdown_path", help="Path to the canonical markdown article")
    ap.add_argument("--dry-run", action="store_true", help="Parse + summarise; don't upsert")
    args = ap.parse_args()

    md_path = Path(args.markdown_path)
    if not md_path.exists():
        print(f"File not found: {md_path}")
        sys.exit(1)

    md = md_path.read_text(encoding="utf-8")
    parsed = parse_markdown(md)
    url_path = publish(parsed, dry_run=args.dry_run)

    print(f"\nDone.\n  https://earningscanvas.in{url_path}")


if __name__ == "__main__":
    main()
