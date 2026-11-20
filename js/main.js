// MKA, prototipo. Un solo giro di requestAnimationFrame legge lo scroll nativo
// e muove l'apertura: niente scroll-jacking, tutto reversibile.
import { PROJECTS, SERVICES } from "./data.js";
import { VIMEO, mountBackground, mountFull } from "./vimeo.js";
import { createMosaic, PH } from "./mosaic.js";
import { playIntro } from "./intro.js";
import { initCal } from "./cal.js";
import { bindOpen } from "./apri.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - (1 - t) * (1 - t); // come recordstudio: a metà corsa è già al 75%
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const img = (name) => `img/${name}.jpg`;

/* ═══ progetti ═══ */
const grid = $("#workGrid");
grid.innerHTML = PROJECTS.filter((p) => p.featured).map((p, i) => `
  <a class="card reveal" href="progetto.html?p=${p.slug}">
    <div class="card-media">
      ${p.imgs.map((n, k) => `<img src="${img(n)}" alt="" loading="lazy" class="${k ? "" : "on"}" style="object-position:${p.pos || "50% 50%"}">`).join("")}
      <div class="card-meta">
        <span class="card-n">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="card-title">${p.title}</h3>
        <span class="card-client">${p.client}</span>
        <span class="card-tag">${p.tag}</span>
      </div>
    </div>
  </a>`).join("");

// al clic la miniatura (con il fermo immagine che si vede in quel momento)
// diventa la cornice della pagina del progetto: vedi js/apri.js
bindOpen(grid, "a.card", (a) => {
  const im = $(".card-media img.on", a) || $(".card-media img", a);
  return { el: $(".card-media", a), src: im.getAttribute("src"), pos: im.style.objectPosition, radius: "0px" };
});

/* ═══ i nostri servizi: tre categorie una sotto l'altra, si aprono al clic ═══ */
// schema a fisarmonica accessibile: il bottone sta dentro il titolo e dice
// con aria-expanded se il pannello è aperto. Se ne apre uno alla volta.
const services = $("#services");
services.innerHTML = SERVICES.map((sv, i) => `
  <article class="svc reveal">
    <h3 class="svc-h">
      <button class="svc-head" type="button" id="svc-h${i}" aria-expanded="false" aria-controls="svc-b${i}">
        <span class="svc-n">${String(i + 1).padStart(2, "0")}</span>
        <span class="svc-title">${sv.title}</span>
        <span class="svc-plus" aria-hidden="true"></span>
      </button>
    </h3>
    <div class="svc-body" id="svc-b${i}" role="region" aria-labelledby="svc-h${i}" inert>
      <div class="svc-inner">
        <p class="svc-text">${sv.text}</p>
        <ul class="svc-items">${sv.items.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>
    </div>
  </article>`).join("");
services.addEventListener("click", (e) => {
  const btn = e.target.closest(".svc-head");
  if (!btn) return;
  const open = btn.getAttribute("aria-expanded") !== "true";
  $$(".svc", services).forEach((svc) => {
    const on = open && svc.contains(btn);
    svc.classList.toggle("open", on);
    $(".svc-head", svc).setAttribute("aria-expanded", String(on));
    $(".svc-body", svc).inert = !on;
  });
});

/* ═══ apertura ═══ */
playIntro();
const hero = $(".hero");
const stage = $(".hero-stage");
const front = $("#heroFront");
const reelUi = $("#reelUi");
const reelPlayer = $("#reelPlayer");
const pill = $("#pill");

// tessere del mosaico e fermi immagine dello showreel (pos = punto di fuoco x, y)
const mosaic = createMosaic($("#mosaic"), {
  reduced,
  tiles: [
    { src: img("cargo-belt"), pos: [0.5, 0.4] },
    { src: img("presto-fashion-film") },
    { src: img("il-buio"), pos: [0.5, 0.35] },
    { src: img("hagia-sophia-bosco") },
    { src: img("look-book-001"), pos: [0.5, 0.3] },
    { src: img("giardino-salento") },
    { src: img("estate-italiana-shoot"), pos: [0.5, 0.3] },
    { src: img("bts-002"), pos: [0.5, 0.4] },
    { src: img("estate-italiana-film") },
    { src: img("backstage-001"), pos: [0.5, 0.45] },
  ],
  stills: [
    { src: img("estate-italiana-film") },
    { src: img("presto-fashion-film") },
    { src: img("giardino-salento") },
    { src: img("cargo-belt"), pos: [0.5, 0.45] },
    { src: img("hagia-sophia-bosco") },
    { src: img("il-buio"), pos: [0.5, 0.35] },
  ],
});

