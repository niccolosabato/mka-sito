# MKA, prototipo del sito

Prototipo del sito di **MKA (Matrioska Creativa)**, collettivo di multimedia
production. Segue il brief di `../info.md` e usa il branding ufficiale di
`../branding.pdf`. Pagina singola più una pagina archivio, HTML/CSS/JS puri,
nessun build step.

```sh
python3 -m http.server 8000
```

poi `http://localhost:8000`. Va servito da un server (anche locale) perché i
moduli JavaScript non partono aprendo il file direttamente.

## Com'è fatta la pagina

1. **Apertura.** Un mosaico di riquadri inclinato a -30° e ridotto al 40%, con
   il logo "moneta con acronimo esteso" al centro e sotto il bottone per
   prenotare una call.
2. **Showreel.** Scorrendo, il mosaico si raddrizza e si ingrandisce finché il
   riquadro centrale diventa lo schermo intero: lo showreel è quel riquadro.
   Arrivati a tutto schermo compaiono due velature sfumate con il timecode, e
   dal basso si apre la **pillola di navigazione**, che da lì resta
   sempre visibile. Risalendo tutto torna com'era.
3. **Progetti.** Sei lavori su due colonne e tre righe. All'hover l'anteprima
   scorre i fermi immagine del lavoro e compare l'etichetta "Guarda". In fondo
   il link a `progetti.html` con l'elenco completo.
4. **Il collettivo.** I membri sono polaroid sparse su un tavolo color crema:
   si raddrizzano al passaggio del mouse e si possono trascinare. Su telefono
   diventano una griglia a due colonne.
5. **Prenota una call.** Form classico su fondo rosso: nome, email, azienda,
   giorno preferito, tipo di lavoro e budget a scelta rapida, messaggio.

L'invito alla call è sempre presente: nell'apertura, in alto a destra in ogni
momento (diventa nero sopra la sezione rossa) e come ultima voce della pillola.

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
allargandosi dal centro e ha in coda la voce "Prenota call" in rosso.

## Branding

| Token | Colore | Uso |
|---|---|---|
| `--red` | `#A93F33` | invito alla call, sezione contatti |
| `--slate` | `#748C8E` | etichette dei progetti |
| `--blue` | `#229CD2` | etichette dei progetti |
| `--yellow` | `#F0E630` | etichette, selezione del testo, focus, errori del form |
| `--cream` | `#F1EDE4` | testo su nero, sezione del collettivo |
| `--black` / `--white` | | fondo, polaroid |

**Font.** Il primario è Radio Canada Big, scelto dal collettivo al posto di
Neue Haas Grotesk Display (che stava nel branding ma aveva bisogno di una
licenza web). Si carica da Google Fonts con due soli pesi: regular 400 per i
testi, medium 500 per i titoli (titoli di sezione, titoli delle card, nomi
sulle polaroid, frase d'apertura del collettivo). Il secondario resta
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
index.html        apertura e showreel · progetti · collettivo · call · piede · pillola
progetti.html     archivio di tutti i lavori, con anteprima al cursore
css/style.css     tutti gli stili, token in :root
js/main.js        scroll dell'apertura · pillola · card · polaroid · form
js/intro.js       intro della moneta che cade e torna nel logo
js/mosaic.js      il mosaico su canvas e i fermi immagine dello showreel
js/data.js        progetti e membri: si cambia il contenuto solo qui
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

Il codice aspetta il player per 5 secondi: se non si avvia, torna ai fermi
immagine da solo. Il player si posa sopra la tessera centrale del canvas
(`#reelPlayer`), che `main.js` ruota e scala insieme al mosaico.

## Cosa è reale e cosa manca

**Reale.** Il logo, i colori e Datatype dal branding. Le immagini, scaricate
dai 13 post Instagram di `@mka.collective` e ridotte a 1600px al massimo. I
titoli e i clienti dei progetti (Estate Italiana per Reviva, Presto Fashion
Film, Cargo & Belt e Look Book 001 per Presto), presi dalle didascalie. I due
testi del collettivo, presi dai post "manifesto" e "what MKA do". I link a
Instagram e Vimeo.

Provvisorio o inventato, quindi da far confermare:
- i titoli "Il giardino", "Il buio" e "Una visione nata a Istanbul": quei post
  non avevano un titolo, sono ricavati dalla didascalia;
- le etichette di tipo (Fashion film, Shooting, Corto…) e "Racconto dal
  Salento";
- **tutti i membri**: nomi ("Nome Cognome"), ruoli e foto. Le foto delle
  polaroid sono fotogrammi presi dai lavori;
- `info@matrioskacreativa.it` è un **indirizzo inventato**;
- il testo sotto "Prenota una call" e le fasce di budget;
- i link delle card portano ai post Instagram, in attesa delle pagine dei
  progetti.

Il form per ora non invia niente: controlla i campi obbligatori e mostra una
conferma. Per il sito vero: Netlify Forms (come in `kyure_website`) o
Formspree, oppure un collegamento a Calendly o Cal.com per fissare la call
direttamente.

## Accessibilità e casi limite

- `prefers-reduced-motion`: niente grana animata, tessere del mosaico ferme,
  ingressi senza animazione. L'apertura resta legata allo scroll, che
  muove chi legge.
- Senza JavaScript la pagina si legge lo stesso: al posto del mosaico c'è una
  foto ferma e la pillola è già al suo posto.
- Sui telefoni l'apertura usa l'altezza dello schermo con la barra degli
  indirizzi nascosta, così quando la barra sparisce sotto il reel non resta
  una fascia vuota.
- Su telefono la pillola perde la voce "Showreel" per starci in larghezza.
  Provato fino a 570px di finestra (il minimo che Chrome desktop consente);
  sotto i 380px le voci si stringono ancora.
