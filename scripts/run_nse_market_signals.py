#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
from io import BytesIO
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import requests
from pypdf import PdfReader


NSE_PAGE = "https://www.nseindia.com/companies-listing/corporate-filings-announcements"
NSE_API = "https://www.nseindia.com/api/corporate-announcements"
SUPA_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

ORDER_WIN_KEYWORDS = [
    "bagging/receiving of orders/contracts",
    "receipt of order",
    "receipt of orders",
    "secured order",
    "secured orders",
    "letter of award",
    "work order",
    "purchase order",
    "orders worth",
    "contract worth",
]
ORDER_WIN_EXCLUSIONS = ["orders passed", "order passed", "action(s) taken", "spurt in volume"]
EVENT_RULES = [
    ("capex", ["capex", "capacity expansion", "greenfield", "brownfield", "new plant"]),
    ("fundraising", ["fund raising", "fundraising", "qip", "preferential issue", "rights issue"]),
    ("m_and_a", ["acquisition", "merger", "amalgamation", "joint venture", "slump sale"]),
    ("credit_rating", ["credit rating", "rating action", "ratings"]),
]
ACTIONABLE_EVENT_TYPES = {"order_win", "capex", "fundraising", "m_and_a", "credit_rating"}
FNO_SYMBOLS = {
    "ABB", "ACC", "ADANIENT", "ADANIPORTS", "AMBUJACEM", "APOLLOHOSP", "ASHOKLEY", "ASIANPAINT",
    "AUBANK", "AXISBANK", "BAJAJ-AUTO", "BAJAJFINSV", "BAJFINANCE", "BANDHANBNK", "BANKBARODA",
    "BEL", "BHARATFORG", "BHARTIARTL", "BHEL", "BIOCON", "BOSCHLTD", "BPCL", "BRITANNIA",
    "CANBK", "CHOLAFIN", "CIPLA", "COALINDIA", "COFORGE", "COLPAL", "CONCOR", "CROMPTON",
    "CUMMINSIND", "DABUR", "DALBHARAT", "DIVISLAB", "DLF", "DRREDDY", "EICHERMOT", "ESCORTS",
    "EXIDEIND", "FEDERALBNK", "GAIL", "GLENMARK", "GMRINFRA", "GODREJCP", "GRASIM", "HAL",
    "HAVELLS", "HCLTECH", "HDFCAMC", "HDFCBANK", "HDFCLIFE", "HEROMOTOCO", "HINDALCO",
    "HINDCOPPER", "HINDPETRO", "HINDUNILVR", "ICICIBANK", "ICICIGI", "ICICIPRULI", "IDEA",
    "IDFCFIRSTB", "IEX", "IGL", "INDHOTEL", "INDIGO", "INDUSINDBK", "INDUSTOWER", "INFY",
    "IOC", "IRCTC", "ITC", "JINDALSTEL", "JSWSTEEL", "JUBLFOOD", "KOTAKBANK", "LT", "LTIM",
    "LTTS", "LUPIN", "M&M", "MARICO", "MARUTI", "MAXHEALTH", "MCX", "MOTHERSON", "MPHASIS",
    "MRF", "NATIONALUM", "NAUKRI", "NAVINFLUOR", "NESTLEIND", "NMDC", "NTPC", "OBEROIRLTY",
    "ONGC", "PAGEIND", "PEL", "PERSISTENT", "PETRONET", "PFC", "PIDILITIND", "PIIND",
    "PNB", "POLYCAB", "POWERGRID", "RAMCOCEM", "RBLBANK", "RECLTD", "RELIANCE", "SAIL",
    "SBICARD", "SBILIFE", "SBIN", "SHREECEM", "SHRIRAMFIN", "SIEMENS", "SRF", "SUNPHARMA",
    "SUNTV", "SYNGENE", "TATACHEM", "TATACOMM", "TATACONSUM", "TATAMOTORS", "TATAPOWER",
    "TATASTEEL", "TCS", "TECHM", "TITAN", "TORNTPHARM", "TRENT", "TVSMOTOR", "UBL",
    "ULTRACEMCO", "UPL", "VEDL", "VOLTAS", "WIPRO", "ZEEL", "ZYDUSLIFE",
}
LOW_VALUE_NOISE = [
    "copy of newspaper publication",
    "newspaper publication",
    "kyc details",
    "physical securities",
    "investor presentation",
    "trading window",
    "certificate under regulation",
    "compliance certificate",
    "scrutinizer",
    "share certificate",
    "loss of share certificate",
    "newspaper advertisement",
    "annual report",
]
CLIENT_PATTERNS = [
    r"Agreement\s+with\s+([A-Z][A-Za-z0-9 &.,()/-]{4,90}?)(?:\s+Pursuant|\.|,|;)",
    r"from\s+(NLC India Renewables Limited|Bikaji Foods International Limited|BrahMos Aerospace Private Limited|Brahmos Aerospace Private Limited|Power ?Grid Corporation of India Limited|South Central Railway)",
    r"that\s+([A-Z][A-Za-z0-9 &.,()/-]{4,90}?)\s+has\s+issued\s+(?:\d+\s+)?Letters?\s+of\s+Acceptance",
    r"from\s+([A-Z][A-Za-z0-9 &.,()/-]{4,90}?)(?:\s+for|\s+worth|\s+valued|\s+under|\.|,|;)",
    r"Name of the entity awarding the order\(s\)/contract\(s\);?\s*([A-Z][A-Za-z0-9 &.,()/-]{4,90}?)(?:\s+[a-z]\)|\s+Significant|\.|,|;)",
]
SCOPE_PATTERNS = [
    r"Significant terms and conditions order\(s\)/contract \(s\) awarded in brief;?\s*([A-Za-z0-9 &.,()/%\]\[-]{10,220}?)(?:\s+[a-z]\)|\s+Whether|\.|;)",
    r"Nature of order\(s\)\] contract\(s\);?\s*([A-Za-z0-9 &.,()/%\]\[-]{10,260}?)(?:\s+[a-z]\)|\s+Whether|\.|;)",
    r"for\s+(several Domestic & International T&D projects)",
    r"for\s+(Comprehensive Signalling and Telecommunication Works[^.]{0,160})",
    r"for\s+(supply of [A-Za-z0-9 &.,()/%/-]{10,220}?)(?:\.|;|\n)",
    r"for\s+([A-Za-z0-9 &.,()/%/-]{20,220}?)(?:\.|;|\n)",
    r"towards\s+([A-Za-z0-9 &.,()/%/-]{20,220}?)(?:\.|;|\n)",
]
TIMELINE_PATTERNS = [
    r"Time period by which order\(s\)/contract\(s\) is to be executed;?\s*([A-Za-z0-9 ,./-]{3,80}?)(?:\s+[a-z]\)|\s+Broad|\.|;)",
]


