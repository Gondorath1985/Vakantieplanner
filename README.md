# Vakantiekompas

Een statische website om vakantiebestemmingen te ontdekken, vergelijken en bewaren. De catalogus bevat **175 landen en gebieden, 204 profielen en 40 specifieke regio’s/eilanden**. Dit is een brede inspiratieselectie, geen ranglijst van de veiligste of beste landen. Afghanistan, Noord-Korea en Israël zijn op verzoek uitgesloten.

## Ontwikkelen en publiceren

Gebruik de bestaande checkout; maak alleen een Git-worktree als de gebruiker daarom vraagt. Node.js 24 en Python 3 zijn nodig, externe runtimepakketten niet.

```sh
cd /workspace/Vakantieplanner
npm test
npm start
```

`npm start` bouwt de website en serveert de repository op poort 3000. ES-modules vereisen HTTP. Processen moeten na een nieuwe cloudsessie opnieuw worden gestart. Onderzoek een bezette poort en stop alleen een zelf gestart proces.

Bewerk **index.template.html**, de bronmodules en style.css. Voer na wijzigingen `npm run build` uit; de server leest de nieuwe bestanden bij een volgende request. De build genereert index.html, version.json, build-manifest.json en assets met inhoudshashes. Neem deze gegenereerde bestanden samen met de bronnen op in een commit. GitHub Pages serveert `main` en `/ (root)` direct; er is geen extra deploymentdienst nodig.

### Cache en updates

Iedere gewijzigde module en stylesheet krijgt een nieuwe bestandsnaam; geïmporteerde modules verwijzen eveneens naar hun juiste hash. De pagina controleert bij openen, terugkeren naar een tabblad en iedere 60 seconden `version.json` met cache-omzeiling. Een nieuwe versie opent een verse pagina-URL en bewaart de voorkeuren. Tijdens invullen of een open detailvenster verschijnt eerst een updateknop. Een sessieguard voorkomt herlaadlussen tijdens een gedeeltelijke publicatie. Offline blijft de huidige pagina werken. Oude browserpagina's zonder deze updatecode hebben eenmalig een gewone cachevrije URL of harde verversing nodig. Updates verschijnen pas nadat GitHub Pages ze gepubliceerd heeft; directe beschikbaarheid kan niet worden gegarandeerd.

## Filters en resultaten

- Meerdere mogelijke vertrekmaanden: minstens één maand moet passen, of elke maand. Iedere maand wordt apart beoordeeld; geen misleidend gemiddelde over bijvoorbeeld januari en juli. Dit is geen model voor een reis die meerdere maanden beslaat.
- Wereldregio of buiten Europa, budget per persoon, aantal reizigers, reisduur, budgetscenario, temperatuur, regen, zon en aanbevolen reisperiode.
- Acht reisvormen, zoals stedentrip, rondreis, strand, roadtrip, safari, duiken en rust; meerdere vinkjes hebben OR-semantiek. Niets aanvinken laat alle vormen toe.
- Achttien interesses (0–10), plus snelle voorkeursinstellingen.
- Uitsluiting van een heel land of alleen een uitgewerkte regio/eiland. Bali laat Java beschikbaar; westkust VS laat Hawaii en New York beschikbaar. Landen met regio's hebben geen dubbel landsoverzicht in de resultaten.
- Tekstzoeken op bestemming, land en highlight, sorteren op match/kosten/zon en 12 resultaten per stap.
- Bijna-passende suggesties met maximaal twee afwijkende criteria: budget maximaal 25% hoger, temperatuur maximaal 5 graden verschil, regen maximaal 60 mm extra, zon maximaal 2 uur minder, of buiten de aanbevolen periode. Geografisch uitgesloten of bezochte bestemmingen worden nooit alsnog voorgesteld.
- Bewaren verandert filters niet. Twee of meer bewaarde bestemmingen krijgen een vergelijkingstabel. Filters gericht aanpassen voor een bijna-passende optie houdt de gekozen maanden intact.
- Voorkeuren exporteren/importeren als JSON; ze worden verder alleen in browser-localStorage opgeslagen. Schema v3 bewaart v2-budgetten, migreert een enkele maand naar een maandenlijst en verwijdert de oude kamerbezetting. Oude v1-totaalbudgetten worden één keer naar budget per persoon omgezet.

