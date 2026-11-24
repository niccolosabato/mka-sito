// Apertura di un progetto, sul modello di donprod.uk: la miniatura cliccata
// diventa la cornice del video nella pagina del progetto.
//
// Il passaggio è diviso in due metà. Qui, nella pagina di partenza, tutto il
// resto sfuma nel nero e la miniatura resta sola.
// Posizione e immagine vanno in sessionStorage. La pagina del progetto
// (js/progetto.js) riparte da lì e allarga la miniatura fino alla cornice.
// Fondo nero da una parte e dall'altra: nessun lampo durante il cambio pagina.

export const OPEN_KEY = "mka-apri";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Intercetta i clic sui link ai progetti dentro `root`. */
export function bindOpen(root, selector, pickSource) {
  root.addEventListener("click", (e) => {
    const a = e.target.closest(selector);
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    leave(a, pickSource(a));
  });
}

// la miniatura sola sul nero, poi il cambio pagina
function leave(a, src) {
  const href = a.href;
  const slug = new URL(href).searchParams.get("p");
  const save = (rect) => {
    try {
      sessionStorage.setItem(OPEN_KEY, JSON.stringify({ slug, src: src?.src, pos: src?.pos, rect }));
    } catch { /* senza storage la pagina del progetto parte dal centro */ }
  };
  if (reduced || !src?.el) { save(null); location.href = href; return; }

  const r = src.el.getBoundingClientRect();
  const rect = { x: r.left, y: r.top, w: r.width, h: r.height };
  save(rect);

  const veil = document.createElement("div");
  veil.className = "leave-veil";
  const fly = document.createElement("div");
  fly.className = "fly";
  Object.assign(fly.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px`, borderRadius: src.radius || "0px" });
  fly.innerHTML = `<img src="${src.src}" alt="" style="object-position:${src.pos || "50% 50%"}">`;
  document.body.append(veil, fly);

  const ease = "cubic-bezier(.22, 1, .36, 1)";
  veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: ease, fill: "forwards" });
  fly.animate([{ borderRadius: src.radius || "0px" }, { borderRadius: "0px" }], { duration: 380, easing: ease, fill: "forwards" });
  setTimeout(() => { location.href = href; }, 400);

  // tornando indietro col pulsante del browser la pagina può arrivare dalla
  // cache così com'era: velo e miniatura vanno tolti
  addEventListener("pageshow", (e) => { if (e.persisted) { veil.remove(); fly.remove(); } }, { once: true });
}

/** Le quattro staffe agli angoli (usate da "Indietro / Avanti"). */
export const BRACKETS = '<i class="br br-tl"></i><i class="br br-tr"></i><i class="br br-bl"></i><i class="br br-br"></i>';
