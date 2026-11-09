import json
from pathlib import Path
import qrcode  # pip install "qrcode[pil]"

ROOT = Path(__file__).resolve().parents[1]
IN_DATA = ROOT / "data" / "staff.json"
CARD_TEMPLATE = ROOT / "card.html"

# Public address of this site; must match the GitHub Pages custom domain.
CARD_BASE_URL = "https://card.we-engineering.net"

OUT_PUBLIC_STAFF = ROOT / "staff.json"
OUT_CONTACT = ROOT / "contact"
OUT_QR = ROOT / "qr"
OUT_QR_URL = ROOT / "qr_url"

for d in (OUT_CONTACT, OUT_QR, OUT_QR_URL):
    d.mkdir(exist_ok=True)

def vcard3(p: dict) -> str:
    name = p["name"].strip()
    adr = p["address"].replace(",", r"\,")

    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        # Burmese names have no family name; keep the full name as given name.
        f"N:;{name};;;",
        f"FN:{name}",
        f"ORG:{p['company']}",
        f"TITLE:{p['title']}",
        f"TEL;TYPE=CELL:{p['phone']}",
    ]
    if p.get("email"):
        lines.append(f"EMAIL;TYPE=WORK:{p['email']}")
    lines += [
        f"ADR;TYPE=WORK:;;{adr}",
        f"URL:{p['website']}",
        "END:VCARD",
        "",
    ]
    return "\n".join(lines)

def make_qr_png(text: str, out_path: Path):
    img = qrcode.make(text)
    img.save(out_path)

def write_short_page(pid: str, template: str):
    # /<id>/ serves the same card; <base> keeps relative asset paths pointing at the site root.
    page = template.replace("<head>", '<head>\n  <base href="../">', 1)
    page = page.replace("<body>", f'<body data-card-id="{pid}">', 1)
    out_dir = ROOT / pid
    out_dir.mkdir(exist_ok=True)
    (out_dir / "index.html").write_text(page, encoding="utf-8")

people = json.loads(IN_DATA.read_text(encoding="utf-8"))
template = CARD_TEMPLATE.read_text(encoding="utf-8")

OUT_PUBLIC_STAFF.write_text(json.dumps(people, ensure_ascii=False, indent=2), encoding="utf-8")

for p in people:
    pid = p["id"].strip()
    vcf = vcard3(p)
    (OUT_CONTACT / f"{pid}.vcf").write_text(vcf, encoding="utf-8")
    make_qr_png(vcf, OUT_QR / f"{pid}.png")
    make_qr_png(f"{CARD_BASE_URL}/{pid}", OUT_QR_URL / f"{pid}.png")
    write_short_page(pid, template)

print(f"Generated {len(people)} staff: staff.json + /contact + /qr + /qr_url + /<id>/")
