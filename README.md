# MKA, prototipo del sito

Prototipo del sito di **MKA (Matrioska Creativa)**, collettivo di multimedia
production. Segue il brief di `../info.md` e usa il branding ufficiale di
`../branding.pdf`. Pagina principale, archivio dei lavori e pagina del singolo
progetto, HTML/CSS/JS puri, nessun build step.

```sh
python3 -m http.server 8000
```

poi `http://localhost:8000`. Va servito da un server (anche locale) perché i
moduli JavaScript non partono aprendo il file direttamente.

## Com'è fatta la pagina

1. **Apertura.** Un mosaico dritto, in orizzontale, di riquadri con le
   proporzioni dello schermo ridotti al 34% (su telefono in verticale sempre
   tre file a tutta altezza di riquadri 4:3): le file sono sfalsate di mezzo
   riquadro e scorrono piano di lato. Al centro il logo "moneta con acronimo
   esteso" e sotto il bottone per prenotare una call.
2. **Roulette e showreel** (variante del branch `roulette`). Appena si
   comincia a scorrere parte un'animazione a tempo, poco più di un secondo,
   che non segue più lo scroll 1 a 1 (`ROLL_T` e `OPEN_T` in `js/main.js`:
   0,67 secondi di roulette e mezzo secondo di zoom): le file girano
   velocissime come i rulli di una slot, con una scia di
   movimento, e rallentano fino a fermarsi in griglia con la tessera dello
   showreel al centro. Le altre tessere si spengono e lo showreel si apre
   dalla sua tessera fino a tutto schermo. A quel punto compaiono le velature
   con il timecode e dal basso si apre la **pillola di navigazione**.
   Tornando in cima l'animazione si riavvolge e tutto torna com'era.
3. **Progetti.** Sei lavori su due colonne e tre righe, con titolo e cliente
   scritti dentro la miniatura. All'hover l'anteprima
   scorre i fermi immagine del lavoro, si accende un bordo giallo e compare l'etichetta "Guarda". In fondo
   il link a `progetti.html` con l'elenco completo.
4. **I nostri servizi.** Cosa fa MKA, in una colonna sola: il titolo su una
   riga, sotto i due testi del manifesto affiancati e poi le tre categorie
   (direzione creativa, servizi di produzione multimediale, identità e
   strategia) una sotto l'altra. Al clic una categoria si apre e mostra
   descrizione e voci di servizio; se ne apre una alla volta e il più diventa
   un meno giallo. Le polaroid dei membri sono state tolte su richiesta di
   Niccolò.
5. **Prenota una call.** Calendario Cal.com incorporato su fondo nero
   (account di MKA, evento `mka-mxgoxl/30min`): si scelgono giorno e ora e
   l'invito con il link della videochiamata arriva via email.

L'invito alla call è sempre presente: nell'apertura, in alto a destra in ogni
momento e come ultima voce della pillola.

## La pagina del progetto

