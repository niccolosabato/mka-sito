// Il mosaico dell'apertura disegnato su un <canvas> grande quanto lo schermo,
// variante "roulette".
//
// A riposo è una griglia dritta di tessere (proporzioni dello schermo, scala
// S0; su schermo verticale orizzontali in 16:9), le file sfalsate di mezza
// tessera e in lento movimento orizzontale.
// Scorrendo, le file girano come i rulli di una slot: partono velocissime
// (con scia di movimento) e rallentano fino a fermarsi in griglia, con al
// centro la tessera dello showreel. Poi le altre si spengono e lo showreel si
// apre dalla sua tessera fino a tutto schermo.
//
// Tutto è funzione di p (0..1 sul tratto bloccato, vedi js/main.js): si può
// tornare indietro in ogni momento. Resta un canvas grande quanto lo schermo
// per lo stesso motivo del prototipo principale (le griglie DOM giganti sui
// telefoni sparivano).

const S0 = 0.34;   // scala delle tessere a riposo
// su schermo verticale (telefono) le tessere restano orizzontali, in 16:9,
// larghe questa frazione dello schermo: con le proporzioni dello schermo
// sarebbero state strette e alte
const PORTRAIT_W = 0.56;
const RAD = 0;     // raggio degli angoli delle tessere, px a schermo (prova squadrata: era 10)