def headers() -> dict[str, str]:
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
        "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": NSE_PAGE,
    }


def require_supabase() -> None:
    if not SUPA_URL or not SERVICE_KEY:
        raise SystemExit("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")


def supa(method: str, path: str, body: Any = None, prefer: str | None = None) -> Any:
    require_supabase()
    url = f"{SUPA_URL}/rest/v1/{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    request_headers = {
        "apikey": SERVICE_KEY or "",
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        request_headers["Prefer"] = prefer
    request = urllib.request.Request(url, data=data, method=method, headers=request_headers)
    try:
        with urllib.request.urlopen(request) as response:
            text = response.read().decode("utf-8")
            return json.loads(text) if text else None
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8")
        raise RuntimeError(f"Supabase HTTP {error.code} on {method} {path}: {detail}") from error


def first(row: dict[str, Any], keys: list[str]) -> str:
    for key in keys:
        value = row.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ""


def uid_for(row: dict[str, Any]) -> str:
    seq = first(row, ["seq_id", "uid"])
    if seq:
        return f"nse_{seq}"
    blob = "|".join(
        [
            first(row, ["symbol", "sm_name"]),
            first(row, ["desc", "subject", "attchmntText"]),
            first(row, ["an_dt", "sort_date", "broadcast_at"]),
            first(row, ["attchmntFile", "attachment_url"]),
        ]
    )
    return "nse_" + hashlib.sha256(blob.encode("utf-8")).hexdigest()[:20]