Card della home e righe dell'archivio portano a `progetto.html?p=<slug>`, una
pagina sola che si riempie da `PROJECTS` di `js/data.js`. Lo schema viene da
[donprod.uk](https://www.donprod.uk/projects/Iceman), con il nostro branding
(Radio Canada Big per i titoli, Datatype per le scritte piccole, nero, crema e
giallo):

1. **Cornice.** Il lavoro a tutto schermo dentro una cornice con le staffe
   agli angoli. Le linee guida orizzontali arrivano ai bordi dello schermo,
   quelle verticali corrono per tutta la pagina. Nelle fasce laterali,
   in verticale, "Tutti i progetti" e il numero del lavoro. Sotto, una
   timeline a tacche con la testina gialla e il timecode, poi titolo e cliente
   grandi. In attesa dei video nella cornice girano i fermi immagine; al clic
   si apre Vimeo (quando il video si potrà incorporare) o il post originale.
2. **Crediti** in colonne, tipo di lavoro e link al post.
3. **Etichette e immagine grande**, con un leggero parallasse.
4. **Due fasce di testo** (titolo e cliente pieni, tipo e "Matrioska Creativa"
   solo contornati) che scorrono in versi opposti con lo scroll, attorno a
   un'immagine.
5. **Immagini e parole alternate**: il tipo di lavoro e "per <cliente>".
6. **Galleria** con tutte le immagini e la moneta in una casella.
7. **Indietro / Avanti** verso il lavoro precedente e il successivo, in
   bianco e nero finché non ci si passa sopra.

**Apertura.** Come su donprod la miniatura cliccata diventa la cornice. Nella
pagina di partenza (`js/apri.js`) tutto il resto sfuma nel nero e la miniatura
resta sola, con le staffe. Posizione e immagine passano in `sessionStorage` e
la pagina del progetto (`js/progetto.js`) la allarga fino alla cornice in
1,1 secondi, mentre le linee guida corrono verso i bordi. Poi entrano timeline,
titolo e scritte laterali. Dalla home vola il fermo immagine che la card
mostrava in quel momento, dall'archivio l'anteprima che segue il mouse. Da un
link diretto, o dal telefono senza anteprima, la cornice si apre da un
riquadro piccolo al centro. Lo scroll resta nativo: fasce e parallasse
leggono la posizione e non la guidano. Con "riduci movimento" niente
apertura, fasce ferme.

## Da dove vengono le due animazioni

Tutte e due sono rifatte sulle misure prese dal vivo sui siti indicati nel
brief.

**recordstudio.it.** La loro apertura è una griglia di 3 colonne per 3 video,
ognuno grande quanto lo schermo, con `scale(0.4) rotate(-30deg)` e le colonne
sfalsate in verticale (-38%, -4%, +25% dell'altezza). La sezione resta ferma
per circa 740px di scroll e in circa 450px la griglia torna a scala 1 e
rotazione 0, con un'accelerazione che rallenta verso la fine (a metà corsa è
già al 75%). Qui i valori sono gli stessi. Loro usano GSAP con ScrollTrigger,
qui il mosaico è disegnato su un `<canvas>` grande quanto lo schermo
(`js/mosaic.js`), con un solo `requestAnimationFrame` che legge lo scroll
nativo. Il canvas serve per i telefoni: una griglia di elementi HTML grande
nove schermi li mandava in crisi, e a metà scroll il mosaico spariva nel nero.
Il numero di colonne e righe si calcola dalla forma dello schermo, così il
mosaico ruotato copre sempre tutto, anche su un telefono in verticale.

**unscene.work.** Pillola fissa in basso al centro a 35px dal fondo, alta
42px, fondo `rgba(18,18,18,.5)` con sfocatura di 10px, voci da 34px con
padding 8x12px in Inter Display 14px. La voce attiva ha una capsula chiara
`#fafafa` con il testo scuro, e la stessa capsula scivola sotto la voce su cui
passa il mouse. Le misure sono quelle. In più qui la pillola entra
allargandosi dal centro e ha in coda la voce "Prenota call" in giallo.

## Branding

| Token | Colore | Uso |
|---|---|---|
| `--yellow` | `#F0E630` | bottoni della call, bordo delle card, selezione del testo, (testo nero sopra) |
| `--cream` | `#F1EDE4` | testo su nero, focus da tastiera |
| `--black` / `--white` | | fondo |

Il sito usa solo nero, crema (il "bianco" del sito) e giallo, per scelta di
Niccolò: nella variante `roulette` il giallo `#F0E630` ha preso il posto del
rosso (20/11/2026), sempre come unico colore d'accento. Sul giallo le scritte
sono nere, perché il crema non si legge. Grigio azzurro, blu e rosso del
branding non compaiono.

**Font.** Il primario è Radio Canada Big, scelto dal collettivo al posto di
Neue Haas Grotesk Display (che stava nel branding ma aveva bisogno di una
licenza web). Si carica da Google Fonts con due soli pesi: regular 400 per i
testi, medium 500 per i titoli (titoli di sezione, titoli delle card, titoli
dei blocchi dei servizi, frase d'apertura dei servizi). Il secondario resta
Datatype, anche lui da Google Fonts (qui un po' stretto, `font-stretch: 80%`,
come nel campionario).

**Loghi.** Estratti dal PDF in vettoriale con `pdftocairo -svg` (pagina 2 per
il logo esteso, pagina 5 per la moneta), ripuliti e ritagliati. In `logo/` ci
sono due versioni: quella con `currentColor` da usare inline e quella color
crema per i tag `<img>`. Nella home il logo esteso è montato in due pezzi:
`matrioska-creativa-lettere*.svg` (le lettere senza la moneta) e sopra il
pittogramma intero `moneta-crema.svg`. Nel logo del PDF la moneta è disegnata
già tagliata in alto a sinistra, dove la copre la R: il pittogramma invece è
completo ed è lo stesso disegno, in scala 0,457. Posizione e scala sono state
ricavate facendo combaciare M, K, A e la matrioska dei due disegni (scarto
massimo 0,06 unità del viewBox).

**Intro.** All'arrivo lo schermo è nero. La moneta cade dall'alto facendo due
giri su se stessa, tocca terra a 0,7 secondi, fa due rimbalzi e ondeggia come
una moneta che si ferma sul tavolo. Poi si rimpicciolisce lungo un piccolo arco
fino al suo posto nella O di MATRIOSKA, facendo un altro giro. A metà di questo
viaggio le lettere si aprono a cerchio partendo dalla moneta e dietro compaiono
il mosaico, la frase, il bottone e la testata. In tutto dura circa 3,5 secondi.
Il giro su se stessa si ottiene schiacciando la larghezza della moneta, così la
scritta MKA non si vede mai allo specchio. Qualsiasi gesto (rotellina, tasto,
tocco, clic) la chiude subito e lascia il sito com'è. Non parte se il sistema
chiede di ridurre il movimento o se la pagina si ricarica già scorsa. Se il
JavaScript non parte, dopo 4 secondi il sito si mostra comunque.

## Struttura

```
index.html        apertura e showreel · progetti · servizi · call · piede · pillola
progetti.html     archivio di tutti i lavori, con anteprima al cursore
progetto.html     pagina del singolo progetto (?p=<slug>)
css/style.css     stili comuni, token in :root
css/progetto.css  stili della pagina del progetto
js/main.js        scroll dell'apertura · pillola · card · blocchi dei servizi
js/apri.js        prima metà dell'apertura di un progetto (miniatura sul nero)
js/progetto.js    pagina del progetto: costruzione, apertura, fermi, scroll
js/cal.js         calendario Cal.com della sezione call (CAL_LINK, colori)
js/intro.js       intro della moneta che cade e torna nel logo
js/mosaic.js      il mosaico su canvas e i fermi immagine dello showreel
js/data.js        progetti e blocchi dei servizi: si cambia il contenuto solo qui
js/vimeo.js       ID dei video e player Vimeo, con ripiego
img/              copertine dei post Instagram di @mka.collective
logo/             loghi SVG estratti da branding.pdf
```

## Vimeo

Il player Vimeo risponde ancora **401** da qualunque sito: l'account MKA è
free e ha l'incorporamento disattivato (verificato a novembre 2026). Il video
in bio, `1179573849`, è BACKSTAGE_001 e non uno showreel.

Per questo in `js/vimeo.js` lo showreel ha `embeddable: false`. Nel riquadro
centrale girano i fermi immagine dei lavori a dissolvenza, e "Guarda lo
showreel" apre una finestra che spiega il problema e manda alla pagina Vimeo.
Quando ci sarà il reel vero:

1. abilitare l'incorporamento sul dominio del sito (impostazioni privacy del
   video su Vimeo). Per il video muto in loop nel riquadro (modalità
   `background`) serve un piano a pagamento;
2. mettere l'ID in `VIMEO.showreel.id` e `embeddable: true` (più
   `background: true` se il piano lo permette).

