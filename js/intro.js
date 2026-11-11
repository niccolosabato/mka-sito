// Intro: la moneta del logo cade al centro dello schermo nero, rimbalza, si
// assesta e poi va al suo posto nella O di MATRIOSKA. Le lettere si aprono
// intorno a lei e il resto del sito compare. Parte solo se nell'<head> è stata
// messa la classe .intro (niente intro con "riduci movimento"). Qualsiasi gesto
// (scroll, tasto, tocco, clic) la chiude subito: niente attese forzate.
//
// Il moto della moneta si calcola qui fotogramma per fotogramma (un keyframe
// ogni 20 ms) e il browser lo riproduce con la Web Animations API. Il giro su se
// stessa si fa schiacciando la larghezza con |cos|: con un rotateY vero il retro
// mostrerebbe la scritta MKA allo specchio.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outQuad = (t) => 1 - (1 - t) * (1 - t);
const bump = (t, at, w) => Math.exp(-(((t - at) / w) ** 2)); // picco breve attorno ad "at"

// tempi in millisecondi
const LAND = 700; // tocca terra
const HOP1 = 300; // primo rimbalzo
const HOP2 = 160; // secondo, piccolo
const STILL = 1500; // ferma e assestata
const GO = 1760; // parte verso il logo
const TRAVEL = 1000; // dal centro al suo posto
const TOTAL = GO + TRAVEL;
const STEP = 20;

export function playIntro() {
  const root = document.documentElement;
  if (!root.classList.contains("intro")) return;
  window.mkaIntro = true; // ferma il ripiego dell'<head>

  const coin = document.getElementById("heroCoin");
  const letters = document.querySelector(".hero-letters");
  const [top, line, bottom] = [".top", ".hero-line", ".hero-bottom"].map((s) => document.querySelector(s));
  const backdrop = [".mosaic", ".hero-shade"].map((s) => document.querySelector(s));
  const anims = [];
  let over = false;

  const skipOn = ["wheel", "touchstart", "keydown", "pointerdown"];
  // il browser lancia uno scroll anche quando ripristina la posizione 0 ricaricando:
  // conta solo se la pagina si è mossa davvero
  const onScroll = () => { if (scrollY > 4) end(); };
  const end = () => {
    if (over) return;
    over = true;
    skipOn.forEach((t) => removeEventListener(t, end));
    removeEventListener("scroll", onScroll);
    anims.forEach((a) => a.cancel()); // senza animazioni resta lo stato normale del sito
    coin.style.opacity = "";
    root.classList.remove("intro");
  };
  skipOn.forEach((t) => addEventListener(t, end, { passive: true }));
  addEventListener("scroll", onScroll, { passive: true });

  // ricarica a pagina già scorsa: il browser riporta giù, l'intro non ha senso
  if (scrollY > 4) return end();

  const ready = Promise.all([coin, letters].map((i) => i.decode().catch(() => {})));
  Promise.race([ready, sleep(1500)]).then(() => sleep(180)).then(() => {
    if (!over) run();
  });

  function run() {
    // tutto è relativo al posto finale della moneta (trasformazione nulla)
    const r = coin.getBoundingClientRect();
    const vw = innerWidth;
    const vh = innerHeight;
    const cx = vw / 2 - (r.left + r.width / 2);
    const cy = vh / 2 - (r.top + r.height / 2);
    const S = Math.min(vw * 0.42, vh * 0.42, 340) / r.width; // grande al centro
    const size = r.width * S;
    const y0 = cy - vh / 2 - size * 0.7; // parte da sopra lo schermo
    const hop = Math.min(vh * 0.07, size * 0.35);
    // punto di controllo dell'arco verso il logo: sale appena prima di posarsi
    const kx = cx * 0.55;
    const ky = cy * 0.55 - Math.min(vh * 0.1, size * 0.5);

    function at(t) {
      let x = cx, y = cy, s = S, spin = 0, rz = 0;
      if (t < LAND) {
        const u = t / LAND;
        y = y0 + (cy - y0) * u * u; // gravità
        spin = 2 * outQuad(u); // due giri, a terra è di nuovo di faccia
        rz = -26 + 26 * u;
      } else if (t < LAND + HOP1) {
        const u = (t - LAND) / HOP1;
        y = cy - hop * 4 * u * (1 - u);
      } else if (t < LAND + HOP1 + HOP2) {
        const u = (t - LAND - HOP1) / HOP2;
        y = cy - hop * 0.22 * 4 * u * (1 - u);
      }
      if (t >= LAND && t < GO) {
        // ondeggia come una moneta che si ferma sul tavolo
        const d = t - LAND;
        rz = 6 * Math.exp(-d / 260) * Math.sin((2 * Math.PI * d) / 280);
      }
      // si schiaccia appena a ogni urto
      const sq = 0.07 * bump(t, LAND, 40) + 0.03 * bump(t, LAND + HOP1, 30) + 0.012 * bump(t, LAND + HOP1 + HOP2, 25);
      if (t >= GO) {
        const e = inOut(clamp((t - GO) / TRAVEL));
        const a = (1 - e) * (1 - e);
        const b = 2 * (1 - e) * e;
        x = a * cx + b * kx;
        y = a * cy + b * ky;
        s = S + (1 - S) * e;
        spin = e; // un giro mentre si rimpicciolisce
      }
      const sx = Math.max(0.06, Math.abs(Math.cos(spin * 2 * Math.PI))) * (1 + sq * 0.6);
      const sy = 1 - sq;
      return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rz.toFixed(2)}deg) scale(${(s * sx).toFixed(4)}, ${(s * sy).toFixed(4)})`;
    }

    const frames = [];
    for (let t = 0; t <= TOTAL; t += STEP) frames.push({ transform: at(t) });
    frames[frames.length - 1] = { transform: "none" };

    coin.style.opacity = "1";
    anims.push(coin.animate(frames, { duration: TOTAL, easing: "linear" }));

    // il sito torna visibile: ogni pezzo resta nascosto fino al suo turno
    root.classList.remove("intro");
    const reveal = GO + TRAVEL * 0.5;
    const show = (el, keys, delay, duration) =>
      anims.push(el.animate(keys, { delay, duration, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "backwards" }));
    // le lettere si aprono dal centro della moneta (58,7% 26,9% del logo)
    show(letters, [
      { clipPath: "circle(0% at 58.7% 26.9%)", opacity: 0 },
      { clipPath: "circle(20% at 58.7% 26.9%)", opacity: 1, offset: 0.3 },
      { clipPath: "circle(90% at 58.7% 26.9%)", opacity: 1 },
    ], reveal, 1000);
    backdrop.forEach((el) => show(el, [{ opacity: 0, transform: "scale(1.06)" }, { opacity: 1, transform: "none" }], reveal + 250, 1500));
    show(line, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], reveal + 450, 800);
    show(bottom, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], reveal + 600, 800);
    show(top, [{ opacity: 0 }, { opacity: 1 }], reveal + 700, 800);

    Promise.all(anims.map((a) => a.finished)).then(end, () => {});
  }
}
