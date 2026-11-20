// Pagina del singolo progetto (progetto.html?p=<slug>), sullo schema di
// donprod.uk/projects: cornice del video con staffe e linee guida, timeline,
// titolo e cliente grandi, crediti, fasce di testo che scorrono, galleria e
// "Indietro / Avanti". Tutto è costruito da PROJECTS di js/data.js.
// Lo scroll resta nativo: gli effetti leggono la posizione, non la guidano.
import { PROJECTS } from "./data.js";
import { VIMEO, mountFull } from "./vimeo.js";
import { OPEN_KEY, BRACKETS, bindOpen } from "./apri.js";

window.mkaProgetto = true; // ferma il ripiego dell'<head>

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const img = (name) => `img/${name}.jpg`;
const two = (n) => String(n).padStart(2, "0");
const STILL_MS = 4000; // durata di ogni fermo immagine nella cornice

const slug = new URLSearchParams(location.search).get("p");
const k = PROJECTS.findIndex((p) => p.slug === slug);
const main = $("#pj");

if (k < 0) {
  root.classList.remove("pj-enter");
  main.innerHTML = `
    <section class="pj-missing">
      <p class="label">Progetto non trovato</p>
      <h1 class="sec-title">Qui non<br>c'è niente</h1>
      <a class="link-all" href="progetti.html">Tutti i progetti <span aria-hidden="true">&#8599;</span></a>
    </section>`;
} else {
  build(PROJECTS[k]);
}