let navOn = false;
let heroP = 0;
let heroVisible = true;
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

// Fasi dell'apertura (frazioni di p, vedi PH in js/mosaic.js): roulette 0-0,40,
// showreel che si apre a tutto schermo 0,40-0,60. Da qui in poi l'interfaccia del reel.
const UI_P = PH.OPEN[1];
let sp = -1;      // p ammorbidito per il canvas: gli scatti della rotella diventano un giro continuo
let lastT = 0;

function update(now = performance.now()) {
  // il tratto bloccato si misura sullo stage e non su innerHeight: sui telefoni
  // innerHeight cambia con la barra degli indirizzi e farebbe saltare l'animazione
  const pin = hero.offsetHeight - stage.offsetHeight;
  const p = clamp(-hero.getBoundingClientRect().top / pin);
  heroP = p;

  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;
  if (sp < 0 || reduced) sp = p;
  else sp += (p - sp) * (1 - Math.exp(-dt / 0.09));
  if (Math.abs(p - sp) < 1e-4) sp = p;
  mosaic.set(sp);

  // il player Vimeo, quando ci sarà, segue il rettangolo dello showreel
  // (prima che la roulette si fermi resta nascosto)
  const rr = mosaic.reel;
  reelPlayer.style.transform = "translate(-50%, -50%)";
  reelPlayer.style.clipPath = sp < PH.ROLL ? "inset(50%)"
    : `inset(${rr.y}px ${rr.W - rr.x - rr.w}px ${rr.H - rr.y - rr.h}px ${rr.x}px round ${rr.r}px)`;

  // logo e invito spariscono appena la roulette parte
  const f = clamp(p / 0.12);
  front.style.setProperty("--front", (1 - f).toFixed(3));
  front.style.setProperty("--front-s", (1 + 0.08 * f).toFixed(3));
  front.style.visibility = f >= 1 ? "hidden" : "visible";
  stage.style.setProperty("--shade", (1 - clamp((sp - 0.28) / 0.12)).toFixed(3));

  // velature da cinema e comandi del reel a cornice aperta
  stage.style.setProperty("--bk", clamp((p - (UI_P - 0.04)) / 0.1).toFixed(3));
  reelUi.classList.toggle("on", p > UI_P + 0.02 && p < 0.999);

  // la pillola si apre solo da qui in poi, e si richiude risalendo
  const on = p >= UI_P - 0.02;
  if (on !== navOn) {
    navOn = on;
    pill.classList.toggle("on", on);
    document.body.classList.toggle("nav-on", on);
    if (on) requestAnimationFrame(() => moveInd(lit || active));
  }
}

// un solo ciclo: legge lo scroll e ridisegna il canvas, solo finché l'apertura si vede
function loop(now) {
  if (heroVisible && !document.hidden) {
    mosaic.resize();
    update(now);
    mosaic.draw(now);
  }
  requestAnimationFrame(loop);
}
// fuori dall'apertura il ciclo non disegna: serve comunque aggiornare la pillola
addEventListener("scroll", () => { if (!heroVisible) update(performance.now()); }, { passive: true });
addEventListener("resize", () => moveInd(active));
requestAnimationFrame(loop);

mountBackground(reelPlayer, VIMEO.showreel).then((ok) => {
  if (ok) $("#reelNote").textContent = "Showreel 2026";
});

// timecode a 25 fotogrammi, gira solo quando le velature si vedono
const tc = $("#tc");
const t0 = performance.now();
setInterval(() => {
  if (heroP < UI_P - 0.04 || !heroVisible) return;
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
const secs = links.map((a) => document.getElementById(a.dataset.sec));
let active = null;   // voce della sezione in cui ci si trova
let lit = null;      // voce sotto il mouse (solo mouse, mai dita)
let going = null;    // voce appena toccata: la capsula ci resta finché lo scroll non si ferma

function moveInd(a) {
  if (!a || !a.offsetWidth) {
    ind.style.opacity = 0;
    links.forEach((l) => l.classList.remove("is-lit"));
    return;
  }
  ind.style.opacity = 1;
  ind.style.left = `${a.offsetLeft}px`;
  ind.style.width = `${a.offsetWidth}px`;
  links.forEach((l) => l.classList.toggle("is-lit", l === a));
}
const paint = () => moveInd(going || lit || active);

// sezione corrente: l'ultima il cui inizio ha passato la metà dello schermo.
// In fondo alla pagina (piede) resta accesa l'ultima, cioè la call.
function findActive() {
  const mid = innerHeight / 2;
  let a = null;
  secs.forEach((sec, k) => { if (sec && sec.getBoundingClientRect().top <= mid) a = links[k]; });
  if (a !== active) { active = a; paint(); }
}

links.forEach((a) => {
  a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { lit = a; paint(); } });
  // al tocco la capsula va dritta alla destinazione, senza passare per le sezioni attraversate
  a.addEventListener("click", () => { going = a; lit = null; paint(); settle(); });
});
pill.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { lit = null; paint(); } });

