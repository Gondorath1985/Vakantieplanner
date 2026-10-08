# Vakantiekompas

Statische vakantieplanner met een donkere werkruimte: criteria links, apart scrollende resultaten in het midden en reisdetails rechts. Kaarten, namen en highlights openen het detailpaneel. Opgeslagen bestemmingen, vergelijking en een geografische catalogus hebben eigen tabbladen.

## Ontwikkelen en publiceren

Gebruik de bestaande checkout /workspace/Vakantieplanner; geen worktree tenzij gevraagd. Node.js 24 en Python 3, geen externe runtimepakketten.

```sh
npm test
npm start
```

`npm start` bouwt en serveert op poort 3000. Herstart processen bij een nieuwe cloudsessie; onderzoek een bezette poort en stop alleen zelf gestarte processen. Bewerk index.template.html, bronmodules en style.css. Bouw na wijzigingen met `npm run build`; neem index.html, version.json, manifest en huidige hashed assets samen met de bronwijzigingen op. GitHub Pages serveert main/root. Behoud eerder gepubliceerde assets voor bestaande browsers; verwijder alleen eigen ongepubliceerde tussenbuilds.

De updatecontrole gebruikt version.json met cache-omzeiling. Tijdens invoer verschijnt een updateknop. Voorkeuren, tabblad en geopend profiel blijven lokaal bewaard. Publicatie is niet onmiddellijk gegarandeerd; de cloudsessie zelf is geen publieke preview.

## Gegevens en dekking

- Alle 249 ISO-landen/gebieden; Afghanistan, Noord-Korea en Israël blijven op eerder verzoek buiten aanbevelingen.
- Startselectie: 794 profielen, waaronder 148 regio’s/eilanden en 397 steden. Niet iedere administratieve regio is een zelfstandig toeristisch advies.
- Op aanvraag geladen geografische index: 171.094 plaatsrecords en 5.313 administratieve regio’s met geldige coördinaten. Zoekresultaten zijn beperkt tot ISO-landen die de planner kent. De databank dekt niet elke plaats op aarde en bewijst geen toeristische geschiktheid. Kies een rij om deze mee te nemen en lokaal te bewaren.
- 1.223 UNESCO-erfgoedrecords uit een herleidbare **kopie van de officiële export uit 2024**, via WorldHeritageApp. De actuele primaire lijst was niet bereikbaar. Namen, categorieën, inschrijvingsjaar, locatie en primaire detail-URL worden gebruikt; geen gekopieerde volledige beschrijvingen of foto’s. Specifieke Nederlandse toelichtingen zijn parafrases van bronfeiten, gekoppeld aan gecontroleerde bron-ID’s.
- 98 rechtstreeks opgeslagen ERA5-bronprofielen. Hun historische klimaatreeksen worden gebruikt in 161 bestemmingsprofielen, inclusief expliciet benoemde nabijgelegen referenties. Dit zijn geen 161 afzonderlijke lokale meetreeksen.

**Alle automatische voorbeeldprijzen, fictieve vliegtijden, bootduurmodellen en automatische 0–10-aanbodscores zijn verwijderd**, inclusief de oude bronmodules die sjablonen genereerden. Oud gepubliceerde assets blijven voor compatibiliteit aanwezig; de actuele build gebruikt ze niet.

## Wat is bekend en wat ontbreekt?

Geografie komt van mledoze/countries, GeoNames via cities.json, en Countries States Cities Database. Deze bronnen zijn geen actuele beoordeling van politiek, veiligheid of inreisvoorwaarden. Luchthavencoördinaten uit OpenFlights zijn geografische achtergrond, geen actuele verbindingen.

Erfgoed bij een land is de landelijke selectie uit de historische lijst, aangepast voor fysieke locatie van Curaçao en Puerto Rico. Bij steden zijn sites binnen 60 km hemelsbreed geselecteerd, bij algemene regio’s binnen 180 km van de referentieplek. Benoemde grote regio’s zoals Java, noord-/midden-Vietnam en west-/oost-Canada hebben expliciete bron-ID-koppelingen. De scope staat bij de details; hemelsbrede afstand is geen reistijd. Een historische natuur-/cultuurcategorie of een trefwoord bevestigt een bronvermelding, niet de actuele toegang of beschikbaarheid van een excursie. Een genoemd rif bewijst bijvoorbeeld geen toegankelijke duikexcursie.

Dagelijkse ERA5-data via Open-Meteo, 2015–2024: maandgemiddelde temperatuur, gemiddelde dagelijkse minima/maxima, gemiddelde maandsom neerslag en gemiddelde sunshine_duration in uren/dag. Per veld/maand minimaal 90% dagdekking; anders onbekend. Dit is heranalyse op referentiecoördinaten, geen lokale meting, nationale gemiddelde of weersverwachting. Minimum/maximum zijn geen extreme records. Daglicht wordt apart astronomisch berekend op de referentieplek voor de 15e van iedere maand.

Een niet-landelijk profiel kan dezelfde **echte referentiereeks binnen maximaal 25 km** gebruiken. Bronplek, afstand en bron-ID blijven zichtbaar; er wordt niet geïnterpoleerd of een lokale meetreeks verzonnen. Het klimaatvenster (18–32 °C, ≤150 mm regen, ≥5 uur zonneschijn) is een transparante voorkeursregel, geen universeel beste reisseizoen.

