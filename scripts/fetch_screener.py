#!/usr/bin/env python3
"""
fetch_screener.py — Pull latest concall transcript + investor PPT from
Screener.in for a given ticker. Authenticates via your Pro session cookies
saved in .screener_session.json (gitignored).

Usage:
  python scripts/fetch_screener.py RELIANCE Q4FY26
  python scripts/fetch_screener.py TCS Q4FY26 --dry-run
  python scripts/fetch_screener.py INFY Q4FY26 --no-extract

Output:
  G:/2. Earnings Canvas/raw_inputs/{TICKER}_{QUARTER}/
    ├── concall_transcript.pdf  (or .{ext} from source)
    ├── investor_ppt.pdf
    ├── concall_transcript.txt   (extracted text, if pdfplumber installed)
    ├── investor_ppt.txt
    └── meta.json                (urls, dates, headers)

Requires:
  pip install requests beautifulsoup4 pdfplumber

Cookie file format: either JSON or key=value pairs (one per line).
Example .screener_session.json:
  {"csrftoken": "...", "sessionid": "..."}
or:
  csrftoken=...
  sessionid=...
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("Missing requests. Run: pip install requests beautifulsoup4 pdfplumber")

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("Missing beautifulsoup4. Run: pip install requests beautifulsoup4 pdfplumber")

try:
    import pdfplumber
    HAVE_PDFPLUMBER = True
except ImportError:
    HAVE_PDFPLUMBER = False


REPO_ROOT = Path(__file__).resolve().parent.parent
SESSION_FILE = REPO_ROOT / ".screener_session.json"
RAW_INPUTS_DEFAULT = Path("G:/2. Earnings Canvas/raw_inputs")

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


def log(msg: str) -> None:
    print(f"[fetch] {msg}")


# ────────────────────────────────────────────────────────────────────
# Cookie loading — accepts JSON, key=value lines, or `name: value` lines
# ────────────────────────────────────────────────────────────────────
def load_cookies() -> dict[str, str]:
    if not SESSION_FILE.exists():
        log(f"WARN no cookie file at {SESSION_FILE} — running unauthenticated")
        return {}

    raw = SESSION_FILE.read_text(encoding="utf-8").strip()
    if not raw:
        return {}

    # JSON format
    if raw.startswith("{"):
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            log(f"WARN .screener_session.json malformed JSON: {e}")
            return {}

    # key=value or name: value lines
    cookies: dict[str, str] = {}
    for line in raw.splitlines():
        line = line.strip().lstrip(",").rstrip(",").strip(";")
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            k, v = line.split("=", 1)
        elif ":" in line:
            k, v = line.split(":", 1)
        else:
            continue
        k = k.strip().strip('"').strip("'")
        v = v.strip().strip('"').strip("'").rstrip(";")
        if k:
            cookies[k] = v
    return cookies


# ────────────────────────────────────────────────────────────────────
# Screener page fetch + parse
# ────────────────────────────────────────────────────────────────────
def fetch_company_page(ticker: str, cookies: dict[str, str]) -> str:
    # Try consolidated first (typical for diversified large-caps)
    for path in (f"/company/{ticker}/consolidated/", f"/company/{ticker}/"):
        url = f"https://www.screener.in{path}"
        log(f"GET {url}")
        r = requests.get(
            url,
            cookies=cookies,
            headers={"User-Agent": UA, "Accept": "text/html"},
            timeout=30,
        )
        if r.status_code == 200 and ticker.upper() in r.text.upper():
            return r.text
        log(f"  status={r.status_code} bytes={len(r.text)}")
    raise RuntimeError(f"Could not fetch a Screener page for {ticker}")


MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def parse_date_text(text: str) -> datetime | None:
    """Parse Screener-style date strings: 'Apr 2026', 'April 2026', '24 Apr 2026'."""
    if not text:
        return None
    t = text.strip().replace("\xa0", " ")
    # Try '24 Apr 2026'
    m = re.search(r"(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})", t)
    if m:
        d, mon, y = int(m.group(1)), m.group(2)[:3].lower(), int(m.group(3))
        if mon in MONTHS:
            return datetime(y, MONTHS[mon], d)
    # Try 'Apr 2026'
    m = re.search(r"([A-Za-z]{3,9})\s+(\d{4})", t)
    if m:
        mon, y = m.group(1)[:3].lower(), int(m.group(2))
        if mon in MONTHS:
            return datetime(y, MONTHS[mon], 1)
    return None


def absolutize(href: str) -> str:
    if not href:
        return href
    if href.startswith("http://") or href.startswith("https://"):
        return href
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("/"):
        return "https://www.screener.in" + href
    return "https://www.screener.in/" + href


def extract_documents(html: str) -> dict[str, list[dict]]:
    """
    Find concalls + investor presentations + annual reports.

    Returns:
      {
        "concalls": [{"date": datetime, "title": str, "url": str, "kind": "transcript"|"ppt"|"notes"}, ...],
        "presentations": [{"date": ..., "title": ..., "url": ...}, ...],
        "annual_reports": [...],
      }
    """
    soup = BeautifulSoup(html, "html.parser")

    out: dict[str, list[dict]] = {
        "concalls": [],
        "presentations": [],
        "annual_reports": [],
        "results": [],
    }

    # The Documents section is typically inside a <section id="documents"> or similar.
    # Different layouts exist — be defensive: walk all <a href> and classify.
    for a in soup.find_all("a", href=True):
        href = absolutize(a["href"].strip())
        text = (a.get_text(" ", strip=True) or "").strip()
        # Cluster surrounding text — sometimes the date is in a sibling
        parent_text = ""
        for ancestor in a.parents:
            ptext = ancestor.get_text(" ", strip=True)
            if ptext and len(ptext) < 200:
                parent_text = ptext
                break
        full_text = f"{text} | {parent_text}"

        # Skip obvious noise
        if not href or href.startswith("javascript:"):
            continue

        # Classify
        lower = full_text.lower()
        url_lower = href.lower()
        date = parse_date_text(text) or parse_date_text(parent_text)

        kind = None
        if "transcript" in lower or "concall transcript" in lower:
            kind = "transcript"
            cat = "concalls"
        elif "concall" in lower and ("ppt" in lower or "presentation" in lower):
            kind = "ppt"
            cat = "concalls"
        elif "concall" in lower and "notes" in lower:
            kind = "notes"
            cat = "concalls"
        elif "concall" in lower or "earnings call" in lower:
            kind = "concall"
            cat = "concalls"
        elif (
            "investor presentation" in lower
            or "earnings presentation" in lower
            or ("presentation" in lower and "ppt" in url_lower)
            or url_lower.endswith(".ppt") or url_lower.endswith(".pptx") or url_lower.endswith(".pdf") and "presentation" in lower
        ):
            kind = "ppt"
            cat = "presentations"
        elif "annual report" in lower:
            kind = "annual"
            cat = "annual_reports"
        elif "result" in lower and (url_lower.endswith(".pdf") or "pdf" in url_lower):
            kind = "result"
            cat = "results"
        else:
            continue

        out[cat].append({
            "date": date.isoformat() if date else None,
            "title": text or "(no title)",
            "url": href,
            "kind": kind,
        })

    # Dedupe by url
    for cat, items in out.items():
        seen = set()
        deduped = []
        for it in items:
            if it["url"] in seen:
                continue
            seen.add(it["url"])
            deduped.append(it)
        # Sort by date desc (None last)
        deduped.sort(key=lambda x: x["date"] or "", reverse=True)
        out[cat] = deduped

    return out


# ────────────────────────────────────────────────────────────────────
# Download + extract
# ────────────────────────────────────────────────────────────────────
def download(url: str, dest: Path, cookies: dict[str, str]) -> Path:
    log(f"download → {dest.name}")
    r = requests.get(
        url,
        cookies=cookies,
        headers={"User-Agent": UA, "Referer": "https://www.screener.in/"},
        allow_redirects=True,
        timeout=60,
        stream=True,
    )
    r.raise_for_status()
    # Honour content-type for extension if dest had none
    if dest.suffix.lower() not in (".pdf", ".pptx", ".ppt", ".html", ".htm"):
        ctype = r.headers.get("content-type", "").lower()
        if "pdf" in ctype:
            dest = dest.with_suffix(".pdf")
        elif "pptx" in ctype or "presentation" in ctype:
            dest = dest.with_suffix(".pptx")
        elif "html" in ctype:
            dest = dest.with_suffix(".html")
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("wb") as f:
        for chunk in r.iter_content(chunk_size=64 * 1024):
            if chunk:
                f.write(chunk)
    return dest


def extract_pdf_text(pdf_path: Path) -> Path | None:
    if not HAVE_PDFPLUMBER:
        return None
    if pdf_path.suffix.lower() != ".pdf":
        return None
    txt_path = pdf_path.with_suffix(".txt")
    log(f"extract → {txt_path.name}")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages_text = []
            for page in pdf.pages:
                pages_text.append(page.extract_text() or "")
        txt_path.write_text("\n\n--- PAGE BREAK ---\n\n".join(pages_text), encoding="utf-8")
        return txt_path
    except Exception as e:
        log(f"  extract failed: {e}")
        return None


# ────────────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────────────
def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ticker", help="NSE symbol e.g. RELIANCE / TCS / INFY")
    ap.add_argument(
        "quarter", nargs="?", default="Q4FY26",
        help="Quarter slug for output folder, e.g. Q4FY26",
    )
    ap.add_argument(
        "--out-root", default=str(RAW_INPUTS_DEFAULT),
        help="Root folder for raw_inputs",
    )
    ap.add_argument("--n", type=int, default=1, help="Number of latest concalls to pull")
    ap.add_argument("--dry-run", action="store_true", help="Discover, don't download")
    ap.add_argument("--no-extract", action="store_true", help="Skip PDF text extraction")
    args = ap.parse_args()

    ticker = args.ticker.upper()
    out_dir = Path(args.out_root) / f"{ticker}_{args.quarter}"

    cookies = load_cookies()
    log(f"loaded {len(cookies)} cookies: {sorted(cookies.keys())}")

    html = fetch_company_page(ticker, cookies)
    log(f"page fetched ({len(html)} chars)")

    docs = extract_documents(html)
    counts = {k: len(v) for k, v in docs.items()}
    log(f"found docs: {counts}")

    # Pick latest concall transcript + latest investor presentation
    latest_transcript = next(
        (d for d in docs["concalls"] if d["kind"] == "transcript"), None
    )
    latest_concall_any = (
        latest_transcript
        or next((d for d in docs["concalls"]), None)
    )
    latest_ppt = (
        next((d for d in docs["concalls"] if d["kind"] == "ppt"), None)
        or next((d for d in docs["presentations"]), None)
    )

    log("\n=== picks ===")
    if latest_concall_any:
        log(f"concall: {latest_concall_any['date']} | {latest_concall_any['title']}")
        log(f"  → {latest_concall_any['url']}")
    else:
        log("concall: NONE FOUND")
    if latest_ppt:
        log(f"ppt: {latest_ppt['date']} | {latest_ppt['title']}")
        log(f"  → {latest_ppt['url']}")
    else:
        log("ppt: NONE FOUND")

    if args.dry_run:
        log("\n--dry-run set, exiting before download")
        # Show top-5 of each category for debugging
        for cat in ("concalls", "presentations"):
            log(f"\n  Top {cat}:")
            for d in docs[cat][:5]:
                log(f"    [{d['date']}] {d['kind']:11} | {d['title'][:60]}")
        return

    out_dir.mkdir(parents=True, exist_ok=True)

    meta: dict = {
        "ticker": ticker,
        "quarter": args.quarter,
        "fetched_at": datetime.utcnow().isoformat(),
        "all_docs": docs,
        "downloads": {},
    }

    if latest_concall_any:
        try:
            target = out_dir / "concall_transcript.pdf"
            saved = download(latest_concall_any["url"], target, cookies)
            meta["downloads"]["concall_transcript"] = {
                "saved_to": str(saved),
                "source": latest_concall_any,
            }
            if not args.no_extract:
                txt = extract_pdf_text(saved)
                if txt:
                    meta["downloads"]["concall_transcript"]["text_path"] = str(txt)
        except Exception as e:
            log(f"concall download failed: {e}")

    if latest_ppt:
        try:
            target = out_dir / "investor_ppt.pdf"
            saved = download(latest_ppt["url"], target, cookies)
            meta["downloads"]["investor_ppt"] = {
                "saved_to": str(saved),
                "source": latest_ppt,
            }
            if not args.no_extract:
                txt = extract_pdf_text(saved)
                if txt:
                    meta["downloads"]["investor_ppt"]["text_path"] = str(txt)
        except Exception as e:
            log(f"ppt download failed: {e}")

    (out_dir / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    log(f"\nDone. → {out_dir}")


if __name__ == "__main__":
    main()
