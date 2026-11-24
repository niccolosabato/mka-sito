// Pagina del singolo progetto (progetto.html?p=<slug>), sullo schema di
// donprod.uk/projects: cornice del video, timeline, titolo e cliente grandi,
// crediti, galleria di foto e "Indietro / Avanti". Tutto è costruito da
// PROJECTS di js/data.js. Niente staffe né linee guida attorno al player e
// niente scritte tra le foto (richiesta di Niccolò, 24/11/2026).
import { PROJECTS } from "./data.js";
import { VIMEO, mountInline, bindAudio } from "./vimeo.js";
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

  const vimeoId = VIMEO.projects[p.slug];
  const credits = p.credits || [
    ["Cliente", p.client],
    ["Tipo", p.tag],
    ["Produzione", "MKA · Matrioska Creativa"],
  ];
  const prev = PROJECTS[(k - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(k + 1) % PROJECTS.length];

  main.innerHTML = `
  <section class="pj-hero" aria-label="${p.title}">
    <div class="pj-frame" id="frame" aria-label="Video di ${p.title}">
      <div class="pj-stills">${p.imgs.map((n, i) => pic(n, i ? "" : "on", false)).join("")}</div>
      ${vimeoId ? '<div class="pj-video" id="pjVideo" aria-hidden="true"></div>' : ""}
    </div>
    <a class="pj-side pj-side-l pj-ui" href="progetti.html"><span aria-hidden="true">&#8592;</span> Tutti i progetti</a>
    <span class="pj-side pj-side-r pj-ui">N. ${two(k + 1)} / ${two(PROJECTS.length)}</span>

    <div class="pj-bar pj-ui">
      <div class="pj-track" aria-hidden="true"><i class="pj-head" id="head"></i></div>
      <div class="pj-bar-meta">
        <span id="still">Fermo 1 / ${p.imgs.length}</span>
        <span class="vctl">
          <button class="pj-btn" type="button" id="pjAudio" aria-pressed="false" hidden>Audio no</button>
          <button class="pj-btn" type="button" id="pjPause" hidden>Pausa</button>
        </span>
        <span class="tc" id="tc">00:00:00:00</span>
      </div>
    </div>
    <div class="pj-names pj-ui">
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
      <p><a href="${p.url}" target="_blank" rel="noopener">Su Vimeo <span aria-hidden="true">&#8599;</span></a></p>
    </div>
  </section>

  <section class="pj-gallery">
    <div class="g-grid">
      ${p.imgs.map((n) => `<figure class="g-cell reveal">${pic(n)}</figure>`).join("")}
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
  const show = slideshow(stills, cur);
  // il video integrato parte da solo, muto, sopra i fermi immagine, che
  // restano solo finché il player non è pronto
  if (vimeoId) {
    mountInline($("#pjVideo"), vimeoId).then((player) => {
      if (!player) return;
      show.follow(player);
      controls(player);
    });
  }
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
  fly.innerHTML = `<img src="${still.src}" alt="" style="object-position:${still.style.objectPosition}">`;
  document.body.append(fly);
  root.classList.add("pj-flying");

  const ease = "cubic-bezier(.76, 0, .24, 1)";
  const D = 1100;
  const move = fly.animate([
    { left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px`, height: `${s.h}px` },
    { left: `${f.left}px`, top: `${f.top}px`, width: `${f.width}px`, height: `${f.height}px` },
  ], { duration: D, easing: ease, fill: "forwards" });
  await move.finished.catch(() => {});
  root.classList.remove("pj-flying", "pj-enter"); // da qui entrano titolo, timeline e comandi (CSS)
  requestAnimationFrame(() => fly.remove());
}

/* ═══ fermi immagine nella cornice, finché non parte il video ═══ */
// Ritorna { follow(player) }: da lì timeline, timecode e didascalia seguono il video.
function slideshow(stills, start) {
  const head = $("#head"), label = $("#still"), tc = $("#tc");
  const n = stills.length;
  const t0 = performance.now() - start * STILL_MS;
  let shown = start;
  let video = null; // { t, d } aggiornati da timeupdate del player
  const stamp = (sec) => {
    // timecode a 25 fotogrammi, come nello showreel della home
    const fr = Math.floor(sec * 25);
    tc.textContent = `${two(Math.floor(fr / 90000) % 24)}:${two(Math.floor(fr / 1500) % 60)}:${two(Math.floor(fr / 25) % 60)}:${two(fr % 25)}`;
  };
  const tick = (now) => {
    if (video) {
      head.style.setProperty("--p", (video.d ? video.t / video.d : 0).toFixed(4));
      stamp(video.t);
      return requestAnimationFrame(tick);
    }
    const t = now - t0;
    const total = n * STILL_MS;
    head.style.setProperty("--p", ((t % total) / total).toFixed(4));
    const i = Math.floor(t / STILL_MS) % n;
    if (i !== shown && !reduced) {
      shown = i;
      stills.forEach((s, j) => s.classList.toggle("on", j === i));
      label.textContent = `Fermo ${i + 1} / ${n}`;
    }
    stamp(t / 1000);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return {
    follow(player) {
      video = { t: 0, d: 0 };
      player.getDuration().then((d) => {
        video.d = d;
        label.textContent = `Durata ${two(Math.floor(d / 60))}:${two(Math.round(d % 60))}`;
      }).catch(() => {});
      // timeupdate arriva circa 4 volte al secondo: in mezzo si va avanti a
      // mano, ma solo mentre il video scorre davvero
      let last = performance.now(), playing = true;
      player.on("timeupdate", (e) => { video.t = e.seconds; video.d = e.duration || video.d; last = performance.now(); });
      player.on("pause", () => { playing = false; });
      player.on("play", () => { playing = true; });
      player.on("seeked", (e) => { video.t = e.seconds; });
      const run = (now) => {
        if (video.d && playing) video.t = Math.min(video.d, video.t + (now - last) / 1000);
        last = now;
        requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    },
  };
}

/* ═══ comandi del video: audio, pausa (anche col clic sulla cornice), timeline per spostarsi ═══ */
function controls(player) {
  const frame = $("#frame"), pause = $("#pjPause"), track = $(".pj-track");
  bindAudio($("#pjAudio"), player);
  let paused = false;
  const toggle = () => {
    paused = !paused;
    (paused ? player.pause() : player.play()).catch(() => {});
    pause.textContent = paused ? "Play" : "Pausa";
    cur.innerHTML = paused ? "Play" : "Pausa";
  };
  pause.hidden = false;
  pause.addEventListener("click", toggle);
  frame.addEventListener("click", toggle);
  frame.style.cursor = "pointer";

  // la timeline a tacche diventa cliccabile: porta il video a quel punto
  track.removeAttribute("aria-hidden");
  track.style.cursor = "pointer";
  track.addEventListener("click", async (e) => {
    const r = track.getBoundingClientRect();
    const d = await player.getDuration().catch(() => 0);
    if (d) player.setCurrentTime(clamp01((e.clientX - r.left) / r.width) * d).catch(() => {});
  });

  // etichetta "Pausa / Play" che segue il mouse sopra la cornice. Come nella
  // home si controlla cosa c'è sotto il puntatore anche allo scroll.
  const cur = $("#cur");
  cur.innerHTML = "Pausa";
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
const clamp01 = (x) => Math.min(1, Math.max(0, x));

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
