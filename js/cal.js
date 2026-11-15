/* Prenota una call: calendario Cal.com incorporato nella sezione #call.
   CAL_LINK è "utente/tipo-di-evento" dell'account Cal.com di MKA. Per ora è
   l'evento di mezz'ora dell'account di MKA (novembre 2026). */
export const CAL_LINK = "mka-mxgoxl/30min";

const BOX = "#calInline";
const RED = "#A93F33";

// snippet ufficiale di Cal.com: mette in coda le chiamate finché embed.js non è caricato
function loader() {
  (function (C, A, L) {
    const p = (a, ar) => a.q.push(ar);
    const d = C.document;
    C.Cal = C.Cal || function () {
      const cal = C.Cal;
      const ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const ns = ar[1];
        api.q = api.q || [];
        if (typeof ns === "string") {
          cal.ns[ns] = cal.ns[ns] || api;
          p(cal.ns[ns], ar);
          p(cal, ["initNamespace", ns]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");
}

function mount() {
  loader();
  const Cal = window.Cal;
  Cal("init", "mka", { origin: "https://app.cal.com" });
  Cal.ns.mka("inline", {
    elementOrSelector: BOX,
    calLink: CAL_LINK,
    config: { layout: "month_view", theme: "dark", useSlotsViewOnSmallScreen: "true" },
  });
  // il link di riserva serve solo se il calendario non arriva
  Cal.ns.mka("on", {
    action: "linkReady",
    callback: () => document.querySelector(BOX).closest(".cal-wrap").classList.add("is-ready"),
  });
  Cal.ns.mka("ui", {
    theme: "dark",
    layout: "month_view",
    hideEventTypeDetails: false,
    // fondo nero come il sito, rosso del branding sui giorni e sui bottoni
    cssVarsPerTheme: {
      dark: {
        "cal-brand": RED, "cal-brand-emphasis": "#c24a3c", "cal-brand-text": "#F1EDE4",
        "cal-bg": "#000000", "cal-bg-muted": "#000000", "cal-bg-subtle": "#141414", "cal-bg-emphasis": "#1f1f1f",
        "cal-text": "#F1EDE4", "cal-text-emphasis": "#F1EDE4",
        "cal-border": "#3a3a3a", "cal-border-subtle": "#262626", "cal-border-booker": "#262626",
      },
    },
  });
}

// il calendario pesa: si carica solo quando la sezione si avvicina
export function initCal() {
  const box = document.querySelector(BOX);
  if (!box) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    mount();
  }, { rootMargin: "800px 0px" });
  io.observe(box);
}
