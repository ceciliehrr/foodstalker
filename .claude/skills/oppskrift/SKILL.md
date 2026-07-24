---
name: oppskrift
description: Legg til eller oppdater en oppskrift i src/data/recipes.json — riktig skjema, fast bilde-rekkefølge (orientation) og Foodstalker-sjargongen. Bruk når brukeren ber om å legge til en ny oppskrift, redigere en eksisterende, eller rette bilderekkefølge/orientation i recipes.json.
---

# Oppskrift i recipes.json

`src/data/recipes.json` er kilden til sannhet for alle oppskrifter (se CLAUDE.md). Filen er stor
(500+ KB) — bruk `Read` med `offset`/`limit`, eller `grep -n '"id": "..."'` for å finne riktig sted,
ikke les hele filen på én gang.

## Skjema per oppskrift

```json
{
  "id": "kebab-slug",
  "imageurl": "https://foodstalker.b-cdn.net/ÅR/slug/hovedbilde.jpg",
  "alt": "kort beskrivelse av hovedbildet",
  "title": "Tittel med stor forbokstav",
  "date": "YYYY-MM-DD",
  "category": "hverdag | helg | søtt | turmat | drikke | tilbehør",
  "description": "Én kort setning, samme tone som Tips-teksten.",
  "longDescription": "2-4 setninger, gjerne en liten historie om hvor oppskriften kommer fra.",
  "time": 30,
  "portions": 4,
  "tips": "Praktiske tips i løpende tekst.",
  "chef": "Navn (eller flere navn) — vises under 'Hvem har vi stalket?' med lenke fra tipsurl.",
  "tipsurl": "https://... (tom streng hvis ingen kilde å lenke til)",
  "ingredients": [
    { "title": "Valgfri gruppetittel, f.eks. 'Paideig'", "ingredients": [
      { "quantity": "300 g", "name": "mel", "details": "" }
    ]}
  ],
  "steps": [
    { "title": "Valgfri overskrift på steget", "description": "Imperativ, andre person: 'Kutt løken...'" }
  ],
  "images": [ /* se eget avsnitt under */ ],
  "keywords": ["3-6", "søkeord", "på", "norsk"]
}
```

Ny oppskrift legges til **sist** i arrayet — index.astro sorterer selv på `date` ved rendering,
rekkefølgen i filen spiller ingen rolle.

## Bilder: fast orientation-mønster (viktig!)

`ImageGallery.vue` bruker CSS multi-column masonry. **Nesten alle** oppskrifter (108 av 110, sjekket
juli 2026) bruker akkurat dette mønsteret for `orientation`-feltet i `images`-arrayet, i denne
rekkefølgen:

```
landscape, portrait, portrait, landscape, landscape, portrait
```

Dette er en **fast visuell mal**, ikke en kronologisk gjenfortelling av stegene — bildene trenger
ikke følge oppskriftens rekkefølge. Når du legger til eller retter bilder:

1. Behold alltid mønsteret over (3 landscape + 3 portrait, i akkurat den rekkefølgen).
2. Innenfor hver orientering (de 3 landscape-slottene, de 3 portrait-slottene) kan du gjerne
   sortere kronologisk etter stegene — det er finpuss, ikke hovedregelen.
3. Ikke "korriger" bilderekkefølgen ut fra alt-tekst alene og tro at avvik fra kronologi er en feil
   — sjekk `orientation`-mønsteret først. Et bilde med "ferdig ..." i alt-teksten midt i arrayet er
   normalt, ikke en bug.
4. To oppskrifter (`sitronkake`, `brune-pinner`) brukte historisk et alternativt mønster
   (`landscape, portrait, landscape, portrait, landscape, portrait`) — de er nå standardisert til
   samme mønster som resten. Ikke gjeninnfør avvik med mindre brukeren ber om det eksplisitt.

Mangler ekte bilder ennå (bildene kommer i etterkant)? Bruk en tydelig placeholder-URL som ikke
finnes på CDN (f.eks. `https://foodstalker.b-cdn.net/ÅR/slug/PLACEHOLDER.jpg`), sett `alt` til noe
som "PLACEHOLDER - bytt ut når bilde er lastet opp", og si tydelig fra til brukeren at
`npm run build` vil feile for akkurat den siden til bildet er erstattet (Astro sitt `<Image>`
prøver å hente/optimalisere eksterne bilder ved bygg). `npm run dev` går fint helt til man besøker
akkurat den siden. Legg gjerne inn 6 tomme `images`-slots (riktig orientation-mønster, tom
`url`/`alt`) som brukeren selv fyller inn etter fotografering.

## Stemme og sjargong

Oppskriftene er skrevet i en uformell, personlig tone — se f.eks. `gulasjsuppe`, `taco-med-svinenakke`
eller `middelalderpai` for referanse.

- **Steg**: imperativ, andre person ("Kutt løken", "La det putre"). Korte setninger, ingen overflødig
  høflighet.
- **description**: én kort setning, gjerne litt lekent ("Ta hverdagen tilbake med varmende
  gulasjsuppe.").
- **longDescription**: 2-4 setninger, gjerne en liten anekdote — hvem ga oss oppskriften, hvorfor vi
  lager den, en personlig detalj. Ikke bare en nøktern beskrivelse av retten.
- **tips**: praktiske, muntlige tips i løpende tekst — variasjoner, oppbevaring, snarveier. Kan bruke
  `<a href='/oppskrift/...'>`-lenker til andre oppskrifter på siden.
- **chef**: navnet(e) på hvem oppskriften er "stalket" fra, eller hvem i familien/vennekretsen som
  laget/videreutviklet den (f.eks. "Cecilie og Pete", "Ingvild Hasle, videreutviklet av Pete og Cec").
  Kan også være noe kreativt/spøkefullt (f.eks. "middelaldern") hvis brukeren ber om det spesifikt —
  følg instruksen, ikke skjemaets "vanlige" mønster, når brukeren eksplisitt ønsker noe annet.
- Typiske ord/uttrykk i denne sjargongen: "digg", "no godt", "server med", "smak til", "putre",
  "fres". Unngå stiv/formell matbloggtone.

## Sikker redigering ved bulk-endringer

`recipes.json` er formatert med 2-space indent (ikke `ensure_ascii`), og `keywords`-arrayer er
komprimert til én linje når de er ≤80 tegn (Prettier printWidth-oppførsel), ellers flerlinjet. Ved
endringer på tvers av mange oppskrifter (f.eks. bilderekkefølge):

1. Gjør endringen i en Python-kopi av dataene (`json.load` → endre kun det du trenger → `json.dumps(...,
   ensure_ascii=False, indent=2)`).
2. Kjør en regex-pass som komprimerer `"keywords": [...]` tilbake til én linje der det passer (se
   under), ellers blir hele filen "reformatert" og diffen blir ubrukelig stor.
3. Diff mot originalen og sjekk at *kun* de linjene du forventet er endret, før du skriver filen
   tilbake.

```python
pattern = re.compile(r'( *)"keywords": \[\n((?:\s+"(?:[^"\\]|\\.)*",?\n)+)\s+\]')
def compact_keywords(m):
    indent = m.group(1)
    items = re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(2))
    joined = ', '.join(f'"{i}"' for i in items)
    single = f'{indent}"keywords": [{joined}]'
    return single if len(single) <= 80 else m.group(0)
out = pattern.sub(compact_keywords, out)
```

Enkeltoppskrift-endringer (én ny oppskrift, én rettelse) er enklere å gjøre direkte med `Edit`-verktøyet.
