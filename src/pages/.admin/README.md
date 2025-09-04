## Admin panel

Kjør admin panel med

```bash
node server.js
```

- Legg til oppskrift.
- Oppskrift blir lagt til i new_recipes.json i data mappa

### Forbedringer for datakvalitet:

1. **Tid**: Skriv inn tid i minutter som tall (f.eks. 30, 90, 120)
2. **Porsjoner**: Skriv inn antall porsjoner som tall (f.eks. 4, 6, 8)
3. **Ingredienser**: Bruk separate felt for antall og enhet for bedre standardisering
4. **Validering**: Klient- og server-side validering før lagring
5. **Forhåndsvisning**: Se hvordan oppskriften vil se ut før lagring
6. **Nøkkelord**: Forhåndsdefinerte forslag for konsistente nøkkelord

### Design og brukeropplevelse:

- **Moderne design**: Følger Foodstalker's design system med riktige farger og typografi
- **Responsivt**: Fungerer bra på både desktop og mobil
- **Intuitivt**: Tydelige seksjoner og hjelpetekster
- **Visuell feedback**: Forbedrede meldinger og validering
- **Tilgjengelighet**: Bedre fokus-håndtering og semantisk HTML

### Rydde opp i eksisterende data:

```bash
cd scripts
node clean-existing-data.js
```

Dette vil:

- Konvertere tidsformater til minutter (tall)
- Standardisere ingrediensmengder
- Lage backup av originaldata
