function qs(name){ return new URLSearchParams(location.search).get(name); }

function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 1200);
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
  return (v || "").replace(/\s+/g, " ").trim(); // removes newlines + double spaces
}

async function load(){
  const id = qs("id");
  if(!id){
    document.body.innerHTML = "<p style='padding:24px'>Missing ?id=</p>";
    return;
  }

  const staff = await (await fetch("staff.json")).json();
  const p = staff.find(x => x.id === id);

  if(!p){
    document.body.innerHTML = `<p style='padding:24px'>No staff found for id=${id}</p>`;
    return;
  }

  document.title = `${cleanText(p.name)} — Digital Business Card`;

  // Elements
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

  // Values
  const nameVal = cleanText(p.name);
  const titleVal = cleanText(p.title);
  const companyVal = cleanText(p.company);

  const phoneVal = cleanText(p.phone);
  const emailVal = cleanText(p.email);
  const websiteVal = cleanText(p.website);
  const addressVal = cleanText(p.address);

  // Fill fields
  nameEl.textContent = nameVal || "—";
  titleEl.textContent = titleVal || "—";
  companyEl.textContent = companyVal || "—";

  // Photo
  photoEl.src = p.photo || "";
  photoEl.onerror = () => {
    // fallback if photo missing
    photoEl.src = "assets/logo.png";
  };

  // Phone
  phoneEl.textContent = phoneVal || "—";

  // Email (hide if empty)
  if(emailVal){
    emailEl.textContent = emailVal;
    emailRow.style.display = "";
  }else{
    emailRow.style.display = "none";
  }

  // Website
  const websiteText = websiteVal.replace(/^https?:\/\//, "");
  websiteEl.textContent = websiteText || "—";
  websiteRow.href = websiteVal || "#";

  // Buttons
  saveBtn.href = `contact/${p.id}.vcf`;
  navBtn.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(addressVal);

  // 2 QR modes
  const vcfQr = `qr/${p.id}.png`;
  const urlQr = `qr_url/${p.id}.png`;

  function showVcf(){
    qrImg.src = vcfQr;
    tabVcf.classList.add("active");
    tabUrl.classList.remove("active");
    qrTitle.textContent = "Scan to save contact";
    qrSub.textContent = "Offline vCard QR";
  }

  function showUrl(){
    qrImg.src = urlQr;
    tabUrl.classList.add("active");
    tabVcf.classList.remove("active");
    qrTitle.textContent = "Scan to open my card";
    qrSub.textContent = "Web link QR";
  }

  tabVcf.addEventListener("click", showVcf);
  tabUrl.addEventListener("click", showUrl);

  // Default
  showVcf();

  // Tap to copy
  phoneRow.addEventListener("click", () => {
    if(phoneVal) copyText(phoneVal);
  });

  emailRow.addEventListener("click", () => {
    if(emailVal) copyText(emailVal);
  });

  // Optional: right click / long press to copy website
  websiteRow.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if(websiteVal) copyText(websiteVal);
  });
}

load();