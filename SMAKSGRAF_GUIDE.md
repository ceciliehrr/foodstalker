# 🌐 Smaksgraf - Ingrediensnettverk

En interaktiv visualisering som viser hvordan ingredienser henger sammen basert på oppskriftene dine.

## 📍 Hvordan bruke

Gå til `/smaksgraf` på nettsiden din for å utforske ingrediensnettverket.

## ✨ Funksjoner

### 1. **Interaktivt nettverk**

- Klikk på en ingrediens for å se dens forbindelser
- Panorer og zoom i grafen
- Hover over noder for å se detaljer

### 2. **Søk**

- Søk etter spesifikke ingredienser i søkefeltet
- Nettverket zoomer inn på ingrediensen du søker etter

### 3. **Oppdag nye kombinasjoner** 💡

- Klikk på "Vis kreative kombinasjoner"
- Se ingredienser som sjelden brukes sammen, men deler mange felles partnere
- Perfekt for å finne inspirasjon til nye oppskrifter!

### 4. **Mest allsidige ingredienser** 🏆

- Se hvilke ingredienser som brukes mest og har flest forbindelser
- Klikk på en ingrediens for å fokusere på den i nettverket

### 5. **Ingrediensdetaljer**

- Når du velger en ingrediens, får du se:
  - Hvor mange oppskrifter den er i
  - Hvor mange andre ingredienser den brukes sammen med
  - Liste over oppskrifter som inneholder ingrediensen

## 🔧 Teknisk oversikt

### Datafiler

- **Input**: `src/data/new_recipes.json` - Dine oppskrifter
- **Output**: `src/data/ingredient_network.json` - Generert nettverksdata

### Script

```bash
node scripts/build-ingredient-network.js
```

Dette scriptet:

1. Analyserer alle oppskrifter
2. Normaliserer ingrediensnavn (singular/plural, prefiks/suffiks)
3. Bygger et co-occurrence nettverk (hvilke ingredienser brukes sammen)
4. Finner "kreative kombinasjoner" (ingredienser som deler partnere men sjelden brukes direkte sammen)
5. Lagrer resultatene til `ingredient_network.json`

### Komponenter

- **Vue komponent**: `src/components/IngredientNetwork.vue`
- **Side**: `src/pages/smaksgraf.astro`
- **Bibliotek**: `vis-network` for graf-visualisering

## 🔄 Oppdatering av data

Når du legger til nye oppskrifter, må du regenerere nettverket:

```bash
node scripts/build-ingredient-network.js
```

Dette kan også automatiseres i build-prosessen hvis ønskelig.

## 🎨 Customization

### Endre minimum antall oppskrifter

I `build-ingredient-network.js`, linje 79:

```javascript
const MIN_OCCURRENCES = 3; // Endre dette tallet
```

### Endre farger

I `IngredientNetwork.vue`, se `color` objektene i `initNetwork()` funksjonen.

### Endre fysikk-innstillinger

I `IngredientNetwork.vue`, se `physics` objektet i `options` for å justere hvordan nettverket animeres.

## 💡 Ideer for videre utvikling

1. **Sesongbasert nettverk** - Filtrer ingredienser basert på sesong
2. **Kategori-filtering** - Vis bare ingredienser fra visse kategorier (hverdag, helg, søtt, etc.)
3. **Eksporter kombinasjoner** - La brukere lagre interessante kombinasjoner
4. **AI-genererte oppskrifter** - Bruk kreative kombinasjoner til å generere nye oppskriftsideer
5. **Community suggestions** - La brukere stemme på kreative kombinasjoner de har prøvd

## 📊 Statistikk

Når scriptet kjører, får du statistikk som:

- Totalt antall unike ingredienser
- Antall ingredienspar
- Top 10 mest tilkoblede ingredienser
- Eksempler på kreative kombinasjoner

## 🐛 Troubleshooting

**Problem**: Nettverket vises ikke

- **Løsning**: Sjekk at `ingredient_network.json` er generert og inneholder data

**Problem**: Scriptet feiler

- **Løsning**: Sjekk at `new_recipes.json` har riktig format med `ingredients` array

**Problem**: For mange noder i nettverket (treg)

- **Løsning**: Øk `MIN_OCCURRENCES` verdien for å filtrere bort sjeldne ingredienser

## 📝 Notater

- Ingrediensnormaliseringen er grunnleggende og kan forbedres
- Nettverket bruker Barnes-Hut algoritme for layout
- Fysikken slås av etter stabilisering for bedre ytelse
