// Contenuti del prototipo. Titoli, clienti e link vengono dai post Instagram
// di @mka.collective; dove il post non aveva un titolo il nome è provvisorio
// (segnato con `provvisorio: true`).

export const PROJECTS = [
  {
    slug: "estate-italiana", title: "Estate Italiana", client: "Reviva", tag: "Fashion film",
    imgs: ["estate-italiana-film", "estate-italiana-shoot", "estate-italiana-out"],
    url: "https://www.instagram.com/p/DbDWqb-DEQP/", featured: true,
  },
  {
    slug: "presto-fashion-film", title: "Presto Fashion Film", client: "Presto", tag: "Fashion film",
    imgs: ["presto-fashion-film", "backstage-001"],
    url: "https://www.instagram.com/p/DVLnE9DDEDF/", featured: true,
  },
  {
    slug: "cargo-belt", title: "Cargo & Belt", client: "Presto", tag: "Shooting",
    imgs: ["cargo-belt"], pos: "50% 42%",
    url: "https://www.instagram.com/p/DVtGWvxjJ4O/", featured: true,
  },
  {
    slug: "look-book-001", title: "Look Book 001", client: "Presto", tag: "Lookbook",
    imgs: ["look-book-001"], pos: "50% 30%",
    url: "https://www.instagram.com/p/DWjFnZbDNfv/", featured: true,
  },
  {
    slug: "il-giardino", title: "Il giardino", client: "Racconto dal Salento", tag: "Documentario",
    imgs: ["giardino-salento", "hagia-sophia-bosco"], provvisorio: true,
    url: "https://www.instagram.com/p/Detc54XMlWE/", featured: true,
  },
  {
    slug: "il-buio", title: "Il buio", client: "Progetto MKA", tag: "Corto",
    imgs: ["il-buio"], pos: "50% 35%", provvisorio: true,
    url: "https://www.instagram.com/p/Dd3f7O8MfRI/", featured: true,
  },
  {
    slug: "backstage-001", title: "Backstage_001", client: "MKA", tag: "Backstage",
    imgs: ["backstage-001"],
    url: "https://vimeo.com/1179573849",
  },
  {
    slug: "bts-002", title: "Behind the scenes 002", client: "MKA", tag: "Backstage",
    imgs: ["bts-002"],
    url: "https://www.instagram.com/p/De_jtr6Mjay/",
  },
  {
    slug: "bosco", title: "Una visione nata a Istanbul", client: "Racconto dal Salento", tag: "Documentario",
    imgs: ["hagia-sophia-bosco"], provvisorio: true,
    url: "https://www.instagram.com/p/DetdyrmDDl9/",
  },
];

// I tre blocchi della sezione "I nostri servizi": cosa fa MKA.
// Titoli e testi sono provvisori, da compilare con il collettivo.
export const SERVICES = [
  {
    title: "Direzione creativa",
    text: "Dall'idea al concept visivo: scriviamo il racconto, scegliamo il tono e seguiamo il progetto fino all'ultima inquadratura.",
    items: ["Concept", "Regia", "Direzione della fotografia", "Scenografia"],
  },
  {
    title: "Servizi di produzione multimediale",
    text: "Organizziamo e realizziamo riprese video e shooting fotografici, dalla preproduzione alla consegna dei file finali.",
    items: ["Produzione esecutiva", "Riprese", "Fotografia", "Post-produzione"],
  },
  {
    title: "Identità e strategia",
    text: "Aiutiamo marchi e progetti a trovare un linguaggio riconoscibile e a usarlo con coerenza su ogni canale.",
    items: ["Identità visiva", "Art direction", "Strategia dei contenuti", "Social"],
  },
];