## Uitleg van de match

`score = 10 × som(aanbodscore × belang) / som(belang)`.

De score is een voorkeursovereenkomst, geen kwaliteits-, veiligheids- of beschikbaarheidsoordeel. 100% vereist 10/10 op iedere meegewogen interesse. Een 7/10-aanbod bij een belangrijk onderwerp kan dus punten kosten terwijl de bestemming nog steeds leuk is. Bij 0 belang telt een onderwerp niet mee; alle belangen op 0 betekent geen voorkeursscore. Ontbrekende interesses worden als onbekend opgegeven in de zoeklogica, niet stilzwijgend als nul gerekend.

Kaarten noemen de grootste fricties; het detailvenster toont per interesse belang, aanbod, bijdrage en verloren percentagepunten. Kosten, klimaat en reisvormen zijn aparte filters en beïnvloeden dit percentage niet.

## Begroting zonder accommodatiekeuze

De planner helpt eerst een bestemming kiezen. Een villa, appartement of hotel boek je later zelf; er zijn geen kamerbezetting-, villa- of beschikbaarheidsregels meer.

`per persoon = retourvlucht + (daguitgaven × dagen + standaard-verblijf-per-nacht × (dagen − 1)) × scenariofactor`.

Het verblijfssjabloon komt uit de helft van de voorbeeldprijs voor een tweepersoonskamer; dit is nu uitsluitend een per-persoonsbenchmark, zonder veronderstelde daadwerkelijke kamerindeling. Factoren: eenvoudig 0,7; gemiddeld 1; comfortabel 1,5. Vluchten worden niet met deze factor vermenigvuldigd. Het groepstotaal is de ongeronde raming maal het aantal reizigers, daarna afgerond. Groepskorting, echte villa's, actuele tickets, visa, verzekeringen en uitzonderlijke excursies worden niet berekend.

## Data en beperkingen

World-catalog bevat benoemde bestemmingsideeën met korte redactionele beschrijvingen. Basisprofielen hebben drie concrete highlights; de oorspronkelijke uitgebreidere profielen bevatten 25 plekken/activiteiten, waaronder expliciet herkenbare algemene activiteiten. Nieuwe specifieke regio's bevatten vijf concretere ideeën. Er wordt geen objectieve top 25 of geverifieerde toegang geclaimd.

Klimaat, min/max-temperatuur, zon, regen, optimale maanden, scores en prijzen zijn **illustratieve sjablonen**, geen gemeten nationale gemiddelden of actuele offertes. Landen en regio's delen soms hetzelfde klimaatsjabloon. De bredere basisprofielen hebben minder detail en worden zo gemarkeerd. Gebruik ze niet als doorslaggevend reisadvies.

Actuele veiligheid, democratie-index en links/rechts-classificatie blijven onbekend en tellen niet mee in matches. Algemene institutionele achtergrond en valuta zijn slechts voor enkele landen ingevuld. Er is een link naar officieel Nederlands reisadvies. Voor productie ontbreken geverifieerde bronnen met peildatum, fijnmazige regio- en klimaatgegevens, prijsbanden en actuele politieke/veiligheidsdata. Live vluchtprijzen vragen een aanbieder; sleutels horen niet in browsercode.

Google Fonts is optioneel; lokale lettertypen werken zonder die netwerktoegang.

## Validatie

`npm test` controleert echte catalogusdekking, beschreven highlights, regio-uitsluitingen, maandsemantiek, prijsmodel, transparante scores, reisvormfilters, bijna-passende uitleg, sortering en migratie. De site is daarnaast interactief in Chromium gecontroleerd op desktop en mobiel, inclusief opslag, export/import, vergelijking, updatecontrole en behoud van voorkeuren bij bijwerken.
