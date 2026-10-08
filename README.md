# Vakantiekompas

Eerste prototype voor het vinden van vakantiebestemmingen op basis van voorkeuren en bezochte landen. Geen build of externe pakketten nodig. Node 24 voor tests, Python 3 voor de lokale server.

## Ontwikkelen

Gebruik de bestaande checkout; een aparte Git-worktree is niet nodig.

```sh
cd /workspace/Vakantieplanner
npm test
npm start
```

De server gebruikt poort 3000. Controleer lokaal met `curl --fail http://127.0.0.1:3000/`. Het betreft een statische website; voorkeuren blijven alleen in browser-localStorage. Voor modules is een HTTP-server nodig.

## Werkende functies

- Twaalf voorbeeldprofielen met gewogen scores voor twaalf interesses (0–10).
- Regio, budget inclusief voorbeeldvluchten, temperatuurbereik en aantal reizigers.
- Alle 249 ISO-landen/gebieden in een doorzoekbare uitsluitingslijst.
- Opgeslagen voorkeuren, landdetails en lege-resultaatmelding.

## Datakwaliteit en vervolg

Alle numerieke bestemminggegevens zijn ongeverifieerde voorbeelden zonder bron of peildatum. Verblijfskosten zijn vaste voorbeelden voor twee personen; alleen vluchtkosten schalen met het aantal reizigers. De website benoemt deze beperking. Geen maandafhankelijke klimaatberekening of actuele prijzen.

Voor productie zijn gelicentieerde, gedateerde databronnen nodig voor alle bestemmingen: klimaat per maand (gemiddeld/minimum/maximum, regenval en zonuren), optimale reistijd, politieke regering en staatsvorm, veiligheid, zelf rijden, top 25 activiteiten, reisbudgetten en actuele vluchtprijzen. Geef onbekende data weer als onbekend. Politieke classificaties moeten methode en peildatum hebben; veiligheid vereist actueel officieel reisadvies. Live vliegtickets vereisen een aanbieder en mogelijk API-toegang; geen sleutels in de browser.

Optionele Google Fonts worden extern geladen; bij ontbreken gebruikt de pagina lokale systeemlettertypen.
