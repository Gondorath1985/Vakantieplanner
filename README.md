# Vakantiekompas

Statische vakantieplanner met 249 ISO-landen en gebieden, 44 regio-/eilandprofielen en 19 stadsprofielen (312 totaal). Volledige geografische dekking betekent niet dat ieder gebied complete of geverifieerde reisgegevens heeft. Afghanistan, Noord-Korea en Israël blijven op eerder verzoek buiten aanbevelingen, maar zijn vindbaar in de catalogus.

## Ontwikkelen en publiceren

Node.js 24 en Python 3; geen externe runtimepakketten. Gebruik de bestaande checkout, geen worktree tenzij gevraagd.

```sh
cd /workspace/Vakantieplanner
npm test
npm start
```

`npm start` bouwt en serveert op poort 3000. Herstart processen na een nieuwe cloudsessie. Onderzoek een bezette poort; stop alleen zelf gestarte processen. Bewerk index.template.html, bronmodules en style.css. Na wijzigingen: `npm run build`. Neem bronnen, index.html, version.json, build-manifest.json en huidige hashed assets samen op in een commit. Behoud eerder gepubliceerde assets voor bestaande browsers. GitHub Pages serveert main, root; publicatie kan enige tijd kosten.

Modules en CSS krijgen inhoudshashes. update.mjs controleert version.json bij openen, tabbladherstel en elke 60 seconden. Bij invoer verschijnt eerst een updateknop. Voorkeuren blijven in localStorage; een guard voorkomt herlaadlussen tijdens gedeeltelijke publicatie. Een oude pagina zonder updatecode kan eenmalig een cachevrije URL nodig hebben.

## Werkruimte en filters

Brede desktopwerkruimte: onafhankelijk scrollende selectiecriteria links, resultaten midden, details rechts. Op kleinere schermen staan panelen onder elkaar; details worden geen popup. Tabbladen: Ontdekken, Opgeslagen, Vergelijken en Alle landen. Vergelijken toont opgeslagen bestemmingen of zoekresultaten in een horizontaal scrollbare tabel.

Meerdere reismaanden: minstens één of elke maand afzonderlijk moet passen. Budget is per persoon; reizigers wijzigen het groepstotaal. Reisvormen hebben OR-semantiek. Landen/regio’s/eilanden/steden zijn apart selecteerbaar; steden staan standaard uit. Bezochte regio’s verwijderen hun onderliggende steden, maar niet het hele land. Voorbeelden: Bali laat Java beschikbaar; west-Canada laat oost-Canada beschikbaar.

Vlieg- en totale reislimieten vergelijken de bovengrens van een expliciet afstandsmodel vanaf Amsterdam. Dit is geen dienstregeling of routezoekmachine. Bootfilter vergelijkt de langste noodzakelijke overtocht van een routeconcept; optionele bootactiviteiten zijn apart te verbergen. Lange noodzakelijke bootritten komen nooit terug als bijna-passende opties. Zeegang en vaartijden zijn niet gegarandeerd. Onbekende routes worden niet bootvrij verklaard.

Tekstzoeken laat ook uitgesloten profielen zien met redenen. Bijna-passende opties hebben maximaal twee beperkte afwijkingen (budget +25%, temperatuur 5 °C, regen 60 mm, zon/daglicht 2 uur). Onbekende relevante gegevens staan apart als 'Nog te controleren', niet als bevestigde matches. Deze lijst heeft een knop voor meer resultaten. Bewaren verandert filters niet; opgeslagen reizen blijven zichtbaar met eventuele uitsluitingsreden.

## Scores en begroting

