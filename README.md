# Minecraft Trainer

Vanilla-HTML/CSS/JS-App als Minecraft Training Companion.

**Version 0.49** ergänzt den Quest-Completion- und Gamification-Loop auf Basis des originalen Premium-Gaming-UI.

## Produktprinzip

- **Original UI bleibt Source of Truth.**
- Neue Logik wird unter die bestehende Oberfläche gelegt.
- Keine Fake-Live-Daten.
- Kein zusätzlicher localStorage-Key.
- Keine Monster-`index.html`.
- UX-Logik vor Feature-Ausbau.

## Kernkonzepte

1. **🎯 Daily Quest** - was heute gespielt wird
2. **⚔️ Fight Log** - was im Spiel passiert ist
3. **💎 Bonus Challenge** - was Extra-XP bringt
4. **📈 Fortschritt** - was der Spieler erreicht hat

## Gamification Loop

```text
Daily Quest sehen
→ Quest starten
→ Fights loggen
→ Bonus Challenge schaffen
→ Kurz-Review wählen
→ Quest abschließen
→ XP, Streak und Quest-Verlauf sehen
```

## Live-Integration

Die App ist technisch vorbereitet für spätere Minecraft-Daten:

- Heute: manuelle Buttons erzeugen GameEvents.
- Später: Minecraft-Bridge / Mod kann dieselben GameEvents erzeugen.
- Die App zeigt Live-Integration nicht als verbunden an, solange keine echte Verbindung existiert.

## Starten

Empfohlen über VS Code Live Server oder GitHub Pages.

Wichtig: Immer den kompletten Ordner hochladen, nicht nur `index.html`.

## Daten

Die App nutzt genau einen localStorage-Key:

`minecraftTrainerApp`

Darin liegt das komplette App-Objekt inklusive History und GameEvents.

## Struktur

```text
index.html
assets/
styles/
  original.css
src/
  main.js
  state/
  domain/
  integrations/
  ui/
scripts/
```

## Checks

```bash
npm run check
npm test
```
