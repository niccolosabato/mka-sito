// Contenuti del prototipo. Titoli, clienti e link vengono dai post Instagram
// di @mka.collective; dove il post non aveva un titolo il nome è provvisorio
// (segnato con `provvisorio: true`). I membri sono tutti segnaposto.

export const PROJECTS = [
  {
    slug: "estate-italiana", title: "Estate Italiana", client: "Reviva", tag: "Fashion film",
    acc: "var(--yellow)", imgs: ["estate-italiana-film", "estate-italiana-shoot", "estate-italiana-out"],
    url: "https://www.instagram.com/p/DbDWqb-DEQP/", featured: true,
  },
  {
    slug: "presto-fashion-film", title: "Presto Fashion Film", client: "Presto", tag: "Fashion film",
    acc: "var(--red)", ink: "var(--cream)", imgs: ["presto-fashion-film", "backstage-001"],
    url: "https://www.instagram.com/p/DVLnE9DDEDF/", featured: true,
  },
  {
    slug: "cargo-belt", title: "Cargo & Belt", client: "Presto", tag: "Shooting",
    acc: "var(--blue)", imgs: ["cargo-belt"], pos: "50% 42%",
    url: "https://www.instagram.com/p/DVtGWvxjJ4O/", featured: true,
  },
  {
    slug: "look-book-001", title: "Look Book 001", client: "Presto", tag: "Lookbook",
    acc: "var(--slate)", imgs: ["look-book-001"], pos: "50% 30%",
    url: "https://www.instagram.com/p/DWjFnZbDNfv/", featured: true,
  },
  {
    slug: "il-giardino", title: "Il giardino", client: "Racconto dal Salento", tag: "Documentario",
    acc: "var(--cream)", imgs: ["giardino-salento", "hagia-sophia-bosco"], provvisorio: true,
    url: "https://www.instagram.com/p/Detc54XMlWE/", featured: true,
  },
  {
    slug: "il-buio", title: "Il buio", client: "Progetto MKA", tag: "Corto",
    acc: "var(--yellow)", imgs: ["il-buio"], pos: "50% 35%", provvisorio: true,
    url: "https://www.instagram.com/p/Dd3f7O8MfRI/", featured: true,
  },
  {
    slug: "backstage-001", title: "Backstage_001", client: "MKA", tag: "Backstage",
    acc: "var(--red)", ink: "var(--cream)", imgs: ["backstage-001"],
    url: "https://vimeo.com/1179573849",
  },
  {
    slug: "bts-002", title: "Behind the scenes 002", client: "MKA", tag: "Backstage",
    acc: "var(--slate)", imgs: ["bts-002"],
    url: "https://www.instagram.com/p/De_jtr6Mjay/",
  },
  {
    slug: "bosco", title: "Una visione nata a Istanbul", client: "Racconto dal Salento", tag: "Documentario",
    acc: "var(--blue)", imgs: ["hagia-sophia-bosco"], provvisorio: true,
    url: "https://www.instagram.com/p/DetdyrmDDl9/",
  },
];

// x, y: posizione sul tavolo (desktop). rot: inclinazione in gradi.
export const MEMBERS = [
  { name: "Nome Cognome", role: "Produzione esecutiva", img: "il-buio", pos: "50% 30%", x: "2%", y: "10px", rot: -6 },
  { name: "Nome Cognome", role: "Regia", img: "look-book-001", pos: "50% 25%", x: "35%", y: "60px", rot: 4 },
  { name: "Nome Cognome", role: "Direzione della fotografia", img: "giardino-salento", pos: "60% 40%", x: "66%", y: "0px", rot: -3 },
  { name: "Nome Cognome", role: "Aiuto regia", img: "cargo-belt", pos: "35% 45%", x: "10%", y: "390px", rot: 5 },
  { name: "Nome Cognome", role: "Fotografia", img: "estate-italiana-shoot", pos: "50% 30%", x: "42%", y: "410px", rot: -4 },
  { name: "Nome Cognome", role: "IT e sviluppo", img: "bts-002", pos: "50% 45%", x: "72%", y: "350px", rot: 7 },
];