Actuele vluchtprijzen, dienstregelingen, overstappen, deur-tot-bestemming reistijd, noodzakelijke bootduur, hotel-/dagprijzen, visa, politieke labels en veiligheidsniveaus zijn **nog niet verbonden aan een geverifieerde actuele bron**. Officiële vlucht-/advieswebsites gaven netwerkproxy 403; er is geen vluchtproviderbinding. De klimaatimport bereikte na wachten op minuutlimieten een uurquotum (HTTP 429) en stopte met behoud van geïmporteerde gegevens. Zie climate-import-report.json en research-status.json. Ontbrekende waarden zijn geen nul en krijgen geen verzonnen standaard.

## Zoeken en plannen

Onbekende informatie wordt standaard meegenomen, met veldstatus. Apart tonen of verbergen is optioneel. Bekende overschrijdingen blijven apart; bezochte landen/regio’s en hun gekoppelde onderregio’s blijven uitgesloten. Positieve informatie over één reisvorm sluit andere, nog onbekende reisvormen niet uit.

Interessevolgorde gebruikt gewichten bij bronvermeldingen uit UNESCO-categorieën en trefwoorden. Dit is een onvolledige erfgoedinventarisatie, geen objectieve kwaliteitsscore, geen volledigheidsbewijs en geen vergelijkbare 0–10-metingen van spa, eten, rust of natuur. Eigen aanbodcijfers zijn vrijwillige persoonlijke inschattingen, expliciet apart benoemd. Een persoonlijke procentscore wordt alleen getoond bij minstens 60% gewogen dekking. Extra UNESCO-filters toetsen uitsluitend de historische bronselectie.

Budget blijft per persoon, met groepstotaal als eigen bestedingsgrens; er is geen prijsmodel meer. Aantal reizigers wordt gebruikt voor de budgetgrens, niet voor verzonnen villa- of kamerprijzen. De totale reistijd is de hoofdroutegrens; alleen vliegtijd, direct vliegen en maximaal overstappen staan bij extra routevoorkeuren. Nederland/Amsterdam blijft het vertrekpunt.

Reisduur krijgt een planningssignaal bij 14+ dagen in één stad, op een eiland of compacte bestemming en een wens voor afwisseling. 'Veel rust' laat dat signaal weg; korte reizen ook. Kleine Caraïbische/Polynesische landen worden op werkelijke landoppervlakte herkend, zonder te beweren dat een verblijf van 21 dagen onmogelijk is. Suriname wordt niet als klein eiland behandeld. Dit signaal is een planningsregel, geen objectief maximaal of aanbevolen verblijf.

Bewaren verandert filters niet. Vergelijking toont onbekende velden expliciet. Schema v5 behoudt oudere per-persoonsbudgetten, reismaanden en opgeslagen plekken; een oud totaalbudget migreert één keer. JSON export/import en localStorage blijven lokaal, inclusief extra geografische profielen en eigen aanbodinschattingen.

## Data-import

Bestaande statische gegevens vereisen geen externe netwerktoegang tijdens normaal gebruik. De grote geografische index wordt alleen geladen in de catalogus, nooit automatisch bij startup.

```sh
# Alleen ontbrekende landen, rustige verzoeken; hervatten na providerquotum:
npm run climate:import -- --all --countries --missing --gentle
# Alle ontbrekende referentieplekken, inclusief regio’s en steden:
npm run climate:import -- --all --missing --gentle
npm run build
```

De standaardimport zonder flags behandelt acht oorspronkelijke referentieprofielen. Records met exact dezelfde aanvraagcoördinaten worden gegroepeerd. Minuutlimieten worden maximaal twee keer na 65 seconden gerespecteerd; uur-/daglimieten stoppen de import. Report vermeldt fouten en niet aangevraagde profielen. Bestaande data blijven behouden. Vraag geen sleutel als de gratis providerlimiet al een afdoende verklaring is; gebruik de voorwaarden van de provider. Voer de import niet automatisch bij iedere startup uit.

Optioneel geografische/erfgoedbronbestanden opnieuw verwerken (xlrd 2.0.2 voor het historische Excelbestand):

```sh
python3 -m pip install xlrd==2.0.2
npm run research:import
# --refresh haalt de bronbytes opnieuw op; zonder flag wordt een bestaand onderzoekscachebestand gebruikt.
npm run build
```

scripts/import-research.py slaat bron-URL’s en inhoudschecksums op. LICENSE-DATA.md bevat herkomst en licenties. Research-import is optioneel en niet nodig om de site te bouwen of te starten.

## Validatie

28 Node-tests en 3 Python-tests: echte catalogusdekking, bronkoppelingen, scope/hiërarchie, afwezigheid van automatische schijngegevens, onzekerheidsbeleid, regionale uitsluitingen, maandlogica, routefilters, lange-reisadvies, persoonlijke scores, nabije klimaatreferenties en v5-migratie. Chromium is gecontroleerd op desktop/tablet/mobiel voor kaartklikken, broninformatie, bewaren/vergelijken, geo-zoekfunctie en lokale opslag, onbekende routes, reisduur, exports, importfouten, scrollpanelen en overflow.