let settleT = 0;
function settle() {
  clearTimeout(settleT);
  settleT = setTimeout(() => { going = null; findActive(); paint(); }, going ? 220 : 0);
}
addEventListener("scroll", () => { findActive(); if (going) settle(); }, { passive: true });

// "Showreel" porta al reel già aperto, non all'inizio del sito:
// a 0,8 del tratto bloccato roulette, apertura e velature sono finite (vedi update()).
const REEL_P = 0.8;
const reelY = () => hero.getBoundingClientRect().top + scrollY + (hero.offsetHeight - stage.offsetHeight) * REEL_P;
$(".pill .pl-reel").addEventListener("click", (e) => {
  e.preventDefault();
  scrollTo({ top: reelY(), behavior: reduced ? "auto" : "smooth" });
});
// arrivo da progetti.html con index.html#showreel
if (location.hash === "#showreel") {
  history.replaceState(null, "", location.pathname);
  requestAnimationFrame(() => scrollTo({ top: reelY(), behavior: "auto" }));
}
addEventListener("resize", () => { findActive(); paint(); });
findActive();

/* ═══ ingressi ═══ */
const revIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); revIO.unobserve(e.target); }
  });
}, { rootMargin: "0px 0px -8% 0px" });
$$(".reveal").forEach((el) => revIO.observe(el));

/* ═══ passaggio del mouse su card e blocchi dei servizi ═══ */
// Niente :hover nel CSS: scorrendo con la rotella il mouse resta fermo e la
// pagina gli passa sotto, ma il browser aggiorna :hover (e il puntatore) solo
// quando il mouse si muove, così la card restava evidenziata fuori sezione.
// Qui si guarda cosa c'è sotto il puntatore sia al movimento sia allo scroll,
// e lo stato acceso è la classe .is-on.
const cur = $("#cur");
const HOVERABLE = ".card, .svc";
let mx = -1, my = -1, cx = 0, cy = 0, hovered = null, curRaf = 0, check = 0;

// le card con più fermi immagine li scorrono finché sono accese (in attesa dei video)
let frameT = 0;
function frames(card, on) {
  clearInterval(frameT);
  const imgs = card ? $$(".card-media img", card) : [];
  if (imgs.length < 2) return;
  let k = 0;
  const show = (n) => imgs.forEach((f, j) => f.classList.toggle("on", j === n));
  if (on) frameT = setInterval(() => { k = (k + 1) % imgs.length; show(k); }, 900);
  else show(0);
}

function curLoop() {
  cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
  cur.style.left = `${cx}px`; cur.style.top = `${cy}px`;
  const moving = Math.abs(mx - cx) > 0.5 || Math.abs(my - cy) > 0.5;
  curRaf = hovered?.classList.contains("card") || moving ? requestAnimationFrame(curLoop) : 0;
}

function setLit(el) {
  if (el === hovered) return;
  if (hovered) { hovered.classList.remove("is-on"); if (hovered.classList.contains("card")) frames(hovered, false); }
  hovered = el;
  const isCard = !!el?.classList.contains("card");
  if (el) { el.classList.add("is-on"); if (isCard) frames(el, true); }
  if (isCard && !cur.classList.contains("on")) { cx = mx; cy = my; }
  cur.classList.toggle("on", isCard);
  if (isCard && !curRaf) curRaf = requestAnimationFrame(curLoop);
}

function recheck() {
  check = 0;
  if (mx < 0) return;
  setLit(document.elementFromPoint(mx, my)?.closest(HOVERABLE) || null);
}

addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  mx = e.clientX; my = e.clientY;
  if (!check) check = requestAnimationFrame(recheck);
}, { passive: true });
addEventListener("scroll", () => { if (!check) check = requestAnimationFrame(recheck); }, { passive: true });
document.documentElement.addEventListener("pointerleave", () => { mx = my = -1; setLit(null); });

/* ═══ prenota una call: calendario Cal.com ═══ */
initCal();
