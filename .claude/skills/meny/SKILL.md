---
name: meny
description: Legg til eller oppdater en meny (f.eks. 17. mai-frokost, julebord, nyttår) under /menyer — egen side i src/pages/menyer/ og oppføring i src/config/menus.js. Bruk når brukeren ber om en ny meny, vil endre retter på en eksisterende meny, eller spør hvordan menyer fungerer.
---

# Menyer under /menyer

En meny er en samling oppskrifter satt sammen til en anledning (17. mai, jul, nyttår, selskap).
Menyer nås fra navbaren via **Bonus → Menyer**, som peker til oversiktssiden `/menyer`.

## Hvordan det henger sammen

| Fil | Rolle |
|---|---|
| `src/config/menus.js` | Liste over alle menyer. Styrer kortene på oversiktssiden. |
| `src/pages/menyer/index.astro` | Oversiktssiden `/menyer` — rendrer ett `SmallCards`-kort per meny. Trenger normalt ikke endres. |
| `src/pages/menyer/<slug>.astro` | Selve menysiden, én fil per meny. URL blir `/menyer/<slug>`. |
| `src/components/Navbar.vue` | Har én lenke til `/menyer` (desktop + mobil). Trenger **ikke** endres for nye menyer. |
| `astro.config.mjs` → `redirects` | Gamle URL-er. `/themenu` → `/menyer/17-mai` (der 17. mai-menyen lå før). |

## Legge til en ny meny

1. **Lag menysiden** `src/pages/menyer/<slug>.astro`. Kopier `17-mai.astro` som utgangspunkt.
   - `slug` er kebab-case uten æøå (`julebord`, `nyttar-2026`, `17-mai`) — den blir en del av URL-en.
   - Imports ligger to nivåer ned: `../../layouts/Layout.astro`, `../../assets/...`.
   - Bytt ut `dishes`-arrayet, overskrifter (`<h2>`/`<h1>`), illustrasjoner og fargene i `<style>`
     så de passer anledningen. 17. mai-siden bruker rødt/hvitt/blått rutemønster i kanten
     (`.border-wrapper`) — en julemeny bør få sitt eget uttrykk, ikke flaggfargene.
   - `Layout` med `hideFoodstalkerLayout={true}` gir en "frittstående" menyside uten vanlig
     sidebakgrunn — slik 17. mai er laget for å kunne vises/skrives ut som meny. Behold det med mindre
     brukeren vil ha vanlig layout.
   - Sett `title`, `description` og gjerne `image` (delingsbilde) på `Layout`.

2. **Hver rett** i `dishes` har:
   ```js
   {
     title: "Gravet laks",
     description: "Kort, leken beskrivelse – samme tone som oppskriftene.",
     image: "https://foodstalker.b-cdn.net/ÅR/slug/bilde.jpg",
     href: "/oppskrift/<recipe-id>", // utelat/tom for "Kommer snart"-knapp
   }
   ```
   - `href` **må** matche en `id` i `src/data/recipes.json`. Verifiser alle før du er ferdig:
     ```bash
     python3 -c "
     import json,re
     ids={r['id'] for r in json.load(open('src/data/recipes.json'))}
     s=open('src/pages/menyer/<slug>.astro').read()
     for h in re.findall(r'href: \"/oppskrift/([^\"]+)\"',s): print(('OK  ' if h in ids else 'MANGLER ')+h)"
     ```
   - Bruk gjerne oppskriftens eget `imageurl` som `image` — da er bildet garantert på CDN.
   - Rett uten oppskrift ennå: utelat `href`, så viser siden "Kommer snart".

3. **Legg menyen til i `src/config/menus.js`** (nyeste/mest aktuelle først i arrayet):
   ```js
   {
     slug: "julebord",            // samme som filnavnet
     title: "Julebord",
     description: "En setning om hva menyen består av.",
     image: "https://foodstalker.b-cdn.net/...jpg",
   }
   ```
   - `image` vises som et **lite kvadratisk** bilde på kortet. Bruk et matbilde (f.eks. hovedretten
     sitt `imageurl`), **ikke** et bredt banner — `17-mai-menybilde.png` (926×384) ble nesten helt hvitt
     når det ble beskåret, og ble derfor byttet ut med roastbeef-bildet.

4. **Bygg og sjekk**: `npm run build` (må gå uten feil), deretter `npm run preview` og se på både
   `/menyer` og `/menyer/<slug>` i mobilbredde (~400px). Sjekk at ingen bilder er brukket.

## Flytte eller gi nytt navn til en meny

Endrer du `slug` på en eksisterende meny, legg den gamle URL-en inn i `redirects` i
`astro.config.mjs` (samme mønster som `/themenu`), så gamle delte lenker ikke gir 404.

## Ikke gjør

- Ikke legg hver meny som egen lenke i Navbar-dropdownen — oversiktssiden `/menyer` er hele poenget,
  så menyen skalerer når det kommer flere.
- Ikke bruk `src/config/themes.js` for menyer. Temaer (`/jul`, `/host` osv.) er automatiske
  keyword-filtrerte oppskriftslister; menyer er håndplukkede retter med egen design.
