function qs(name){ return new URLSearchParams(location.search).get(name); }

async function load(){
  const id = qs("id");
  if(!id){
    document.body.innerHTML = "<p style='padding:24px;color:#fff'>Missing ?id=</p>";
    return;
  }

  const staff = await (await fetch("staff.json")).json();
  const p = staff.find(x => x.id === id);

  if(!p){
    document.body.innerHTML = `<p style='padding:24px;color:#fff'>No staff for id=${id}</p>`;
    return;
  }

  document.title = `${p.name} — Digital Card`;
  document.getElementById("company").textContent = p.company;
  document.getElementById("title").textContent = p.title;
  document.getElementById("name").textContent = p.name;

  const phone = document.getElementById("phone");
  phone.textContent = p.phone;
  phone.href = `tel:${p.phone.replace(/\s+/g,"")}`;

  const email = document.getElementById("email");
  email.textContent = p.email;
  email.href = `mailto:${p.email}`;

  const website = document.getElementById("website");
  website.textContent = p.website.replace(/^https?:\/\//,"");
  website.href = p.website;

  document.getElementById("photo").src = p.photo;

  document.getElementById("qrImg").src = `qr/${p.id}.png`;
  document.getElementById("saveBtn").href = `contact/${p.id}.vcf`;

  document.getElementById("navBtn").href =
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.address);
}

load();