// fasi, come frazioni di p
export const PH = {
  ROLL: 0.40,                 // 0 → ROLL: la roulette gira e si ferma
  FADE: [0.40, 0.50],         // le altre tessere si spengono
  OPEN: [0.40, 0.60],         // lo showreel si apre a tutto schermo
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, [a, b]) => clamp((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out4 = (t) => 1 - Math.pow(1 - t, 4); // come una ruota che rallenta

export function createMosaic(canvas, { tiles, stills, reduced }) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const load = (t) => {
    const im = new Image();
    im.decoding = "async";
    im.src = t.src;
    const o = { im, pos: t.pos || [0.5, 0.5], ok: false };
    im.decode().then(() => { o.ok = true; }).catch(() => { o.ok = im.complete && im.naturalWidth > 0; });
    return o;
  };
  const tileImgs = tiles.map(load);
  const stillImgs = stills.map(load);
  const L = tileImgs.length;

  let W = 0, H = 0, dpr = 1, gap = 24, rows = 1;
  let p = 0;
  let tw = 0, th = 0;          // misura delle tessere a riposo
  const prevOff = new Map();   // ultimo spostamento di ogni fila, per la scia

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const d = Math.min(devicePixelRatio || 1, 2);
    // il canvas si rialloca solo se cambia davvero misura: sui telefoni la
    // barra degli indirizzi lancia "resize" di continuo
    if (w === W && h === H && d === dpr) return;
    W = w; H = h; dpr = d;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gap = Math.max(10, Math.min(26, W * 0.018));
    if (H > W) { tw = W * PORTRAIT_W; th = tw * 9 / 16; }
    else { tw = W * S0; th = H * S0; }
    // file sopra e sotto quella centrale, quante bastano a coprire lo schermo
    rows = Math.ceil((H / 2) / (th + gap)) + 1;
    prevOff.clear();
  }

  // immagine "a copertura" (come object-fit: cover) nel rettangolo
  function cover(o, x, y, w, h, zoom = 1) {
    if (!o.ok) return;
    const iw = o.im.naturalWidth, ih = o.im.naturalHeight;
    const sc = Math.max(w / iw, h / ih) * zoom;
    const sw = w / sc, sh = h / sc;
    const sx = (iw - sw) * o.pos[0], sy = (ih - sh) * o.pos[1];
    ctx.drawImage(o.im, sx, sy, sw, sh, x, y, w, h);
  }

  function draw(now) {
    const t = now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingQuality = "medium";

    const pw = tw + gap, ph = th + gap;
    const f = out4(clamp(p / PH.ROLL));
    const landed = p >= PH.ROLL;
    const small = W < 700;

    for (let d = -rows; d <= rows; d++) {
      const y = H / 2 + d * ph - th / 2;
      if (y > H || y + th < 0) continue;
      const ad = Math.abs(d);
      // la fila centrale va a sinistra, le altre alternano verso
      const dir = d === 0 ? -1 : ad % 2 ? 1 : -1;
      const N = reduced ? (d === 0 ? 3 : 2) : d === 0 ? 26 : 14 + 5 * ad;
      // a riposo le file scorrono piano, sfalsate di mezza tessera; la deriva
      // si avvolge su L tessere, così le immagini non saltano
      const idle = reduced ? 0 : dir * ((t * pw * 0.035) % (L * pw)) + (ad % 2) * 0.5 * pw;
      const off = lerp(idle, dir * N * pw, f);

      // scia: quanto si è spostata la fila dall'ultimo fotogramma
      const last = prevOff.get(d);
      prevOff.set(d, off);
      const delta = last === undefined || reduced ? 0 : off - last;
      const spread = Math.min(Math.abs(delta), pw * 0.9);
      const n = spread < 3 ? 1 : clamp(Math.ceil(spread / (small ? 30 : 16)), 2, small ? 5 : 8);
      const back = -Math.sign(delta) * spread; // le copie restano indietro rispetto al moto

      const lo = Math.ceil((-W / 2 - tw / 2 - spread - off) / pw);
      const hi = Math.floor((W / 2 + tw / 2 + spread - off) / pw);
      for (let i = lo; i <= hi; i++) {
        // la tessera N della fila centrale è lo showreel: è lei che si ferma al centro
        const isReel = d === 0 && i === N;
        if (isReel && landed) continue; // da qui la disegna la fase di apertura
        const x = W / 2 + i * pw + off - tw / 2;
        const x0 = Math.min(x, x + back), x1 = Math.max(x, x + back) + tw;
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x0, y, x1 - x0, th, RAD); else ctx.rect(x0, y, x1 - x0, th);
        ctx.clip();
        ctx.fillStyle = "#111";
        ctx.fillRect(x0, y, x1 - x0, th);
        const im = tileImgs[(((i * 3 + d * 7) % L) + L) % L];
        const zoom = reduced ? 1.04 : 1.06 + 0.03 * Math.sin(t / 2.6 + i + d * 2);
        for (let k = 0; k < n; k++) {
          ctx.globalAlpha = 1 / (k + 1);  // media mobile delle copie
          const xk = x + (n > 1 ? (back * k) / (n - 1) : 0);
          if (isReel) drawReel(xk, y, tw, th, t);
          else cover(im, xk, y, tw, th, zoom);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    if (!landed) return;

    // le altre tessere si spengono nel nero
    ctx.globalAlpha = seg(p, PH.FADE);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // lo showreel si apre dalla sua tessera a tutto schermo. Su schermo
    // orizzontale tessera e schermo hanno le stesse proporzioni e l'immagine
    // cresce senza cambiare taglio; su quello verticale la tessera 16:9 si
    // allunga in altezza e il taglio si adatta mentre si apre
    const r = reelRect();
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect && r.r > 0.5) ctx.roundRect(r.x, r.y, r.w, r.h, r.r); else ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();
    drawReel(r.x, r.y, r.w, r.h, t);
    ctx.restore();
  }

  // rettangolo dello showreel durante l'apertura, in px a schermo
  function reelRect() {
    const o = inOut(seg(p, PH.OPEN));
    const w = lerp(tw, W, o), h = lerp(th, H, o);
    return { x: (W - w) / 2, y: (H - h) / 2, w, h, r: RAD * (1 - o), open: o };
  }

  // showreel provvisorio: fermi immagine a dissolvenza con zoom lento
  const HOLD = reduced ? 5 : 3.2, FADE = 1;
  function drawReel(x, y, w, h, t) {
    if (!stillImgs.length) return;
    const cyc = t / HOLD;
    const i = Math.floor(cyc) % stillImgs.length;
    const fr = cyc - Math.floor(cyc);
    const zoomOf = (u) => (reduced ? 1.04 : 1.04 + 0.1 * u);
    // l'immagine uscente resta sotto mentre la nuova entra
    const into = Math.min(1, (fr * HOLD) / FADE);
    if (into < 1) {
      const prev = (i - 1 + stillImgs.length) % stillImgs.length;
      cover(stillImgs[prev], x, y, w, h, zoomOf(1));
    }
    ctx.globalAlpha = into;
    cover(stillImgs[i], x, y, w, h, zoomOf(fr));
    ctx.globalAlpha = 1;
  }

  return {
    resize,
    set(v) { p = v; },
    draw,
    // dove sta lo showreel, per allinearci il player Vimeo
    get reel() { return { ...reelRect(), W, H }; },
  };
}
