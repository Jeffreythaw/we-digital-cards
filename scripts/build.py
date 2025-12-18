import json
from pathlib import Path
import qrcode  # pip install "qrcode[pil]"

ROOT = Path(__file__).resolve().parents[1]
IN_DATA = ROOT / "data" / "staff.json"

OUT_PUBLIC_STAFF = ROOT / "staff.json"
OUT_CONTACT = ROOT / "contact"
OUT_QR = ROOT / "qr"

OUT_CONTACT.mkdir(exist_ok=True)
OUT_QR.mkdir(exist_ok=True)

def vcard3(p: dict) -> str:
    name = p["name"].strip()
    parts = name.split(" ", 1)
    first = parts[0]
    last = parts[1] if len(parts) > 1 else ""
    adr = p["address"].replace(",", r"\,")

    return "\n".join([
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"N:{last};{first};;;",
        f"FN:{name}",
        f"ORG:{p['company']}",
        f"TITLE:{p['title']}",
        f"TEL;TYPE=CELL:{p['phone']}",
        f"EMAIL:{p['email']}",
        f"ADR;TYPE=WORK:;;{adr}",
        f"URL:{p['website']}",
        "END:VCARD",
        ""
    ])

def make_qr_png(text: str, out_path: Path):
    img = qrcode.make(text)
    img.save(out_path)

people = json.loads(IN_DATA.read_text(encoding="utf-8"))

OUT_PUBLIC_STAFF.write_text(json.dumps(people, ensure_ascii=False, indent=2), encoding="utf-8")

for p in people:
    pid = p["id"].strip()
    vcf = vcard3(p)
    (OUT_CONTACT / f"{pid}.vcf").write_text(vcf, encoding="utf-8")
    make_qr_png(vcf, OUT_QR / f"{pid}.png")

print(f"Generated {len(people)} staff: staff.json + /contact + /qr")
