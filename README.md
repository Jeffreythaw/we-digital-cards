# WE Digital Cards

Static digital business cards for **WE ENGINEERING**, published on GitHub Pages:

**Live:** https://jeffreythaw.github.io/we-digital-cards/

Each staff member has a card at:

```text
https://jeffreythaw.github.io/we-digital-cards/card.html?id=<id>
```

Short compat links (redirect to the canonical card URL):

```text
https://jeffreythaw.github.io/we-digital-cards/u/<id>/
```

## QR permanence

Printed and shared **Open** QR codes encode the canonical URL above (`…/card.html?id=<id>`).  
Do **not** change the GitHub Pages project path or that query scheme — existing QR images and bookmarks must keep working.

- `qr_url/<id>.png` — web-link QR (same stable `card.html?id=` target)
- `qr/<id>.png` — offline vCard QR (contact payload)
- `u/<id>/` — optional short path that redirects to `card.html?id=<id>`

## Data source

Edit **`data/staff.json`** only. `scripts/build.py` copies it to root `staff.json` (served to the browser) and regenerates `contact/`, `qr/`, `qr_url/`, and `u/`.

Optional per-person fields for accurate vCard names:

- `given_name`
- `family_name`

If omitted, the build uses the last word of `name` as family name and the rest as given name.

## Local build

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/build.py
```

Serve the repo root (or the `_site` folder produced by CI) with any static server, for example:

```bash
python3 -m http.server 4321
# open http://127.0.0.1:4321/card.html?id=jeffrey
```

## Deploy

Push to `main`. The active workflow is `.github/workflows/pages.yml` (runs `scripts/build.py`, then uploads the repo for Pages).

To stop publishing `scripts/`, `data/`, and junk, replace that workflow with `scripts/recommended-pages.yml` (assembles a public `_site` artifact). Applying that file under `.github/workflows/` needs a GitHub token with the `workflow` scope.

## Privacy note

These are intentional public business cards (name, phone, email, address, photo). Contact details are meant to be shareable; do not treat removing public PII as a “fix” unless you add an opt-in / private-card pattern.
