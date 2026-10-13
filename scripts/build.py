#!/usr/bin/env python3
"""Generate public staff.json, vCards, QR codes, and /u/<id> compat redirects.

QR permanence (do not break printed / shared codes):
- Pages site stays at https://jeffreythaw.github.io/we-digital-cards/
- Web-link QRs MUST encode: {PAGES_BASE}/card.html?id=<id>
- Do not change that URL scheme; /u/<id> is an extra compat path that redirects to it.
"""

from __future__ import annotations

import json
from pathlib import Path

import qrcode  # pip install "qrcode[pil]"

ROOT = Path(__file__).resolve().parents[1]
IN_DATA = ROOT / "data" / "staff.json"

# Stable public Pages origin + path. Changing this would invalidate printed URL QRs.
PAGES_BASE = "https://jeffreythaw.github.io/we-digital-cards"

OUT_PUBLIC_STAFF = ROOT / "staff.json"
OUT_CONTACT = ROOT / "contact"
OUT_QR = ROOT / "qr"
OUT_QR_URL = ROOT / "qr_url"
OUT_U = ROOT / "u"

OUT_CONTACT.mkdir(exist_ok=True)
OUT_QR.mkdir(exist_ok=True)
OUT_QR_URL.mkdir(exist_ok=True)
OUT_U.mkdir(exist_ok=True)


def esc_vcard(value: str) -> str:
    """Escape text for vCard 3.0 (backslash, semicolon, comma, newlines)."""
    return (
        (value or "")
        .replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\n", "\\n")
        .replace("\r", "")
    )


def split_name(person: dict) -> tuple[str, str]:
    """Return (given, family). Prefer explicit fields; else last token = family."""
    given = (person.get("given_name") or "").strip()
    family = (person.get("family_name") or "").strip()
    if given or family:
        return given, family

    parts = (person.get("name") or "").strip().split()
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return " ".join(parts[:-1]), parts[-1]


def card_url(staff_id: str) -> str:
    """Canonical card URL encoded by qr_url/*.png (must stay stable)."""
    return f"{PAGES_BASE}/card.html?id={staff_id}"


def vcard3(person: dict) -> str:
    name = (person.get("name") or "").strip()
    given, family = split_name(person)
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"N:{esc_vcard(family)};{esc_vcard(given)};;;",
        f"FN:{esc_vcard(name)}",
        f"ORG:{esc_vcard(person.get('company') or '')}",
        f"TITLE:{esc_vcard(person.get('title') or '')}",
        f"TEL;TYPE=CELL:{esc_vcard(person.get('phone') or '')}",
    ]
    email = (person.get("email") or "").strip()
    if email:
        lines.append(f"EMAIL:{esc_vcard(email)}")
    lines.append(f"ADR;TYPE=WORK:;;{esc_vcard(person.get('address') or '')}")
    website = (person.get("website") or "").strip()
    if website:
        lines.append(f"URL:{esc_vcard(website)}")
    lines.extend(["END:VCARD", ""])
    return "\n".join(lines)


def make_qr_png(text: str, out_path: Path) -> None:
    img = qrcode.make(text)
    img.save(out_path)


def write_u_redirect(staff_id: str) -> None:
    """Compat short path /u/<id>/ → card.html?id=<id> (old footnote / printed tips)."""
    target = card_url(staff_id)
    # Relative fallback from /u/<id>/index.html → ../../card.html?id=
    relative = f"../../card.html?id={staff_id}"
    dest_dir = OUT_U / staff_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta http-equiv="refresh" content="0;url={target}"/>
  <link rel="canonical" href="{target}"/>
  <title>Redirecting…</title>
  <script>location.replace({json.dumps(target)});</script>
</head>
<body>
  <p style="font-family:system-ui,sans-serif;padding:24px">
    <a href="{relative}">Continue to digital card</a>
  </p>
</body>
</html>
"""
    (dest_dir / "index.html").write_text(html, encoding="utf-8")


def main() -> None:
    people = json.loads(IN_DATA.read_text(encoding="utf-8"))
    OUT_PUBLIC_STAFF.write_text(
        json.dumps(people, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    for person in people:
        pid = (person.get("id") or "").strip()
        if not pid:
            raise SystemExit("staff entry missing id")

        vcf = vcard3(person)
        (OUT_CONTACT / f"{pid}.vcf").write_text(vcf, encoding="utf-8")
        make_qr_png(vcf, OUT_QR / f"{pid}.png")

        url = card_url(pid)
        make_qr_png(url, OUT_QR_URL / f"{pid}.png")
        write_u_redirect(pid)

    print(
        f"Generated {len(people)} staff: staff.json + contact/ + qr/ + qr_url/ + u/"
        f"\nURL QR target scheme: {PAGES_BASE}/card.html?id=<id>"
    )


if __name__ == "__main__":
    main()