function build(p) {
  document.title = `${p.title} · MKA Matrioska Creativa`;
  const pos = p.pos || "50% 50%";
  const pic = (name, cls = "", lazy = true) => `<img class="${cls}" src="${img(name)}" alt="" ${lazy ? 'loading="lazy"' : ""} style="object-position:${pos}">`;
  // le immagini per le sezioni più in basso: si riusa quello che c'è, a giro
  const at = (n) => p.imgs[n % p.imgs.length];

  // da dove si guarda il lavoro: per ora il post Instagram o la pagina Vimeo
  const vimeoId = VIMEO.projects[p.slug];
  const where = /vimeo\.com/.test(p.url) ? "Vimeo" : "Instagram";
  const credits = p.credits || [
    ["Cliente", p.client],
    ["Tipo", p.tag],
    ["Produzione", "MKA · Matrioska Creativa"],
  ];
  const own = /MKA/.test(p.client);
  const prev = PROJECTS[(k - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(k + 1) % PROJECTS.length];
  const band = (words, cls) => `<div class="mq ${cls}"><div class="mq-in">${Array(8).fill(`<span>${words}</span>`).join("")}</div></div>`;

  main.innerHTML = `
  <section class="pj-hero" aria-label="${p.title}">
    <div class="pj-frame" id="frame" role="link" tabindex="0" aria-label="Guarda ${p.title} su ${vimeoId ? "Vimeo" : where}">
      <div class="pj-stills">${p.imgs.map((n, i) => pic(n, i ? "" : "on", false)).join("")}</div>
      ${BRACKETS}
      <i class="pj-guide pj-guide-t" aria-hidden="true"></i><i class="pj-guide pj-guide-b" aria-hidden="true"></i>
    </div>
    <a class="pj-side pj-side-l pj-ui" href="progetti.html"><span aria-hidden="true">&#8592;</span> Tutti i progetti</a>
    <span class="pj-side pj-side-r pj-ui">N. ${two(k + 1)} / ${two(PROJECTS.length)}</span>

    <div class="pj-bar pj-ui">
      <div class="pj-track" aria-hidden="true"><i class="pj-head" id="head"></i></div>
      <div class="pj-bar-meta">
        <span id="still">Fermo 1 / ${p.imgs.length}</span>
        <a href="${p.url}" target="_blank" rel="noopener">Guarda su ${where} <span aria-hidden="true">&#8599;</span></a>
        <span class="tc" id="tc">00:00:00:00</span>
      </div>
    </div>
    <div class="pj-names pj-ui${(p.title + p.client).length > 30 ? " long" : ""}">
      <h1 class="pj-title">${p.title}</h1>
      <p class="pj-client">${p.client}</p>
    </div>
  </section>

  <section class="pj-info">
    <p class="label">Crediti</p>
    <dl class="pj-credits">${credits.map(([r, n]) => `<div><dt>${r}</dt><dd>${n}</dd></div>`).join("")}</dl>
    <div class="pj-facts">
      ${p.year ? `<p>${p.year}</p>` : ""}
      <p>${p.tag}</p>
      <p><a href="${p.url}" target="_blank" rel="noopener">Post originale <span aria-hidden="true">&#8599;</span></a></p>
    </div>
  </section>

  <section class="pj-wide">
    <ul class="pj-tags">${[p.tag, p.client, p.title, "MKA"].map((t) => `<li>${t}</li>`).join("")}</ul>
    <figure class="pj-big reveal"><div class="par" data-par="0.08">${pic(at(1))}</div></figure>
  </section>

  <section class="pj-marquee" aria-hidden="true">
    ${band(`${p.title}&ensp;·&ensp;${p.client}&ensp;·&ensp;`, "mq-a")}
    ${band(`${p.tag}&ensp;·&ensp;Matrioska Creativa&ensp;·&ensp;`, "mq-b line")}
    <figure class="mq-img">${pic(at(2))}</figure>
  </section>

  <section class="pj-words">
    <figure class="w-img w-img-1 reveal"><div class="par" data-par="0.06">${pic(at(0))}</div></figure>
    <h2 class="w-txt w-fill reveal">${p.tag}</h2>
    <h2 class="w-txt w-line reveal">${own ? "Matrioska Creativa" : `per ${p.client}`}</h2>
    <figure class="w-img w-img-2 reveal"><div class="par" data-par="0.06">${pic(at(1))}</div></figure>
  </section>

  <section class="pj-gallery">
    <p class="label">Galleria</p>
    <div class="g-grid" style="--cols:${Math.min(p.imgs.length + 1, 4)}">
      ${p.imgs.map((n) => `<figure class="g-cell reveal">${pic(n)}</figure>`).join("")}
      <div class="g-cell g-coin reveal"><img src="logo/moneta-crema.svg" alt="" width="120" height="120" loading="lazy"></div>
    </div>
  </section>

  <nav class="pj-pn" aria-label="Altri progetti">
    ${[["Indietro", prev, "prev"], ["Avanti", next, "next"]].map(([word, q, cls]) => `
      <a class="pn pn-${cls}" href="progetto.html?p=${q.slug}">
        <span class="pn-media"><img src="${img(q.imgs[0])}" alt="" loading="lazy" style="object-position:${q.pos || "50% 50%"}"></span>
        <span class="pn-word">${word}</span>
        <span class="pn-t">${q.title} · ${q.client}</span>
        ${BRACKETS}
      </a>`).join("")}
  </nav>`;

  // ─── da dove arriva l'apertura ───
  let from = null;
  try { from = JSON.parse(sessionStorage.getItem(OPEN_KEY) || "null"); sessionStorage.removeItem(OPEN_KEY); } catch { /* niente */ }
  if (from && from.slug !== p.slug) from = null;
  scrollTo({ top: 0, behavior: "instant" });

  const stills = $$(".pj-stills img");
  // se nella miniatura si vedeva un altro fermo immagine, si riparte da quello
  let cur = Math.max(0, stills.findIndex((s) => from?.src && s.src.endsWith(from.src)));
  stills.forEach((s, j) => s.classList.toggle("on", j === cur));
  enter(stills[cur], from);
  slideshow(stills, cur);
  frameClick(p, vimeoId, where);
  scrollFx();
  reveals();
  pillOnScroll();
  bindOpen($(".pj-pn"), "a.pn", (a) => {
    const im = $(".pn-media img", a);
    return { el: $(".pn-media", a), src: im.getAttribute("src"), pos: im.style.objectPosition };
  });
}

/* ═══ apertura: la miniatura si allarga fino alla cornice ═══ */
async function enter(still, from) {
  if (!root.classList.contains("pj-enter")) return;
  const frame = $("#frame");
  await Promise.race([still.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1200))]);
  const f = frame.getBoundingClientRect();
  // arrivando da un link diretto si parte da un riquadro piccolo al centro della cornice
  const w0 = Math.min(f.width * 0.36, 520), h0 = w0 * 0.62;
  const s = from?.rect || { x: f.left + (f.width - w0) / 2, y: f.top + (f.height - h0) / 2, w: w0, h: h0 };

  const fly = document.createElement("div");
  fly.className = "fly";
  Object.assign(fly.style, { left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px`, height: `${s.h}px` });
  fly.innerHTML = `<img src="${still.src}" alt="" style="object-position:${still.style.objectPosition}">${BRACKETS}
    <i class="pj-guide pj-guide-t"></i><i class="pj-guide pj-guide-b"></i>`;
  document.body.append(fly);
  root.classList.add("pj-flying");

  const ease = "cubic-bezier(.76, 0, .24, 1)";
  const D = 1100;
  const move = fly.animate([
    { left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px`, height: `${s.h}px` },
    { left: `${f.left}px`, top: `${f.top}px`, width: `${f.width}px`, height: `${f.height}px` },
  ], { duration: D, easing: ease, fill: "forwards" });
  // le linee guida partono dalla cornice e corrono fino ai bordi dello schermo
  $$(".pj-guide", fly).forEach((g) => g.animate(
    [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
    { duration: D * 0.7, delay: D * 0.35, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" },
  ));
  await move.finished.catch(() => {});
  root.classList.remove("pj-flying", "pj-enter"); // da qui entrano titolo, timeline e comandi (CSS)
  requestAnimationFrame(() => fly.remove());
}

/* ═══ fermi immagine nella cornice, in attesa dei video ═══ */
function slideshow(stills, start) {
  const head = $("#head"), label = $("#still"), tc = $("#tc");
  const n = stills.length;
  const t0 = performance.now() - start * STILL_MS;
  let shown = start;
  const tick = (now) => {
    const t = now - t0;
    const total = n * STILL_MS;
    head.style.setProperty("--p", ((t % total) / total).toFixed(4));
    const i = Math.floor(t / STILL_MS) % n;
    if (i !== shown && !reduced) {
      shown = i;
      stills.forEach((s, j) => s.classList.toggle("on", j === i));
      label.textContent = `Fermo ${i + 1} / ${n}`;
    }
    // timecode a 25 fotogrammi, come nello showreel della home
    const fr = Math.floor(t / 40);
    tc.textContent = `${two(Math.floor(fr / 90000) % 24)}:${two(Math.floor(fr / 1500) % 60)}:${two(Math.floor(fr / 25) % 60)}:${two(fr % 25)}`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ═══ clic sulla cornice: Vimeo se si può incorporare, se no la pagina esterna ═══ */
function frameClick(p, vimeoId, where) {
  const frame = $("#frame");
  const modal = $("#modal"), box = $("#modalBox");
  const open = () => {
    if (vimeoId) {
      modal.showModal();
      mountFull(box, { id: vimeoId, embeddable: VIMEO.showreel.embeddable });
    } else {
      window.open(p.url, "_blank", "noopener");
    }
  };
  frame.addEventListener("click", open);
  frame.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  const close = () => { modal.close(); box.replaceChildren(); };
  $("#modalX").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.addEventListener("close", () => box.replaceChildren());

  // etichetta "Guarda" che segue il mouse sopra la cornice. Come nella home si
  // controlla cosa c'è sotto il puntatore anche allo scroll, non solo al movimento.
  const cur = $("#cur");
  cur.innerHTML = `Guarda su ${vimeoId ? "Vimeo" : where} &#8599;`;
  let mx = -1, my = -1, raf = 0;
  const check = () => {
    raf = 0;
    const on = mx >= 0 && !!document.elementFromPoint(mx, my)?.closest("#frame");
    cur.classList.toggle("on", on);
    cur.style.left = `${mx}px`; cur.style.top = `${my}px`;
  };
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    if (!raf) raf = requestAnimationFrame(check);
  }, { passive: true });
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
  root.addEventListener("pointerleave", () => { mx = my = -1; check(); });
}

/* ═══ effetti legati allo scroll: fasce di testo e leggero parallasse ═══ */
function scrollFx() {
  if (reduced) return;
  const bands = $$(".mq");
  const pars = $$("[data-par]");
  let raf = 0;
  const run = () => {
    raf = 0;
    const vh = innerHeight;
    bands.forEach((b, i) => {
      const r = b.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const d = (r.top - vh / 2) * 0.45 * (i % 2 ? 1 : -1);
      b.firstElementChild.style.transform = `translate3d(calc(-25% + ${d.toFixed(1)}px), 0, 0)`;
    });
    pars.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const d = (r.top + r.height / 2 - vh / 2) * -Number(el.dataset.par);
      el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0) scale(1.12)`;
    });
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(run); };
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask);
  run();
}

function reveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));
}

// la pillola si apre dal centro appena si scorre, come nella home quando parte lo showreel
function pillOnScroll() {
  const pill = $("#pill");
  const set = () => pill.classList.toggle("on", scrollY > 24);
  addEventListener("scroll", set, { passive: true });
  set();
}
