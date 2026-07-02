# Minecraft Trainer

Eine Vanilla-HTML/CSS/JS-App als Minecraft Training Companion.

Version 0.47 nutzt wieder echte SVG-Assets und hält die UX auf wenige klare Konzepte fokussiert:

1. **Daily Quest** - was heute gespielt wird
2. **Fight Log** - was im Spiel passiert ist
3. **Bonus Challenge** - was Extra-XP bringt
4. **Progress** - was der Spieler erreicht hat

Keine doppelten Systeme, keine Fake-Live-Daten, keine Monster-`index.html`.

## Ziel

Die App arbeitet mit einer Event-Architektur:

- Heute: manuelle Eingabe über Buttons
- Später: echte Minecraft-Daten über eine Bridge / Mod-Integration

Die Oberfläche bleibt bewusst einfach:

1. Daily Quest ansehen
2. Quest starten
3. Fights loggen
4. Bonus Challenge tracken
5. Quest abschließen
6. Progress ansehen

## Starten

Empfohlen über VS Code Live Server oder GitHub Pages.

Wichtig: Immer den kompletten Ordner hochladen, nicht nur `index.html`. Die App braucht `styles/` und `src/`, sonst fehlen Design und JavaScript.

Direkt per Datei kann je nach Browser das Laden von ES-Modulen blockiert werden. Deshalb am besten lokal einen kleinen Server nutzen.

## Daten

Die App nutzt genau einen localStorage-Key:

`minecraftTrainerApp`

Darin liegt das komplette App-Objekt inklusive History und GameEvents.

## UX-Regeln

- Spielerlogik vor Dashboard-Logik.
- Wenige klare Konzepte statt paralleler Begriffe.
- Ein 10- bis 18-jähriger Spieler soll in unter 5 Sekunden wissen, was zu tun ist.
- Nicht viel tippen: häufige Aktionen sind große Buttons.
- Die App sagt nur Dinge, die aus Daten ableitbar sind.
- Minecraft-Integration wird nicht vorgetäuscht.

## Struktur

```text
index.html
assets/
  player-wave.svg
  creeper-angry.svg
  player-diamonds.svg
  ghast-fire.svg
  ...
styles/
  tokens.css
  base.css
  components.css
  screens.css
src/
  main.js
  state/
    defaults.js
    normalize.js
    store.js
  domain/
    quest.js
    gameEvents.js
    progress.js
    analysis.js
  integrations/
    manualAdapter.js
    mockGameAdapter.js
    minecraftBridgeAdapter.js
  ui/
    render.js
    screens/
      onboarding.js
      dashboard.js
      training.js
      progress.js
      analysis.js
      profile.js
    components/
      emptyState.js
      questCard.js
      statCard.js
scripts/
  smoke-test.mjs
```

## Keine Fake-Live-Daten

Die Minecraft-Integration ist vorbereitet, aber nicht verbunden. Solange keine echte Bridge existiert, läuft die App im manuellen Modus.