Interesse-inschatting = 10 × som(aanbod × belang) / som(belang), over bekende dimensies. Minder dan 60% gewogen datadekking: geen percentage. Onbekend is niet nul; gewicht nul is geen uitsluiting. Scores beschrijven praktische mogelijkheden, geen oppervlakteaandeel, kwaliteit of verplichte reisroute. Vietnam is regionaal herzien met toelichting voor bossen, steden, massages/spa en zonvakanties. Andere oorspronkelijke profielen hebben herkenbaar gelabelde voorbeeldscores; brede sjabloonscores zijn verwijderd. Eigen inschattingen kunnen per profiel lokaal worden ingevoerd en gewist.

Oude kostenraming: retourvlucht + (daguitgaven × dagen + helft voorbeeldkamerprijs × (dagen − 1)) × scenariofactor. Eenvoudig 0,7; gemiddeld 1; comfortabel 1,5. Vlucht niet geschaald; groepstotaal maal aantal reizigers. Geen echte kamerindeling, actuele tickets, villaoffertes of groepskorting. Ontbrekende prijzen blijven onbekend.

Schema v4 bewaart eerdere per-persoonsbudgetten, opgeslagen bestemmingen, voorkeuren en bezochte regio’s; oude totaalbudgetten migreren één keer. Export/import via JSON; opslag alleen in deze browser.

## Klimaat en bronstatus

Alle oude niet onderbouwde klimaatcurves zijn verwijderd. climate-data.mjs bevat voor 27 profielen ERA5-heranalyse op expliciete referentiecoördinaten, 2015–2024, via Open-Meteo. Dagelijkse temperatuurgegevens worden maandelijks gemiddeld; minimum/maximum zijn gemiddelde dagelijkse minima/maxima, geen extremen. Regen is de gemiddelde maandsom. sunshine_duration wordt van seconden naar gemiddelde uren per dag omgezet. Per veld/maand is minstens 90% dagdekking vereist; anders onbekend. Dit is geen lokale meetreeks, nationale gemiddelde of weersvoorspelling. ERA5 modelleert ook zonneschijn en kan afwijken van lokale waarnemingen; referentieplek is niet de hele regio.

Daglicht wordt apart astronomisch berekend voor de 15e van iedere maand, zonder bewolkingsinformatie. Een klimaatvenster gebruikt een transparante regel (gemiddeld 18–32 °C, regen ≤150 mm, zonneschijn ≥5 uur/dag); dit is geen universele beste reisperiode.

Optioneel verversen van de acht oorspronkelijke referentieprofielen:

```sh
npm run climate:import
npm run build
```

Alle beschikbare luchthavenreferenties: `npm run climate:import -- --all`. Import vereist netwerktoegang tot archive-api.open-meteo.com, kan bij toegangs- of providerlimieten gedeeltelijk slagen en behoudt eerdere gegevens. Geen credentials nodig voor de gratis API; gebruik voldoet aan de voorwaarden van de provider. climate-import-report.json beschrijft het uitgevoerde importresultaat. De laatste brede import was gedeeltelijk: 27 behouden profielen, niet alle aanvragen geslaagd. Voer deze optionele netwerkaanroep niet automatisch bij startup uit.

Geografische metadata: mledoze/countries; luchthavenlocaties: OpenFlights. Zie LICENSE-DATA.md voor herkomst en licenties. Luchthavengegevens bewijzen geen actuele verbindingen. Highlights zijn redactionele ideeën met korte beschrijving; geen objectieve top 25. Politieke indeling, actuele veiligheid, rijregels en prijzen zijn niet geverifieerd en beïnvloeden geen gefingeerde index. Officieel Nederlands reisadvies is gelinkt.

## Validatie

`npm test`: 20 Node-tests voor dekking, hiërarchie, bronstatus, onzekerheid, uitsluitingen, maandfilters, bootlimieten, prijs- en scorelogica en migratie; 3 Python-tests voor klimaateenheden, maandaggregatie en ontbrekende gegevens. Chromium is interactief gecontroleerd op desktop, tablet en mobiel, inclusief scrollpanelen, details, bewaren, vergelijking, diagnose, lokaal aanpassen, filters, opslag en export/import.
