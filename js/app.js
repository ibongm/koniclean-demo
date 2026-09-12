const PHONE = "385953567768";
const EMAIL = "info@koniclean.hr";

const rates = {
  stambeni: { label: "Jednokratno čišćenje stana", rate: 2.5, min: 72 },
  generalno: { label: "Generalno čišćenje", rate: 4, min: 72 },
  adaptacija: { label: "Čišćenje nakon adaptacije", rate: 3.5, min: 72 },
  poslovni: { label: "Jednokratno čišćenje ureda", rate: 1.6, min: 65 },
  apartman: { label: "Čišćenje apartmana", rate: 1.4, min: 65 }
};

const extras = {
  fridge: { label: "Unutrašnjost hladnjaka", price: 15 },
  microwave: { label: "Unutrašnjost mikrovalne", price: 15 },
  oven: { label: "Unutrašnjost pećnice", price: 20 },
  windows: { label: "Prozori (okvirna procjena)", price: 25 }
};

function formatEur(n) {
  return new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" }).format(n);
}

function calcEstimate() {
  const type = document.querySelector("#serviceType")?.value;
  const area = Number(document.querySelector("#area")?.value || 0);
  const out = document.querySelector("#estimateBox");
  if (!type || !out) return;

  const pack = rates[type];
  let total = area > 0 ? pack.rate * area : 0;
  const lines = [];
  if (area > 0) lines.push(`${pack.label}: ${area} m² × ${formatEur(pack.rate)}`);

  document.querySelectorAll("[data-extra]:checked").forEach((el) => {
    const extra = extras[el.value];
    if (extra) {
      total += extra.price;
      lines.push(`${extra.label}: ${formatEur(extra.price)}`);
    }
  });

  if (total > 0 && total < pack.min) {
    lines.push(`Primjenjuje se minimalna narudžba ${formatEur(pack.min)}`);
    total = pack.min;
  }

  out.querySelector(".big").textContent = total ? formatEur(total) : "—";
  out.querySelector("ul").innerHTML = lines.map((l) => `<li>${l}</li>`).join("") || "<li>Unesite površinu za procjenu.</li>";
  out.dataset.total = String(total || 0);
  out.dataset.summary = lines.join("; ");
}

function openWhatsApp(prefill) {
  const text = encodeURIComponent(prefill);
  window.open(`https://wa.me/${PHONE}?text=${text}`, "_blank");
}

function setupNav() {
  const btn = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!btn || !links) return;
  btn.addEventListener("click", () => links.classList.toggle("open"));
}

function setupCalc() {
  const form = document.querySelector("#calcForm");
  if (!form) return;
  form.addEventListener("input", calcEstimate);
  calcEstimate();
  document.querySelector("#waQuote")?.addEventListener("click", () => {
    const area = document.querySelector("#area")?.value || "";
    const type = rates[document.querySelector("#serviceType").value].label;
    const box = document.querySelector("#estimateBox");
    const msg = `Pozdrav, želim procjenu za ${type}. Površina: ${area || "nije upisana"} m². Okvirna cijena na stranici: ${box.querySelector(".big").textContent}.`;
    openWhatsApp(msg);
  });
}

function setupContact() {
  const form = document.querySelector("#contactForm");
  if (!form) return;
  const ok = document.querySelector(".form-ok");
  const err = document.querySelector(".form-err");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ok.style.display = "none";
    err.style.display = "none";
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.phone || !data.service) {
      err.style.display = "block";
      err.textContent = "Molimo unesite ime, telefon i vrstu usluge.";
      return;
    }
    ok.style.display = "block";
    ok.textContent = "Upit je spreman. Otvara se WhatsApp s popunjenom porukom — ili nazovite +385 95 356 77 68.";
    const msg = `Pozdrav, ${data.name}. Trebam ${data.service}. Površina: ${data.area || "/"} m². Telefon: ${data.phone}. ${data.message || ""}`.trim();
    openWhatsApp(msg);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupCalc();
  setupContact();
});
