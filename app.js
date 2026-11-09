function qs(name){ return new URLSearchParams(location.search).get(name); }

function cleanText(v){
  return (v || "").replace(/\s+/g, " ").trim(); // removes newlines + double spaces
}

function fail(msg){
  document.body.innerHTML = "";
  const p = document.createElement("p");
  p.style.cssText = "padding:24px;color:#fff";
  p.textContent = msg;
  document.body.appendChild(p);
}

async function load(){
  const id = qs("id") || document.body.dataset.cardId;
  if(!id){
    fail("Missing card id");
    return;
  }

  const staff = await (await fetch("staff.json")).json();
  const p = staff.find(x => x.id === id);

  if(!p){
    fail(`No card found for "${id}"`);
    return;
  }

  const $ = (elId) => document.getElementById(elId);

  const nameVal = cleanText(p.name);
  const phoneVal = cleanText(p.phone);
  const phoneDigits = phoneVal.replace(/[^\d+]/g, "");
  const emailVal = cleanText(p.email);
  const websiteVal = cleanText(p.website);
  const addressVal = cleanText(p.address);

  document.title = `${nameVal} | WE Engineering`;

  $("name").textContent = nameVal || "—";
  $("title").textContent = cleanText(p.title) || "—";
  $("company").textContent = cleanText(p.company) || "—";
  $("uen").textContent = p.uen ? `(UEN: ${cleanText(p.uen)})` : "";

  const photoEl = $("photo");
  photoEl.src = p.photo || "assets/logo.png";
  photoEl.onerror = () => { photoEl.src = "assets/logo.png"; };

  $("phoneText").textContent = phoneVal || "—";
  $("phone").href = `tel:${phoneDigits}`;

  if(emailVal){
    $("emailText").textContent = emailVal;
    $("email").href = `mailto:${emailVal}`;
  }else{
    $("email").hidden = true;
  }

  $("website").textContent = websiteVal.replace(/^https?:\/\//, "") || "—";
  $("website").href = websiteVal || "#";

  // "WCEGA Tower, 21 Bukit Batok Crescent, #29-81, Singapore 658065"
  // -> bold building / street + unit / postcode, like the printed card
  const parts = addressVal.split(",").map(s => s.trim()).filter(Boolean);
  const addrEl = $("address");
  addrEl.textContent = "";
  const strong = document.createElement("strong");
  strong.textContent = (parts[0] || "").toUpperCase();
  addrEl.append(strong);
  if(parts.length > 2){
    addrEl.append(document.createElement("br"), parts.slice(1, -1).join(", "));
  }
  if(parts.length > 1){
    addrEl.append(document.createElement("br"), parts[parts.length - 1]);
  }
  addrEl.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(addressVal);

  if(p.whatsapp){
    $("whatsapp").href = `https://wa.me/${phoneDigits.replace("+", "")}`;
    $("whatsapp").hidden = false;
  }

  $("saveBtn").href = `contact/${p.id}.vcf`;
  $("qrThumbImg").src = `qr/${p.id}.png`;

  function showQr(mode){
    const isVcf = mode === "vcf";
    document.querySelectorAll(".qr-img").forEach(img => {
      img.src = isVcf ? `qr/${p.id}.png` : `qr_url/${p.id}.png`;
    });
    $("qrSub").textContent = isVcf ? "Scan to save contact (works offline)" : "Scan to open this card";
    document.querySelectorAll(".tab[data-mode]").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.mode === mode);
    });
  }

  document.querySelectorAll(".tab[data-mode]").forEach(tab => {
    tab.addEventListener("click", () => showQr(tab.dataset.mode));
  });
  showQr("vcf");

  const overlay = $("qrOverlay");
  $("qrOverlayName").textContent = nameVal;

  function openOverlay(){ overlay.hidden = false; document.body.style.overflow = "hidden"; }
  function closeOverlay(){ overlay.hidden = true; document.body.style.overflow = ""; }

  $("qrThumb").addEventListener("click", openOverlay);
  $("qrClose").addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => { if(e.target === overlay) closeOverlay(); });
  document.addEventListener("keydown", (e) => { if(e.key === "Escape" && !overlay.hidden) closeOverlay(); });
}

load();
