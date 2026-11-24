// Vimeo: tutti gli ID video del sito stanno qui.
//
// Account MKA: user266208334, piano Pro (24/11/2026), video pubblici e
// incorporabili. Il player è integrato nella pagina (richiesta di Niccolò):
// parte da solo, muto (i browser non fanno partire l'audio senza un gesto) e
// in loop, senza l'interfaccia di Vimeo (`controls: false`, possibile con il
// Pro). Audio, pausa e posizione si comandano dai bottoni del sito con la
// Player API. Lo usano lo showreel nella tessera centrale dell'apertura e la
// cornice della pagina di ogni progetto.
//
// Lo showreel vero ancora non c'è: per prova si usa il backstage di Presto.

export const ACCOUNT = "https://vimeo.com/user266208334";

export const VIMEO = {
  showreel: "1249698383",
  // slug del progetto (js/data.js) -> ID del video
  projects: {
    "estate-italiana": "1249678955",
    "presto-fashion-film": "1249666575",
    "spiritual-land": "1249686504",
    "nuyorika": "1249690238",
    "satori-sound": "1249689644",
    "backstage-001": "1249698383",
  },
};

const API = "https://player.vimeo.com/api/player.js";
let apiPromise = null;

function loadApi() {
  if (window.Vimeo) return Promise.resolve(window.Vimeo);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = API;
      s.onload = () => resolve(window.Vimeo);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

// Il player non segnala un errore di incorporamento: semplicemente non diventa
// mai pronto. Per questo c'è un tempo massimo, dopo il quale si resta sui fermi immagine.
function readyOrTimeout(player, ms = 6000) {
  return Promise.race([
    player.ready(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

/**
 * Video integrato dentro `el`: parte da solo, muto e in loop, senza
 * l'interfaccia di Vimeo. L'iframe copre tutto il riquadro come un
 * object-fit: cover, qualunque sia il formato del video. Ritorna il player
 * quando il primo fotogramma è a schermo, null se non parte (`el` resta vuoto).
 */
export async function mountInline(el, id) {
  if (!id) return null;
  try {
    const Vimeo = await loadApi();
    const player = new Vimeo.Player(el, {
      id, autoplay: true, muted: true, loop: true, controls: false,
      playsinline: true, dnt: true, title: false, byline: false, portrait: false,
    });
    await readyOrTimeout(player);
    const [w, h] = await Promise.all([player.getVideoWidth(), player.getVideoHeight()]);
    cover(el, w / h || 16 / 9);
    // "playing" arriva al primo fotogramma: prima l'iframe sarebbe nero
    await Promise.race([new Promise((r) => player.on("playing", r)), new Promise((r) => setTimeout(r, 4000))]);
    el.classList.add("ready");
    return player;
  } catch {
    el.replaceChildren();
    return null;
  }
}

// l'iframe grande quanto basta per coprire `el` mantenendo il formato del video
function cover(el, ratio) {
  const frame = el.querySelector("iframe");
  if (!frame) return;
  const fit = () => {
    const W = el.clientWidth, H = el.clientHeight;
    const w = Math.max(W, H * ratio), h = w / ratio;
    Object.assign(frame.style, {
      position: "absolute", left: "50%", top: "50%", border: "0",
      width: `${Math.ceil(w)}px`, height: `${Math.ceil(h)}px`, transform: "translate(-50%, -50%)",
      minWidth: "0", minHeight: "0",
    });
  };
  fit();
  new ResizeObserver(fit).observe(el);
}

/** Bottone audio: accende e spegne il suono del player, testo e aria-pressed compresi. */
export function bindAudio(btn, player) {
  const set = (on) => {
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? "Audio sì" : "Audio no";
  };
  set(false);
  btn.hidden = false;
  btn.addEventListener("click", async () => {
    const on = btn.getAttribute("aria-pressed") !== "true";
    await player.setMuted(!on).catch(() => {});
    if (on) await player.setVolume(1).catch(() => {});
    // lo stato vero lo dice il player, non il clic
    set(!(await player.getMuted().catch(() => !on)));
  });
}