I video dei progetti vanno in `VIMEO.projects` (`"slug": "ID"`): con un ID
il clic sulla cornice della pagina del progetto apre il player in una finestra,
senza apre il post originale.

Il codice aspetta il player per 5 secondi: se non si avvia, torna ai fermi
immagine da solo. Il player si posa sopra la tessera centrale del canvas
(`#reelPlayer`), che `main.js` ruota e scala insieme al mosaico.

## Cosa è reale e cosa manca

**Reale.** Il logo, i colori e Datatype dal branding. Le immagini, scaricate
dai 13 post Instagram di `@mka.collective` e ridotte a 1600px al massimo. I
titoli e i clienti dei progetti (Estate Italiana per Reviva, Presto Fashion
Film, Cargo & Belt e Look Book 001 per Presto), presi dalle didascalie. I due
testi della sezione servizi, presi dai post "manifesto" e "what MKA do". I link a
Instagram e Vimeo.

Provvisorio o inventato, quindi da far confermare:
- i titoli "Il giardino", "Il buio" e "Una visione nata a Istanbul": quei post
  non avevano un titolo, sono ricavati dalla didascalia;
- le etichette di tipo (Fashion film, Shooting, Corto…) e "Racconto dal
  Salento";
- **i tre blocchi dei servizi**: titoli, descrizioni e voci di servizio
  sono provvisori, da compilare (in `SERVICES` di `js/data.js`);
- `info@matrioskacreativa.it` è un **indirizzo inventato**;
- il testo sotto "Prenota una call";
- i crediti delle pagine dei progetti: per ora solo cliente, tipo e
  "Produzione: MKA". Quelli veri vanno in `credits` di ogni progetto in
  `js/data.js` (coppie `["Ruolo", "Nome"]`), l'anno in `year`;
- le sezioni della pagina del progetto riusano a giro le immagini che ci
  sono: con una sola immagine (Il buio, Cargo & Belt…) si vede sempre quella.

La call si prenota con Cal.com, piano gratuito (novembre 2026): un solo
utente, prenotazioni illimitate, ma resta la scritta "Cal.com" sotto il
calendario (per toglierla serve il piano Teams, 12 $ a utente al mese). Il
calendario si carica solo quando la sezione si avvicina, con tema scuro e
colori del sito passati da `js/cal.js`. Font e struttura interna restano
quelli di Cal.com. Se lo script non arriva resta visibile un link alla pagina
di prenotazione. Orario a 24 ore, foto del profilo e descrizione dell'evento
si impostano dall'account Cal.com, non dal sito.

## Accessibilità e casi limite

- `prefers-reduced-motion`: niente grana animata, tessere del mosaico ferme,
  ingressi senza animazione, e lo showreel si apre di colpo senza roulette.
- Senza JavaScript la pagina si legge lo stesso: al posto del mosaico c'è una
  foto ferma e la pillola è già al suo posto.
- Sui telefoni l'apertura usa l'altezza dello schermo con la barra degli
  indirizzi nascosta, così quando la barra sparisce sotto il reel non resta
  una fascia vuota.
- Su telefono la pillola tiene tutte le voci, Showreel compreso, con testo e
  margini un po' più stretti.
- Le voci della pillola sono Showreel, Progetti, Servizi e Prenota call: quando
  si è nella sezione della call la capsula chiara passa sopra il bottone giallo.
  Provato fino a 570px di finestra (il minimo che Chrome desktop consente);
  sotto i 380px le voci si stringono ancora.
