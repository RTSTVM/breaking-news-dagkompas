# Breaking News Dagkompas

Bouw de productiesite voor het Nederlandse AI-nieuwsprogramma "Breaking News" (presentatoren Chris en Anna). Het bijgevoegde HTML-bestand (productiesite-mockup.html) is het exacte ontwerp: neem indeling, kleuren, teksten, mockdata en gedrag daar 1-op-1 uit over. Verzin geen eigen vormgeving. Het bijgevoegde PNG is het logo (gebruik als asset in de kop).

TECHNIEK
- React + TypeScript + Tailwind. Gebruik geen afgeronde "SaaS-look": geen gradients, geen afgeronde hoeken, geen schaduwen.
- Alle data komt uit één datalaag (src/data/api.ts) met functies als getDay(date), voorlopig met mockdata (de generator uit het HTML-bestand). Zo kan later een echte backend worden aangesloten zonder de schermen aan te passen.
- Interface in het Nederlands.

VORMGEVING
- Kleuren: diepblauw #0B1D4A (kop, zijbalk), blauw #102A68, rood #D61A2C (accent), wit vlak, achtergrond #E8ECF4, lijnen #D6DCEA. Lettertype Arial/Helvetica, koppen vet en in hoofdletters.
- Kop met logo links en datumkeuze rechts; daaronder een rij kengetallen (Gescand, Bevestigd, Controle loopt, Items gekozen, Items gepost).
- Linker zijbalk met vier tabs; op smal scherm staan de tabs bovenaan.
- Elk paneel: kleine rode subnaam, daaronder de naam groot in blauw met een dikke blauwe lijn.

DATUMKEUZE
Pijltjes vorige/volgende dag, kalender, knop "Vandaag" en een strook met de laatste 9 dagen. Elke eerdere dag toont zijn eigen nieuws, de zes gekozen items, voltooide producties en posts. Bij een eerdere dag wordt de subnaam van REDACTIE "DE ITEMS VAN <DAG DATUM>". Vandaag is maandag 23 november 2026.

VIER TABS
1. NIEUWSSCANNER, subnaam AL HET LAATSTE NIEUWS: tabel met tijd, bericht, bron, rechtenstatus (groen/oranje/rood) en status (Controle loopt, Geverifieerd, Officieel bevestigd, Gecorrigeerd), filters op status, klik op een rij voor een uitklapregel met details.
2. REDACTIE, subnaam DE ITEMS VAN VANDAAG: zes gekozen items met nummer, titel, reden, presentator (Chris/Anna afwisselend), score en balkjes Actueel/Belang/Urgent; daaronder Afgevallen en de regel over geruchten.
3. PRODUCTIE, subnaam STATUS VAN DE PRODUCTIE AGENT: wat de agent nu doet en per item de stappen Tekst, Stem, Lipsync, B-roll, Render, 16:9, 9:16.
4. SOCIAL MEDIA, subnaam GEPOST PER KANAAL: matrix item x kanaal (YouTube, Shorts, TikTok, Reels, Facebook, X, LinkedIn, FAST) met tijd van plaatsing of ingepland.

De editie van 18 november 2026 is de testuitzending met de echte items (belastingplan, diesel, Black Friday, AI-rally, Japan, Aldi).

Kopieer het gedrag en de teksten uit het HTML-bestand; controleer na het bouwen dat het er visueel hetzelfde uitziet.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://breaking-news-dagkompas.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9a93ab8d-d9e1-4bea-bf57-84f9cedfa975).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
