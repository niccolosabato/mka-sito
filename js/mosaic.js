// Il mosaico dell'apertura disegnato su un <canvas> grande quanto lo schermo.
//
// Prima era una griglia DOM di tessere grandi come lo schermo, scalata e
// ruotata in blocco: un livello da 9 schermi che sui telefoni il browser non
// riesce a tenere in memoria (a metà scroll il mosaico spariva nel nero). Il
// canvas invece è sempre grande quanto lo schermo, qualunque sia la scala.
//
// La geometria è quella di recordstudio.it: tessere grandi quanto lo schermo,
// a riposo scala 0,4 e rotazione -30°, colonne sfalsate in verticale. Il numero
// di colonne e righe si calcola in modo che lo schermo ruotato sia sempre
// coperto: niente angoli neri, nemmeno su un telefono in verticale.

const S0 = 0.4;              // scala a riposo
const R0 = -30 * Math.PI / 180;
const RAD0 = 28;             // raggio degli angoli delle tessere (px a scala 1)

// sfalsamento verticale delle colonne, in frazioni di altezza della tessera.
// La colonna centrale non si sposta: la sua tessera centrale è lo showreel.
const OFF_R = [0.29, -0.21, 0.33, -0.17, 0.24];
const OFF_L = [-0.34, 0.25, -0.19, 0.3, -0.23];
const colOff = (d) => (d === 0 ? 0 : d > 0 ? OFF_R[(d - 1) % 5] : OFF_L[(-d - 1) % 5]);

const odd = (n) => (n % 2 ? n : n + 1);

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

  let W = 0, H = 0, dpr = 1, C = 3, R = 3, gap = 60;
  let state = { s: S0, r: R0, k: 1, rad: RAD0 };

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const d = Math.min(devicePixelRatio || 1, 2);
    // il canvas si rialloca solo se cambia davvero misura: sui telefoni la
    // barra degli indirizzi lancia "resize" di continuo
    if (w === W && h === H && d === dpr) return;
    W = w; H = h; dpr = d;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gap = Math.max(16, Math.min(60, W * 0.04));
    // quanto deve essere grande la griglia, nel suo riferimento ruotato, per
    // coprire lo schermo: proiezione dello schermo sugli assi ruotati
    const cs = Math.abs(Math.cos(R0)), sn = Math.abs(Math.sin(R0));
    const needW = W * cs + H * sn, needH = W * sn + H * cs;
    C = odd(Math.ceil(needW / (S0 * (W + gap))) + 1);
    R = odd(Math.ceil(needH / (S0 * (H + gap))) + 2); // +2 per lo sfalsamento
  }

  // disegna un'immagine "a copertura" (come object-fit: cover) nel rettangolo
  function cover(o, x, y, w, h, zoom, alpha) {
    if (!o.ok) return;
    const iw = o.im.naturalWidth, ih = o.im.naturalHeight;
    const sc = Math.max(w / iw, h / ih) * zoom;
    const sw = w / sc, sh = h / sc;
    const sx = (iw - sw) * o.pos[0], sy = (ih - sh) * o.pos[1];
    ctx.globalAlpha = alpha;
    ctx.drawImage(o.im, sx, sy, sw, sh, x, y, w, h);
    ctx.globalAlpha = 1;
  }

  function draw(now) {
    const { s, r, k, rad } = state;
    const t = now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingQuality = "medium";

    ctx.translate(W / 2, H / 2);
    ctx.rotate(r);
    ctx.scale(s, s);

    const cc = (C - 1) / 2, rc = (R - 1) / 2;
    const reach = Math.hypot(W, H) / 2;          // metà diagonale dello schermo
    const tileR = Math.hypot(W, H) / 2 * s;      // metà diagonale di una tessera a schermo
    const cosr = Math.cos(r), sinr = Math.sin(r);

    for (let c = 0; c < C; c++) {
      const d = c - cc;
      const lx = d * (W + gap);
      const oy = colOff(d) * H * k;
      for (let j = 0; j < R; j++) {
        const ly = (j - rc) * (H + gap) + oy;
        // scarta le tessere fuori schermo prima di disegnarle
        const px = (lx * cosr - ly * sinr) * s, py = (lx * sinr + ly * cosr) * s;
        if (Math.hypot(px, py) - tileR > reach) continue;

        const x = lx - W / 2, y = ly - H / 2;
        ctx.save();
        ctx.beginPath();
        if (rad > 0.5 && ctx.roundRect) ctx.roundRect(x, y, W, H, rad);
        else ctx.rect(x, y, W, H);
        ctx.clip();
        ctx.fillStyle = "#111";
        ctx.fillRect(x, y, W, H);

        if (d === 0 && j === rc) {
          drawReel(x, y, t);
        } else {
          // ogni tessera "respira" piano, come un video in loop
          const ph = (c * 7 + j * 3) % 11;
          const zoom = reduced ? 1.04 : 1.07 + 0.05 * Math.sin(t / 2.6 + ph);
          cover(tileImgs[(c * 5 + j * 3) % tileImgs.length], x, y, W, H, zoom, 1);
        }
        ctx.restore();
      }
    }
  }

  // showreel provvisorio: fermi immagine a dissolvenza con zoom lento
  const HOLD = reduced ? 5 : 3.2, FADE = 1;
  function drawReel(x, y, t) {
    if (!stillImgs.length) return;
    const cyc = t / HOLD;
    const i = Math.floor(cyc) % stillImgs.length;
    const f = cyc - Math.floor(cyc);
    const zoomOf = (u) => (reduced ? 1.04 : 1.04 + 0.1 * u);
    // l'immagine uscente resta sotto mentre la nuova entra
    const into = Math.min(1, (f * HOLD) / FADE);
    if (into < 1) {
      const prev = (i - 1 + stillImgs.length) % stillImgs.length;
      cover(stillImgs[prev], x, y, W, H, zoomOf(1), 1);
    }
    cover(stillImgs[i], x, y, W, H, zoomOf(f), into);
  }

  return {
    resize,
    set(v) { state = v; },
    draw,
    get size() { return { W, H }; },
    S0, R0, RAD0,
  };
}
