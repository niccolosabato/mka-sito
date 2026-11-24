// Contenuti del sito: i sei lavori che MKA ha su Vimeo (account
// user266208334). I crediti sono quelli delle descrizioni dei video, con i
// ruoli tradotti; dove un dato non c'era è provvisorio (`provvisorio: true`).
// I progetti di prova presi da Instagram sono stati tolti il 24/11/2026.
// Il video di ogni progetto si collega in js/vimeo.js, non qui.
// Campi facoltativi per la pagina del progetto (progetto.html?p=<slug>):
// `credits: [["Regia", "Nome"], ...]` (senza, cliente, tipo e produzione MKA)
// e `year`. `pos` è il punto di fuoco delle immagini nelle cornici larghe.

export const PROJECTS = [
  {
    slug: "estate-italiana", title: "Estate Italiana", client: "Reviva", tag: "Fashion film",
    imgs: ["estate-italiana-film", "estate-italiana-shoot", "estate-italiana-out"],
    url: "https://vimeo.com/1249678955", featured: true,
    credits: [
      ["Produzione esecutiva", "Ascanio Grande"],
      ["Regia", "Daniele D'Amato"],
      ["Direzione della fotografia e camera", "Lorenzo Resta"],
      ["Assistente operatore", "Melissa"],
      ["Styling", "Elisa D'Oria"],
      ["Scenografia", "Miriana Liberti"],
      ["Trucco", "Francesco Corvaglia"],
      ["Montaggio e sound design", "Daniele D'Amato"],
      ["Color", "Lorenzo Resta"],
      ["Fotografia", "Riccardo Balena"],
      ["Attori", "Bakary Manneh, Giulia, Alessandro Caló"],
      ["Vespa", "Riccardo Sodero"],
      ["Backstage", "Andrea Resta"],
    ],
  },
  {
    slug: "presto-fashion-film", title: "Presto Fashion Film", client: "Presto", tag: "Fashion film",
    imgs: ["presto-fashion-film", "presto-backstage"],
    url: "https://vimeo.com/1249666575", featured: true,
    credits: [
      ["Produzione esecutiva", "Ascanio Grande"],
      ["Regia", "Daniele D'Amato"],
      ["Aiuto regia", "Antonio Vincenti"],
      ["Direzione della fotografia e camera", "Lorenzo Resta"],
      ["Colonna sonora", "Luca Ciardo"],
      ["Voce", "Federico Gravili aka B-KILLER"],
      ["Montaggio e sound design", "Daniele D'Amato"],
      ["VFX e AI", "Lorenzo Resta"],
      ["Scenografia", "Miriana Liberti"],
      ["Styling", "Mattia Mazzarella"],
      ["Trucco", "Francesco Corvaglia"],
      ["Attori", "Bakary Manneh, Gianmaria Bellanova, Francesco Corvaglia, Jacopo Durante, Federico Gravili, Giada Serìo"],
      ["Fotografia", "Riccardo Balena"],
      ["Backstage", "Giulio Biffaro"],
      ["Noleggio", "Alessandro Cesari"],
    ],
  },
  {
    slug: "spiritual-land", title: "Spiritual Land", client: "Progetto MKA", tag: "Film",
    imgs: ["spiritual-land"], provvisorio: true,
    url: "https://vimeo.com/1249686504", featured: true,
    credits: [
      ["Produzione esecutiva", "Ascanio Grande"],
      ["Regia", "Daniele D'Amato"],
      ["Direzione della fotografia e camera", "Lorenzo Resta"],
    ],
  },
  {
    slug: "nuyorika", title: "Nuyorika", client: "Nuyorika", tag: "Visual",
    imgs: ["nuyorika"],
    url: "https://vimeo.com/1249690238",
    credits: [
      ["Produzione esecutiva", "Ascanio Grande"],
      ["Regia", "Daniele D'Amato"],
      ["Direzione della fotografia e camera", "Lorenzo Resta"],
      ["Assistente operatore", "Melissa"],
      ["Styling", "Elisa D'Oria"],
      ["Trucco", "Francesco Corvaglia"],
      ["Montaggio e sound design", "Daniele D'Amato"],
      ["Color", "Lorenzo Resta"],
      ["Fotografia", "Riccardo Balena"],
      ["Attori", "Milena Perrone, Albi Gjini"],
    ],
  },
  {
    slug: "satori-sound", title: "Satori Sound", client: "Satori Sound & Baazar84th", tag: "Teaser",
    imgs: ["satori-sound"],
    url: "https://vimeo.com/1249689644",
    credits: [
      ["Produzione esecutiva", "Ascanio Grande"],
      ["Regia", "Daniele D'Amato"],
      ["Direzione della fotografia e camera", "Lorenzo Resta"],
    ],
  },
  {
    slug: "backstage-001", title: "Presto, backstage", client: "Presto", tag: "Backstage",
    imgs: ["presto-backstage", "backstage-001"],
    url: "https://vimeo.com/1249698383",
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
