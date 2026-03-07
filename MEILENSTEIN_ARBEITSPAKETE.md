# Meilenstein- und Arbeitspaketplan: Spiele pro Themenordner

## 1) Bestehende Struktur und Logik (Stand: 06.03.2026)

- Spiele liegen in `games/` und werden über `games/game_loader.html` per `game_type` auf ein HTML-Spiel gemappt.
- Die Lerninhalte liegen als JSON unter `database/...`.
- `index.js` lädt die ausgewählte JSON-Datei, cached sie in `sessionStorage` und startet dann den `game_loader`.
- Der `game_loader` erwartet in jeder JSON ein gültiges Feld `game_type`.

Aktueller Bestand:

- `72` Themenordner mit JSON-Inhalten
- `360` JSON-Dateien gesamt
- Aktive Spieltypen in den Daten: `escape_game`, `matching_puzzle`, `quick_quiz`, `wer_bin_ich`, `what_and_why`
- Zusätzlich vorhandenes Spiel im Code: `sortier_spiel` (aktuell in Daten nicht ausgerollt)

Festgestellte Abweichungen:

- `database/Teil 1/IT-Teil/KI/Level02/*` enthält 5 leere JSON-Dateien (0 Byte, nicht parsebar).
- `database/Teil 1/Gesamt/7 Erbringen der Leistungen und Auftragsabschluss/7_7 Mängel und Mängelarten/Missionen_7_7_PvAP1/Missionen_7_7_PvAP1 AP1-WAW01.json` hat `game_type: "quick_quiz"` statt `what_and_why`.
- `games/sortier_spiel.html` referenziert `games/sortier_spiel_payload.js`, die Datei ist derzeit nicht vorhanden.

## 2) Meilenstein

### M1: Vollständige Spielabdeckung je Themenordner

Ziel:

- Jeder Themenordner (Ordner mit Lern-JSONs) enthält für jedes verfügbare Spiel einen lauffähigen Datensatz.

Abnahmekriterien (Definition of Done):

- Pro Themenordner existiert genau 1 valider JSON-Datensatz je Spieltyp:
  - `escape_game`
  - `matching_puzzle`
  - `quick_quiz`
  - `wer_bin_ich`
  - `what_and_why`
  - `sortier_spiel`
- Alle JSON-Dateien sind parsebar.
- `game_type` stimmt mit dem Dateizweck überein.
- Jede Datei startet im Frontend ohne Laufzeitfehler.
- Eine automatisierte Coverage-Prüfung liefert `0` fehlende Spieltypen.

## 3) Arbeitspakete

### AP-01: Bestand einfrieren und Zielregel definieren

Ergebnis:

- Verbindliche Regel, welche Spieltypen pro Themenordner Pflicht sind.

Aufgaben:

- Soll-Liste der Pflicht-`game_type`s final festlegen (inkl. `sortier_spiel`).
- Namenskonvention pro Datei festschreiben (z. B. `... AP1-QQ01.json`).
- Themenordner-Liste als Referenz erzeugen.

### AP-02: Datenfehler bereinigen (Blocker entfernen)

Ergebnis:

- Aktuelle Datenbasis ist technisch valide.

Aufgaben:

- 5 leere KI-Level02-Dateien mit gültigen JSON-Inhalten ersetzen.
- Falschen `game_type` in `...AP1-WAW01.json` korrigieren.
- JSON-Lint/Parse-Check über kompletten `database/`-Baum ausführen.

### AP-03: Sortier-Spiel technisch freischalten

Ergebnis:

- `sortier_spiel` ist produktiv nutzbar.

Aufgaben:

- Fehlende Datei `games/sortier_spiel_payload.js` ergänzen oder `sortier_spiel.js` auf direkte Payload-Verarbeitung umstellen.
- Zielschema für `sortier_spiel` dokumentieren (`columns`, `cards`, `correctForms`, UI-Texte).
- Smoke-Test für mindestens 1 Sortier-JSON durchführen.

### AP-04: Standard-Templates pro Spieltyp bereitstellen

Ergebnis:

- Wiederverwendbare Ausgangsvorlagen für alle 6 Spieltypen.

Aufgaben:

- Pro Spieltyp 1 kanonisches Template mit Pflichtfeldern erstellen.
- Feldvalidierung (Mindestanzahl Fragen/Cases/Sets) definieren.
- Beispiel-Content so aufbauen, dass nur Themeninhalt ausgetauscht werden muss.

### AP-05: Rollout auf alle Themenordner

Ergebnis:

- Vollständige Spielabdeckung im gesamten `database/`-Baum.

Aufgaben:

- Pro Themenordner fehlende Spieltypen ergänzen.
- Vorhandene Dateien nur inhaltlich angleichen, Dateistruktur beibehalten.
- Level-Logik (`Level01`, `Level02`) konsistent beibehalten.

### AP-06: Automatisierte Coverage- und Schema-Prüfung

Ergebnis:

- Reproduzierbarer Qualitätscheck vor jedem Release.

Aufgaben:

- Prüfscript erstellen (`tools/`), das je Themenordner auf Vollständigkeit und Parsebarkeit prüft.
- Check auf falsche `game_type`-Zuordnung ergänzen.
- Ergebnisbericht als Markdown/Console-Report ausgeben.

### AP-07: End-to-End-Abnahme

Ergebnis:

- Fachlich und technisch freigegebener Gesamtstand.

Aufgaben:

- Stichprobenlauf über alle Spieltypen in mehreren Themenordnern.
- Browser-Konsole auf Fehler prüfen.
- Finale Abnahme-Checkliste dokumentieren.

## 4) Empfohlene Umsetzungsreihenfolge

1. AP-01
2. AP-02
3. AP-03
4. AP-04
5. AP-05
6. AP-06
7. AP-07

## 5) Lieferobjekt dieses Schritts

- Dieses Dokument: `MEILENSTEIN_ARBEITSPAKETE.md`
