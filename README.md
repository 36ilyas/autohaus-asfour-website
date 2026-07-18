# Autohaus Asfour Krefeld – Website-Entwürfe

Zwei Gestaltungsentwürfe für den neuen Webauftritt des Autohauses Asfour in Krefeld.
Beide Varianten haben identischen Inhalt und dieselbe Fahrzeugsuche – sie unterscheiden
sich ausschließlich in Gestaltung und Farbwelt.

| Seite | Datei | Beschreibung |
| --- | --- | --- |
| Übersicht | `index.html` | Auswahlseite zwischen beiden Entwürfen |
| Entwurf A | `premium.html` | Dunkel mit Gold-Akzent |
| Entwurf B | `corporate.html` | Hell mit Grün-Akzent, nah an der bisherigen CI |

## Aufbau

```
assets/
  base.css             Layout und Komponenten (nutzt nur CSS-Variablen für Farben)
  theme-premium.css    Farbwelt + Kopfbereich Entwurf A
  theme-corporate.css  Farbwelt + Kopfbereich Entwurf B
  app.js               Fahrzeugsuche, Filter, Detailansicht
  data.js              Fahrzeugbestand, Finanzierungsbeispiel, Kontaktdaten
  fahrzeuge/           Fahrzeugfotos
```

Kein Build-Schritt, keine Abhängigkeiten – statisches HTML/CSS/JS.
Lokal ansehen: `python -m http.server` im Projektordner starten.

## Fahrzeuge pflegen

Alle Inserate stehen in `assets/data.js`. Ein Eintrag ergänzen oder ändern reicht –
Filter, Sortierung und die Preis-/Kilometer-Regler passen ihre Grenzen automatisch an.
Die Monatsrate wird als echte Annuität aus `FINANZIERUNG` berechnet, nicht als
Kaufpreis geteilt durch Laufzeit.

## Vor dem Live-Gang

- [ ] Fahrzeuge, Preise und Ausstattungen durch die echten Bestandsdaten ersetzen
- [ ] Eigene Fahrzeugfotos statt der Platzhalter aus Wikimedia Commons (siehe `BILDNACHWEIS.md`)
- [ ] Impressum und Datenschutzerklärung ergänzen (Pflicht nach § 5 DDG bzw. DSGVO)
- [ ] Hinweisbanner „Gestaltungsentwurf“ und `noindex` in den `<head>`-Bereichen entfernen
- [ ] Angaben zu Verbrauch, CO₂-Emissionen und Effizienzklasse je Fahrzeug prüfen (Pkw-EnVKV)
- [ ] Öffnungszeiten ergänzen, falls gewünscht
- [ ] Google Fonts lokal einbinden oder Einwilligung einholen (Datenschutz)
- [ ] OpenStreetMap-Karte: Einbindung datenschutzkonform gestalten (z. B. Zwei-Klick-Lösung)

## Hinweis

Die gezeigten Fahrzeuge, Preise und Ausstattungsangaben sind Beispieldaten und stellen
kein verbindliches Angebot dar.
