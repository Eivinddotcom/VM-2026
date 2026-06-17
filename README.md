# ⚽ Tippeliga Live - VM 2026

En live-nettside for å vise tipperesultater fra fotball-VM 2026.

## Funksjoner

- 📊 **Live poengstilling** - Automatisk oppdatering hvert 30. sekund
- 🎯 **Detaljert oversikt** - Se hver enkelt tips og poengberegning
- 🌍 **Football-Data.org API** - Henter offisielle resultater
- 📱 **Responsiv design** - Fungerer på mobil, tablet og desktop
- 🚀 **GitHub Pages** - Gratis hosting

## Teknologi

- Ren HTML/CSS/JavaScript (ingen avhengigheter)
- Football-Data.org API for live resultater
- CORS Proxy for API-kall fra browser

## Bruk

### Online

Nettsiden er tilgjengelig på: **https://eivinddotcom.github.io/VM-2026/**

### Lokal kjøring

```bash
# Åpne filen direkte i nettleseren
open index.html

# Eller kjør en lokal server
python -m http.server 8000
# Besøk: http://localhost:8000
```

## Konfigurering

Rediger `index.html` for å:

1. **Endre spillernavnene:**
   ```javascript
   const PLAYERS = ["Staals", "Kong", "Dox", "Jojo", "Marko", "Barra"];
   ```

2. **Legge til eller endre kamper:**
   ```javascript
   const MATCHES = [
     {id:1, home:"Mexico", away:"South Africa", tips:["3-0","2-1",...]},
     // ...
   ];
   ```
   Tips-rekkefølge må tilsvare PLAYERS-rekkefølgen.

3. **Endre auto-oppdateringsintervall:**
   ```javascript
   setInterval(fetchLive, 30000); // 30 sekunder
   ```

## Poengberegning

- **Eksakt resultat (f.eks. 2-1):** 4 poeng
- **Riktig resultatretning (f.eks. seier/tap/uavgjort):** 2 poeng
- **Feil tipp:** 0 poeng

## API-nøkkel

Prosjektet bruker en Football-Data.org API-nøkkel. For flere kamper eller bedre rategrense, registrer deg på [football-data.org](https://www.football-data.org/) og oppdater `API_KEY`.

## Feilsøking

### "Henter allerede..."
- Vent på at forrige kall er ferdig (max 30 sekunder)

### "Kunne ikke hente data"
- Sjekk internettforbindelsen
- Verifiser at API-nøkkelen er gyldig
- Se konsollen for detaljert feilmelding (`F12 → Console`)

### Kamper vises ikke som oppdatert
- Sørg for at lagnavnene i `MATCHES` matcher eksakt navn fra API
- Sjekk konsollen for "Ikke i listen"-meldinger
- Lagnavnene blir normalisert (aksenter fjernes, mellomrom fjernes)

## Utvikling

```bash
# Åpne konsollen (F12) for debug-logger
# Koden skriver ut alle API-kall og matchinger
```

## Lisens

MIT - Fritt å bruke og endre
