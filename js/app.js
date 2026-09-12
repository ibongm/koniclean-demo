const PHONE = "385953567768";
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
  const out = document.querySelector("#estimateBox");
  if (!type || !out) return;
  const pack = rates[type];
  if (!pack) return;
  const area = Number(String(document.querySelector("#area")?.value || "").replace(",", "."));
  let total = area > 0 ? pack.rate * area : 0;
  const lines = [];
  if (area > 0) lines.push(`${pack.label}: ${area} m² × ${formatEur(pack.rate)}`);
  document.querySelectorAll("[data-extra]:checked").forEach((el) => {
    const extra = extras[el.value];
    if (extra) { total += extra.price; lines.push(`${extra.label}: ${formatEur(extra.price)}`); }
  });
  if (total > 0 && total < pack.min) { lines.push(`Primjenjuje se minimalna narudžba ${formatEur(pack.min)}`); total = pack.min; }
  const big = out.querySelector(".big");
  const list = out.querySelector("ul");
  if (big) big.textContent = total ? formatEur(total) : "—";
  if (list) list.innerHTML = lines.length ? lines.map((l) => `<li>${l}</li>`).join("") : "<li>Unesite površinu za procjenu.</li>";
}
function openWhatsApp(prefill) {
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(prefill)}`, "_blank");
}
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (btn && links) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }));
    document.addEventListener("click", (e) => {
      if (!links.classList.contains("open")) return;
      if (links.contains(e.target) || btn.contains(e.target)) return;
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  }
  const form = document.querySelector("#calcForm");
  if (form) {
    form.addEventListener("input", calcEstimate);
    form.addEventListener("change", calcEstimate);
    calcEstimate();
    document.querySelector("#waQuote")?.addEventListener("click", () => {
      const area = document.querySelector("#area")?.value || "";
      const type = rates[document.querySelector("#serviceType").value]?.label || "čišćenje";
      const price = document.querySelector("#estimateBox .big")?.textContent || "—";
      openWhatsApp(`Pozdrav, želim procjenu za ${type}. Površina: ${area || "nije upisana"} m². Okvirna cijena na stranici: ${price}.`);
    });
  }
  const contact = document.querySelector("#contactForm");
  if (contact) {
    contact.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = document.querySelector(".form-ok");
      const err = document.querySelector(".form-err");
      if (ok) ok.style.display = "none";
      if (err) err.style.display = "none";
      const data = Object.fromEntries(new FormData(contact).entries());
      if (!data.name || !data.phone || !data.service) {
        if (err) { err.style.display = "block"; err.textContent = "Molimo unesite ime, telefon i vrstu usluge."; }
        return;
      }
      if (ok) { ok.style.display = "block"; ok.textContent = "Upit je spreman. Otvara se WhatsApp."; }
      openWhatsApp(`Pozdrav, ${data.name}. Trebam ${data.service}. Površina: ${data.area || "/"} m². Telefon: ${data.phone}. ${data.message || ""}`.trim());
    });
  }
});
