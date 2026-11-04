// Vimeo: tutti gli ID video del sito stanno qui.
//
// Stato a novembre 2026: l'account MKA su Vimeo è free e il player risponde
// 401 da qualunque sito, quindi niente incorporamento. In più la modalità
// background (video muto in loop senza controlli, quella dello showreel
// nell'apertura) richiede un piano a pagamento. Finché `embeddable` resta
// false il sito mostra i fermi immagine e il pulsante apre la pagina Vimeo.
//
// Il video in bio (1179573849) è BACKSTAGE_001, non uno showreel: va
// sostituito quando esce il reel vero.

export const VIMEO = {
  showreel: { id: "1179573849", embeddable: false, background: false },
  // un ID per progetto quando ci saranno i video, es. "estate-italiana": "123456789"
  projects: {},
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

// Il player non segnala un 401: semplicemente non diventa mai pronto.
// Per questo c'è un tempo massimo, dopo il quale si passa al ripiego.
function readyOrTimeout(player, ms = 5000) {
  return Promise.race([
    player.ready(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export function pageUrl(id) {
  return `https://vimeo.com/${id}`;
}

/** Showreel muto in loop dentro la tessera centrale. Ritorna true se parte. */
export async function mountBackground(el, cfg = VIMEO.showreel) {
  if (!cfg.id || !cfg.embeddable || !cfg.background) return false;
  try {
    const Vimeo = await loadApi();
    const player = new Vimeo.Player(el, {
      id: cfg.id, background: true, muted: true, loop: true, dnt: true,
    });
    await readyOrTimeout(player);
    el.classList.add("ready");
    return true;
  } catch {
    el.replaceChildren();
    return false;
  }
}

/** Player completo, con audio e controlli, dentro la modale. */
export async function mountFull(el, cfg = VIMEO.showreel) {
  const fallback = () => {
    el.innerHTML = `
      <div class="modal-fb">
        <p>Il video su Vimeo per ora non si può incorporare nel sito: l'account è free e ha l'incorporamento disattivato.</p>
        <p><a class="btn btn-cream" href="${pageUrl(cfg.id)}" target="_blank" rel="noopener">Guardalo su Vimeo &#8599;</a></p>
      </div>`;
  };
  if (!cfg.id || !cfg.embeddable) return fallback();
  try {
    const Vimeo = await loadApi();
    const player = new Vimeo.Player(el, { id: cfg.id, autoplay: true, dnt: true, color: "F1EDE4" });
    await readyOrTimeout(player);
  } catch {
    fallback();
  }
}
