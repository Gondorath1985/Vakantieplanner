# Vakantiekompas

Een statisch prototype voor het ontdekken en vergelijken van vakantiebestemmingen. Geen externe runtimepakketten of build nodig. Python 3 serveert de website; Node.js 24 draait de tests.

## Ontwikkelen

Gebruik de bestaande checkout; maak alleen een Git-worktree als de gebruiker daarom vraagt.

```sh
cd /workspace/Vakantieplanner
npm test
npm start
```

De server luistert op poort 3000. Controleer lokaal met `curl --fail http://127.0.0.1:3000/`. ES-modules vereisen HTTP. Processen moeten na een nieuwe cloudsessie opnieuw worden gestart. Bij een bezette poort: onderzoek de eigenaar en stop alleen een zelf gestart proces. GitHub Pages kan rechtstreeks `main` en de repository-root serveren.

## Zoeken en vergelijken

- 27 profielen: 10 landen en 17 specifiekere regio's/eilanden. Indonesië: Bali, Java, Lombok/Gili, Flores/Komodo, Raja Ampat. VS: westkust, Florida, New York/Washington D.C. Canada: west/oost. Griekenland: vasteland, Kreta, Rhodos, Corfu, Naxos, Paros, Santorini.
- Alle 249 ISO-landen/gebieden in de uitsluitingslijst. Vink een land of alleen een uitgewerkte regio aan. Bezochte Bali sluit Java niet uit. Reeds genoemde bezoeken (Bali, VS-westkust, Florida, West-Canada) staan bij een eerste bezoek vooraf aangevinkt; ze zijn vrij te wijzigen.
- Buiten Europa of specifieke wereldregio; reismaand; aanbevolen periode; gemiddelde temperatuur, regen en zon; 18 voorkeursschuiven.
- Budget **per persoon**, aantal reizigers, reisduur en personen per kamer.
- Per profiel een illustratieve maandtabel, 25 highlight-/activiteitsideeën, valuta, verkeerszijde en institutionele achtergrond. Algemene activiteiten zijn expliciet herkenbaar en vormen geen geverifieerde top 25.
- Bijna-passende suggesties missen maximaal twee criteria: budget maximaal 25% te hoog, temperatuur maximaal 5 graden afwijking, regen maximaal 60 mm extra, zon maximaal 2 uur minder, of buiten de aanbevolen periode. Bezochte plekken en uitgesloten regio's worden nooit als bijna-passend voorgesteld.
- Bewaren voor vergelijking zonder filters te wijzigen, of alleen de ontbrekende filtergrenzen aanpassen.
- Voorkeuren, bezoeken en bewaarde bestemmingen staan uitsluitend in browser-localStorage. Een oud totaalbudget wordt eenmalig gedeeld door het opgeslagen aantal reizigers (schema v2).

## Kostenmodel

`per persoon = retourvlucht + dagbudget × dagen + kamerprijs × ceil(reizigers / personen-per-kamer) × (dagen − 1) / reizigers`.

Het groepstotaal rekent met de ongeronde bedragen. Eén dag heeft geen verblijfskosten. Een oneven groep betaalt voor de benodigde extra kamer. De kamerprijs is een vaste illustratieve prijs, onafhankelijk van bezetting: er wordt geen live groepskorting of echte beschikbaarheid geclaimd. Visum, verzekering en bijzondere excursies kunnen extra kosten geven. Bij vier reizigers en twee personen per kamer blijft het per-persoonbedrag gelijk aan dat bij twee reizigers; het groepstotaal verdubbelt.

## Datakwaliteit

Klimaatcurves, lage/hoge temperaturen, zonuren, regenval, prijzen en voorkeursscores zijn **illustratieve planningsramingen**. De curves zijn seizoensmodellen, geen gemeten gemiddelden; meerdere bestemmingen delen een curve. Reisperioden zijn globale voorbeelden. Highlights zijn redactionele ideeën, geen objectieve ranglijst; opening en toegang zijn niet gecontroleerd.

Actueel reisadvies, democratie-index en regeringskleur blijven onbekend: dit wordt zichtbaar benoemd en deze velden sturen de match niet. Institutionele achtergrond is geen politieke kwaliteitsbeoordeling. Er is een link naar officieel Nederlands reisadvies. Voor productie zijn gelicentieerde bronnen, bronvermelding per gegeven en peildata nodig, en profielen voor overige landen/regio's. Live vluchtprijzen vereisen een aparte aanbieder; API-sleutels horen niet in browsercode.

Google Fonts is optioneel; lokale systeemlettertypen werken zonder die netwerktoegang.

## Validatie

`npm test` controleert de regio-uitsluitingen, kosten voor groepsgroottes, klimaat-/maandfilters, bijna-passende uitleg en filteraanpassing, datasetconsistentie en migratie van voorkeuren. Interacties zijn daarnaast in Chromium gecontroleerd: uitsluiting, vier reizigers, details, bewaren, aanpassen, herladen en mobiele lay-out.
