function qs(name){
  return new URLSearchParams(location.search).get(name);
}

function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 1200);
}

function showFatal(message, detail){
  document.body.replaceChildren();
  const wrap = document.createElement("main");
  wrap.className = "wrap";
  const card = document.createElement("section");
  card.className = "card";
  card.style.padding = "24px";

  const p = document.createElement("p");
  p.style.margin = "0 0 8px";
  p.style.fontWeight = "700";
  p.textContent = message;
  card.appendChild(p);

  if(detail){
    const d = document.createElement("p");
    d.style.margin = "0";
    d.style.color = "#64748b";
    d.style.wordBreak = "break-word";
    d.textContent = detail;
    card.appendChild(d);
  }

  const home = document.createElement("p");
  home.style.margin = "16px 0 0";
  const a = document.createElement("a");
  a.href = "index.html";
  a.textContent = "Back to WE Digital Cards";
  home.appendChild(a);
  card.appendChild(home);

  wrap.appendChild(card);
  document.body.appendChild(wrap);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    toast("Copied ✅");
  }catch{
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Copied ✅");
  }
}

function cleanText(v){
  return (v || "").replace(/\s+/g, " ").trim();
}

function safeHttpUrl(value){
  const raw = cleanText(value);
  if(!raw) return "";
  try{
    const u = new URL(raw, location.href);
    if(u.protocol === "http:" || u.protocol === "https:") return u.href;
  }catch{
    /* ignore */
  }
  return "";
}

async function load(){
  const id = qs("id");
  if(!id){
    showFatal("Missing staff id.", "Open a card with ?id=<staff-id>, for example card.html?id=jeffrey");
    return;
  }

  let staff;
  try{
    const res = await fetch("staff.json");
    if(!res.ok){
      throw new Error(`Could not load staff list (HTTP ${res.status}).`);
    }
    staff = await res.json();
    if(!Array.isArray(staff)){
      throw new Error("Staff list is not valid JSON data.");
    }
  }catch(err){
    const msg = err && err.message ? err.message : "Could not load staff list.";
    showFatal("Unable to load digital card.", msg);
    return;
  }

  const p = staff.find(x => x && x.id === id);
  if(!p){
    showFatal("No staff found for that id.", id);
    return;
  }

  document.title = `${cleanText(p.name)} — Digital Business Card`;

  const nameEl = document.getElementById("name");
  const titleEl = document.getElementById("title");
  const companyEl = document.getElementById("company");
  const photoEl = document.getElementById("photo");
  const phoneRow = document.getElementById("phoneRow");
  const emailRow = document.getElementById("emailRow");
  const websiteRow = document.getElementById("websiteRow");
  const phoneEl = document.getElementById("phone");
  const emailEl = document.getElementById("email");
  const websiteEl = document.getElementById("website");
  const saveBtn = document.getElementById("saveBtn");
  const navBtn = document.getElementById("navBtn");
  const qrImg = document.getElementById("qrImg");
  const tabVcf = document.getElementById("tabVcf");
  const tabUrl = document.getElementById("tabUrl");
  const qrTitle = document.getElementById("qrTitle");
  const qrSub = document.getElementById("qrSub");

  const nameVal = cleanText(p.name);
  const titleVal = cleanText(p.title);
  const companyVal = cleanText(p.company);
  const phoneVal = cleanText(p.phone);
  const emailVal = cleanText(p.email);
  const websiteVal = cleanText(p.website);
  const addressVal = cleanText(p.address);
  const safeWebsite = safeHttpUrl(websiteVal);

  nameEl.textContent = nameVal || "—";
  titleEl.textContent = titleVal || "—";
  companyEl.textContent = companyVal || "—";

  photoEl.src = p.photo || "assets/logo.png";
  photoEl.onerror = () => {
    photoEl.src = "assets/logo.png";
  };

  phoneEl.textContent = phoneVal || "—";

  if(emailVal){
    emailEl.textContent = emailVal;
    emailRow.style.display = "";
  }else{
    emailRow.style.display = "none";
  }

  const websiteText = websiteVal.replace(/^https?:\/\//, "");
  websiteEl.textContent = websiteText || "—";
  if(safeWebsite){
    websiteRow.href = safeWebsite;
    websiteRow.removeAttribute("aria-disabled");
  }else{
    websiteRow.href = "#";
    websiteRow.setAttribute("aria-disabled", "true");
    websiteRow.addEventListener("click", (e) => e.preventDefault());
  }

  saveBtn.href = `contact/${encodeURIComponent(p.id)}.vcf`;
  navBtn.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(addressVal);

  const vcfQr = `qr/${encodeURIComponent(p.id)}.png`;
  const urlQr = `qr_url/${encodeURIComponent(p.id)}.png`;

  function showVcf(){
    qrImg.src = vcfQr;
    tabVcf.classList.add("active");
    tabUrl.classList.remove("active");
    tabVcf.setAttribute("aria-selected", "true");
    tabUrl.setAttribute("aria-selected", "false");
    qrTitle.textContent = "Scan to save contact";
    qrSub.textContent = "Offline vCard QR";
  }

  function showUrl(){
    qrImg.src = urlQr;
    tabUrl.classList.add("active");
    tabVcf.classList.remove("active");
    tabUrl.setAttribute("aria-selected", "true");
    tabVcf.setAttribute("aria-selected", "false");
    qrTitle.textContent = "Scan to open my card";
    qrSub.textContent = "Web link QR";
  }

  tabVcf.addEventListener("click", showVcf);
  tabUrl.addEventListener("click", showUrl);
  showVcf();

  phoneRow.addEventListener("click", () => {
    if(phoneVal) copyText(phoneVal);
  });

  emailRow.addEventListener("click", () => {
    if(emailVal) copyText(emailVal);
  });

  websiteRow.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if(websiteVal) copyText(websiteVal);
  });
}

load();
