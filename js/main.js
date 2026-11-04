// MKA, prototipo. Un solo giro di requestAnimationFrame legge lo scroll nativo
// e muove l'apertura: niente scroll-jacking, tutto reversibile.
import { PROJECTS, MEMBERS } from "./data.js";
import { VIMEO, mountBackground, mountFull } from "./vimeo.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) * (1 - t); // come recordstudio: a metà corsa è già al 75%
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const img = (name) => `img/${name}.jpg`;

/* ═══ progetti ═══ */
const grid = $("#workGrid");
grid.innerHTML = PROJECTS.filter((p) => p.featured).map((p, i) => `
  <a class="card reveal" href="${p.url}" target="_blank" rel="noopener" style="--acc:${p.acc};${p.ink ? `--tag-ink:${p.ink}` : ""}">
    <div class="card-media">
      ${p.imgs.map((n, k) => `<img src="${img(n)}" alt="" loading="lazy" class="${k ? "" : "on"}" style="object-position:${p.pos || "50% 50%"}">`).join("")}
    </div>
    <div class="card-meta">
      <span class="card-n">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="card-title">${p.title}</h3>
      <span class="card-client">${p.client}</span>
      <span class="card-tag">${p.tag}</span>
    </div>
  </a>`).join("");

// all'hover l'anteprima scorre i fermi immagine del lavoro (finché non ci sono i video)
$$(".card").forEach((card) => {
  const frames = $$(".card-media img", card);
  if (frames.length < 2) return;
  let t = null, k = 0;
  const show = (n) => frames.forEach((f, j) => f.classList.toggle("on", j === n));
  card.addEventListener("pointerenter", () => {
    t = setInterval(() => { k = (k + 1) % frames.length; show(k); }, 900);
  });
  card.addEventListener("pointerleave", () => { clearInterval(t); k = 0; show(0); });
});

/* ═══ polaroid ═══ */
const table = $("#table");
table.innerHTML = MEMBERS.map((m, i) => `
  <figure class="polaroid" style="left:${m.x};top:${m.y};--rot:${m.rot}deg;z-index:${i + 1}">
    <img src="${img(m.img)}" alt="" style="object-position:${m.pos}" draggable="false">
    <figcaption><b>${m.name}</b><span>${m.role}</span></figcaption>
  </figure>`).join("");

const wide = matchMedia("(min-width: 861px)");
let zTop = MEMBERS.length + 1;
$$(".polaroid").forEach((el) => {
  let sx = 0, sy = 0, bx = 0, by = 0, id = null;
  el.addEventListener("pointerdown", (e) => {
    if (!wide.matches || e.button !== 0) return;
    id = e.pointerId;
    el.setPointerCapture(id);
    el.classList.add("drag");
    el.style.zIndex = ++zTop;
    sx = e.clientX; sy = e.clientY;
    bx = parseFloat(el.style.getPropertyValue("--x")) || 0;
    by = parseFloat(el.style.getPropertyValue("--y")) || 0;
  });
  el.addEventListener("pointermove", (e) => {
    if (e.pointerId !== id) return;
    el.style.setProperty("--x", `${bx + e.clientX - sx}px`);
    el.style.setProperty("--y", `${by + e.clientY - sy}px`);
  });
  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    el.classList.remove("drag");
    // posata di nuovo sul tavolo, prende un'inclinazione nuova
    el.style.setProperty("--rot", `${(Math.random() * 12 - 6).toFixed(1)}deg`);
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
});

/* ═══ apertura ═══ */
const hero = $(".hero");
const gridEl = $("#grid");
const stage = $(".hero-stage");
const front = $("#heroFront");
const reelUi = $("#reelUi");
const pill = $("#pill");
let bandH = 0;

function measure() {
  const vw = innerWidth, vh = innerHeight;
  bandH = clamp((vh - vw / 2.39) / 2, 44, vh * 0.11);
  stage.style.setProperty("--bh", `${bandH}px`);
}

let ticking = false;
let navOn = false;
let heroP = 0;
function frame() {
  ticking = false;
  const pin = hero.offsetHeight - innerHeight;
  const p = clamp(-hero.getBoundingClientRect().top / pin);
  heroP = p;

  // 0 → 0,45 del tratto bloccato (circa 450px su uno schermo da 800, come recordstudio): la griglia si raddrizza e la tessera centrale riempie lo schermo
  const z = easeOut(clamp(p / 0.45));
  gridEl.style.setProperty("--s", (0.4 + 0.6 * z).toFixed(4));
  gridEl.style.setProperty("--r", `${(-30 * (1 - z)).toFixed(3)}deg`);
  gridEl.style.setProperty("--k", (1 - z).toFixed(4));
  gridEl.style.setProperty("--rad", `${(28 * (1 - z)).toFixed(2)}px`);

  // logo e invito spariscono nel primo tratto
  const f = clamp(p / 0.2);
  front.style.setProperty("--front", (1 - f).toFixed(3));
  front.style.setProperty("--front-s", (1 + 0.08 * f).toFixed(3));
  front.style.visibility = f >= 1 ? "hidden" : "visible";
  stage.style.setProperty("--shade", (1 - z).toFixed(3));

  // bande cinema quando il reel è a tutto schermo
  const bk = clamp((p - 0.4) / 0.14);
  stage.style.setProperty("--bk", bk.toFixed(3));
  reelUi.classList.toggle("on", p > 0.48 && p < 0.999);

  // la pillola si apre solo da qui in poi, e si richiude risalendo
  const on = p >= 0.45;
  if (on !== navOn) {
    navOn = on;
    pill.classList.toggle("on", on);
    document.body.classList.toggle("nav-on", on);
    if (on) requestAnimationFrame(() => moveInd(lit || active));
  }
}
function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
addEventListener("scroll", request, { passive: true });
addEventListener("resize", () => { measure(); request(); moveInd(active); });
measure();
frame();

