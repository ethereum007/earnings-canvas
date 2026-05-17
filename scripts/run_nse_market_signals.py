#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import hashlib
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
    ("investor_presentation", ["investor presentation", "presentation"]),
    ("results", ["financial results", "audited results", "unaudited results", "outcome of board meeting"]),
    ("credit_rating", ["credit rating", "rating action", "ratings"]),
    ("management_change", ["resignation", "appointment", "director", "change in management"]),
    ("insider_trading", ["insider trading", "trading window"]),
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
    return None, None


def classify(row: dict[str, Any]) -> dict[str, Any]:
    symbol = first(row, ["symbol", "sm_name"]).upper()
    company = first(row, ["companyName", "company_name", "sm_name"])
    subject = first(row, ["desc", "subject"])
    details = first(row, ["attchmntText", "details", "remarks"])
    attachment = first(row, ["attchmntFile", "attachment_url"])
    text = " ".join([symbol, company, subject, details]).lower()

    event_type = "general"
    score = 0
    if any(k in text for k in ORDER_WIN_KEYWORDS) and not any(k in text for k in ORDER_WIN_EXCLUSIONS):
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

    return {
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
    signals = [classify(row) for row in rows]
    if dry_run:
        print(json.dumps({"announcements": len(announcements), "signals": len(signals)}, indent=2))
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