def parse_nse_datetime(value: str) -> str | None:
    if not value:
        return None
    for fmt in ["%d-%b-%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%d-%m-%Y %H:%M:%S"]:
        try:
            return datetime.strptime(value, fmt).replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            pass
    return None


def fetch_nse(from_date: str, to_date: str) -> list[dict[str, Any]]:
    session = requests.Session()
    session.headers.update(headers())
    page = session.get(NSE_PAGE, timeout=30)
    page.raise_for_status()
    params = urllib.parse.urlencode({"index": "equities", "from_date": from_date, "to_date": to_date})
    response = session.get(f"{NSE_API}?{params}", timeout=45)
    response.raise_for_status()
    payload = response.json()
    return payload if isinstance(payload, list) else payload.get("data", [])


def read_csv(path: Path) -> list[dict[str, Any]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def value_hint(text: str) -> tuple[str | None, float | None]:
    text = re.sub(r"rs\.?\s*ll", "rs. 11", text, flags=re.IGNORECASE)
    text = re.sub(r"rs\.?\s*l([0-9])", r"rs. 1\1", text, flags=re.IGNORECASE)
    text = re.sub(r"rs\.?\s*\.([0-9])", r"rs. 0.\1", text, flags=re.IGNORECASE)
    patterns = [
        r"(?:rs\.?|inr)\s*([0-9,.]+)\s*(crore|cr|million|mn|lakh)",
        r"([0-9,.]+)\s*(crore|cr|million|mn|lakh)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if not match:
            continue
        amount = float(match.group(1).replace(",", ""))
        unit = match.group(2).lower()
        inr_cr = amount
        if unit in {"million", "mn"}:
            inr_cr = amount / 10
        elif unit == "lakh":
            inr_cr = amount / 100
        return f"{match.group(1)} {match.group(2)}", round(inr_cr, 2)
    rupee_match = re.search(
        r"(?:rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{2})+(?:,[0-9]{3})|[0-9,]{7,})(?:/-)?",
        text,
        flags=re.IGNORECASE,
    )
    if rupee_match:
        rupees = float(rupee_match.group(1).replace(",", ""))
        crore = round(rupees / 10_000_000, 2)
        return f"Rs {crore:g} crore", crore
    return None, None


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def download_pdf_text(session: requests.Session, url: str) -> str:
    if not url or not url.lower().endswith(".pdf"):
        return ""
    response = session.get(url, timeout=45)
    response.raise_for_status()
    reader = PdfReader(BytesIO(response.content))
    return clean_text(" ".join(page.extract_text() or "" for page in reader.pages))


def find_first(patterns: list[str], text: str) -> str | None:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return clean_text(match.group(1))
    return None


def infer_geography(text: str) -> str | None:
    lower = text.lower()
    if (
        "export order" in lower
        or "international customer" in lower
        or "domestic & international" in lower
        or "overseas wholly owned subsidiary" in lower
    ):
        return "Export / international"
    if "domestic" in lower:
        return "Domestic"
    return None


def infer_client_type(counterparty: str | None, text: str) -> str | None:
    blob = f"{counterparty or ''} {text}".lower()
    if any(term in blob for term in ["railway", "powergrid", "power grid", "government", "psu", "ncl", "nlc india", "brahmos"]):
        return "Government / PSU"
    if "export" in blob or "international" in blob:
        return "Export customer"
    if counterparty:
        return "Private / disclosed customer"
    return None


def trade_read(signal: dict[str, Any], scope: str | None, client_type: str | None) -> str:
    value = signal.get("order_value_text")
    pieces = []
    if value:
        pieces.append(f"disclosed order size of {value}")
    if client_type:
        pieces.append(client_type.lower())
    if scope:
        pieces.append("clear project scope")
    if signal.get("order_value_inr_cr") and float(signal["order_value_inr_cr"]) >= 500:
        return "High-priority trade watch: " + ", ".join(pieces) + ". Check price-volume confirmation before entry."
    if pieces:
        return "Trade watch: " + ", ".join(pieces) + ". Better if backed by volume breakout or sector tailwind."
    return "Track only until order value, client or scope is clearer."


def concise_summary(signal: dict[str, Any], scope: str | None, timeline: str | None) -> str:
    parts = []
    if signal.get("order_value_text"):
        parts.append(f"{signal['order_value_text']} order")
    else:
        parts.append("Order win")
    if signal.get("counterparty"):
        parts.append(f"from {signal['counterparty']}")
    if scope:
        parts.append(f"for {scope}")
    if timeline:
        parts.append(f"execution by {timeline}")
    return ". ".join(parts) + "."


def action_metadata(signal: dict[str, Any]) -> dict[str, Any]:
    event_type = signal["event_type"]
    score = int(signal["signal_score"])
    symbol = signal["symbol"]
    direction = "NEUTRAL"
    action = "WATCH"

    if event_type in {"order_win", "capex", "m_and_a"}:
        direction = "BULLISH"
        action = "BUY MOMENTUM" if score >= 70 else "WATCH"
    elif event_type == "fundraising":
        direction = "NEUTRAL"
        action = "WATCH TERMS"
    elif event_type == "credit_rating":
        direction = "NEUTRAL"
        action = "WATCH RATING ACTION"

    confidence = "HIGH" if score >= 80 else "MEDIUM" if score >= 55 else "LOW"
    return {
        "direction": direction,
        "action": action,
        "confidence_label": confidence,
        "fno": "YES" if symbol in FNO_SYMBOLS else "NO",
    }


def enrich_order_signal(row: dict[str, Any], signal: dict[str, Any], session: requests.Session) -> dict[str, Any]:
    attachment = first(row, ["attchmntFile", "attachment_url"])
    pdf_text = ""
    try:
        pdf_text = download_pdf_text(session, attachment)
    except Exception as exc:
        signal["metadata"] = {**signal["metadata"], "pdf_error": repr(exc)}
        return signal

    if not pdf_text:
        return signal

    order_text, order_cr = value_hint(pdf_text.lower())
    if order_text and not signal["order_value_text"]:
        signal["order_value_text"] = order_text
        signal["order_value_inr_cr"] = order_cr

    counterparty = find_first(CLIENT_PATTERNS, pdf_text)
    if counterparty and any(term in counterparty.lower() for term in ["stock exchange", "press release", "ordinary course", "appointed date", "our us facility"]):
        counterparty = None
    scope = find_first(SCOPE_PATTERNS, pdf_text)
    if scope and any(term in scope.lower() for term in ["approval of", "ordinary course", "period of two years annexure", "in future", "corresponding program fee"]):
        scope = None
    timeline = find_first(TIMELINE_PATTERNS, pdf_text)
    geography = infer_geography(pdf_text)
    client_type = infer_client_type(counterparty, pdf_text)

    if counterparty:
        signal["counterparty"] = counterparty

    order_cr = signal.get("order_value_inr_cr")
    signal["materiality"] = (
        "high" if order_cr and float(order_cr) >= 500 else
        "medium" if order_cr and float(order_cr) >= 100 else
        "low" if order_cr else
        "unknown"
    )
    signal["signal_score"] = min(
        100,
        int(signal["signal_score"])
        + (20 if order_cr else 0)
        + (10 if counterparty else 0)
        + (10 if scope else 0)
        + (5 if geography else 0),
    )
    value_part = f" worth {signal['order_value_text']}" if signal.get("order_value_text") else ""
    signal["headline"] = f"{signal['symbol']}: order win{value_part}"
    signal["why_it_matters"] = trade_read(signal, scope, client_type)
    signal["metadata"] = {
        **signal["metadata"],
        "order_scope": scope,
        "execution_timeline": timeline,
        "geography": geography,
        "client_type": client_type,
        "announcement_summary": concise_summary(signal, scope, timeline),
        "trade_read": signal["why_it_matters"],
        "pdf_text_preview": pdf_text[:700],
    }
    signal["metadata"] = {**signal["metadata"], **action_metadata(signal)}
    return signal


def classify(row: dict[str, Any], session: requests.Session | None = None) -> dict[str, Any]:
    symbol = first(row, ["symbol", "sm_name"]).upper()
    company = first(row, ["companyName", "company_name", "sm_name"])
    subject = first(row, ["desc", "subject"])
    details = first(row, ["attchmntText", "details", "remarks"])
    attachment = first(row, ["attchmntFile", "attachment_url"])
    text = " ".join([symbol, company, subject, details]).lower()

    event_type = "general"
    score = 0
    if any(k in text for k in LOW_VALUE_NOISE):
        event_type = "general"
        score = 0
    elif any(k in text for k in ORDER_WIN_KEYWORDS) and not any(k in text for k in ORDER_WIN_EXCLUSIONS):
        event_type = "order_win"
        score = 50
    else:
        for candidate, keywords in EVENT_RULES:
            if any(k in text for k in keywords):
                event_type = candidate
                score = 25
                break

    order_text, order_cr = value_hint(text)
    if order_cr:
        score += 20
    if attachment:
        score += 5
    materiality = "high" if order_cr and order_cr >= 500 else "medium" if order_cr and order_cr >= 100 else "low" if order_cr else "unknown"
    headline = f"{symbol}: {subject}".strip(": ")
    why = details[:280] if details else subject

    signal = {
        "announcement_uid": uid_for(row),
        "symbol": symbol,
        "company_name": company,
        "event_type": event_type,
        "headline": headline,
        "event_date": parse_nse_datetime(first(row, ["an_dt", "sort_date", "broadcast_at"])),
        "order_value_text": order_text,
        "order_value_inr_cr": order_cr,
        "counterparty": None,
        "materiality": materiality,
        "why_it_matters": why,
        "signal_score": min(score, 100),
        "confidence": "high" if event_type == "order_win" and attachment else "medium",
        "source_url": attachment,
        "metadata": {"subject": subject},
    }
    if event_type == "order_win" and session:
        signal = enrich_order_signal(row, signal, session)
    else:
        signal["metadata"] = {**signal["metadata"], **action_metadata(signal)}
    return signal


def announcement_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "uid": uid_for(row),
        "provider": "nse",
        "symbol": first(row, ["symbol", "sm_name"]).upper(),
        "company_name": first(row, ["companyName", "company_name", "sm_name"]),
        "subject": first(row, ["desc", "subject"]),
        "details": first(row, ["attchmntText", "details", "remarks"]),
        "broadcast_at": parse_nse_datetime(first(row, ["an_dt", "sort_date", "broadcast_at"])),
        "attachment_url": first(row, ["attchmntFile", "attachment_url"]),
        "raw_payload": row,
    }


def upsert(rows: list[dict[str, Any]], dry_run: bool) -> None:
    announcements = [announcement_row(row) for row in rows]
    session = requests.Session()
    session.headers.update(headers())
    classified = [classify(row, session) for row in rows]
    signals = [
        signal
        for signal in classified
        if signal["event_type"] in ACTIONABLE_EVENT_TYPES and int(signal["signal_score"]) >= 25
    ]
    if dry_run:
        print(
            json.dumps(
                {
                    "announcements": len(announcements),
                    "classified": len(classified),
                    "published_actionable_signals": len(signals),
                },
                indent=2,
            )
        )
        return
    for chunk_start in range(0, len(announcements), 250):
        supa(
            "POST",
            "corporate_announcements?on_conflict=uid",
            announcements[chunk_start : chunk_start + 250],
            prefer="return=minimal,resolution=merge-duplicates",
        )
    for chunk_start in range(0, len(signals), 250):
        supa(
            "POST",
            "announcement_signals?on_conflict=announcement_uid,event_type",
            signals[chunk_start : chunk_start + 250],
            prefer="return=minimal,resolution=merge-duplicates",
        )
    print(f"Upserted {len(announcements)} announcements and {len(signals)} signals")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--from-date", help="DD-MM-YYYY")
    parser.add_argument("--to-date", help="DD-MM-YYYY")
    parser.add_argument("--days", type=int, default=1)
    parser.add_argument("--input-csv", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.input_csv:
        rows = read_csv(args.input_csv)
    else:
        to_date = args.to_date or datetime.now().strftime("%d-%m-%Y")
        from_date = args.from_date or (datetime.now() - timedelta(days=args.days)).strftime("%d-%m-%Y")
        rows = fetch_nse(from_date, to_date)
    upsert(rows, args.dry_run)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