/* ─── showreel: fermi immagine finché Vimeo non è incorporabile ─── */
const stills = $$("#reelStills img");
let si = 0, heroVisible = true;
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
setInterval(() => {
  if (!heroVisible || document.hidden) return;
  stills[si].classList.remove("on");
  si = (si + 1) % stills.length;
  // riavvia il Ken Burns sull'immagine che entra
  void stills[si].offsetWidth;
  stills[si].classList.add("on");
}, reduced ? 5000 : 3200);

mountBackground($("#reelPlayer"), VIMEO.showreel).then((ok) => {
  if (ok) $("#reelNote").textContent = "Showreel 2026";
});

// timecode a 25 fotogrammi, gira solo quando le bande si vedono
const tc = $("#tc");
const t0 = performance.now();
setInterval(() => {
  if (heroP < 0.4 || !heroVisible) return;
  const fr = Math.floor((performance.now() - t0) / 40);
  const pad = (n) => String(n).padStart(2, "0");
  tc.textContent = `${pad(Math.floor(fr / 90000) % 24)}:${pad(Math.floor(fr / 1500) % 60)}:${pad(Math.floor(fr / 25) % 60)}:${pad(fr % 25)}`;
}, 40);

/* ─── modale ─── */
const modal = $("#modal");
$("#reelOpen").addEventListener("click", () => {
  modal.showModal();
  mountFull($("#modalBox"), VIMEO.showreel);
});
const closeModal = () => { modal.close(); $("#modalBox").replaceChildren(); };
$("#modalX").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
modal.addEventListener("close", () => $("#modalBox").replaceChildren());

/* ═══ pillola: la capsula chiara segue la sezione corrente e il puntatore ═══ */
const ind = $(".pill-ind");
const links = $$(".pill a[data-sec]");
let active = links[0];
let lit = null;

function moveInd(a) {
  if (!a || !a.offsetWidth) { ind.style.opacity = 0; return; }
  ind.style.opacity = 1;
  ind.style.left = `${a.offsetLeft}px`;
  ind.style.width = `${a.offsetWidth}px`;
  links.forEach((l) => l.classList.toggle("is-lit", l === a));
}
links.forEach((a) => {
  a.addEventListener("pointerenter", () => { lit = a; moveInd(a); });
});
pill.addEventListener("pointerleave", () => { lit = null; moveInd(active); });

const secs = ["top", "progetti", "collettivo", "call"].map((id) => document.getElementById(id));
// su telefono "Showreel" è nascosta: in apertura la capsula semplicemente sparisce
const secIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const a = links.find((l) => l.dataset.sec === e.target.id);
    active = a && a.offsetWidth ? a : null;
    document.body.classList.toggle("on-call", e.target.id === "call");
    if (!lit) moveInd(active);
  });
}, { rootMargin: "-45% 0px -45% 0px" });
secs.forEach((s) => secIO.observe(s));

/* ═══ ingressi ═══ */
const revIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); revIO.unobserve(e.target); }
  });
}, { rootMargin: "0px 0px -8% 0px" });
$$(".reveal").forEach((el) => revIO.observe(el));

/* ═══ etichetta "Guarda" che segue il puntatore sulle card ═══ */
const cur = $("#cur");
let cx = 0, cy = 0, tx = 0, ty = 0, curOn = false, curRaf = 0;
function curLoop() {
  cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
  cur.style.left = `${cx}px`; cur.style.top = `${cy}px`;
  curRaf = curOn || Math.abs(tx - cx) > 0.5 ? requestAnimationFrame(curLoop) : 0;
}
$$(".card").forEach((c) => {
  c.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = cx = e.clientX; ty = cy = e.clientY;
    curOn = true; cur.classList.add("on");
    if (!curRaf) curRaf = requestAnimationFrame(curLoop);
  });
  c.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
  c.addEventListener("pointerleave", () => { curOn = false; cur.classList.remove("on"); });
});

/* ═══ form: nessun backend nel prototipo ═══ */
const form = $("#callForm");
const msg = $("#formMsg");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  $$("input[required], textarea[required]", form).forEach((f) => {
    const bad = !f.value.trim() || (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
    f.closest(".field").classList.toggle("bad", bad);
    if (bad && ok) { f.focus(); ok = false; }
  });
  if (!ok) { msg.textContent = "Mancano dei campi obbligatori"; return; }
  msg.textContent = "Richiesta pronta. Nel prototipo non parte nessuna email.";
  form.reset();
});
form.addEventListener("input", (e) => {
  const f = e.target.closest(".field");
  if (f) f.classList.remove("bad");
});
