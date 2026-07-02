# Minecraft Trainer

Eine einfache Vanilla-HTML/CSS/JS-App als Minecraft Training Companion.

Version 0.45 stellt die modulare Struktur wieder visuell auf Premium-Gaming-UI um: Dark UI, Quest-Hero, Pixel-Art-Visuals und klare Spielerlogik ohne zur Monster-index.html zurückzugehen.

## Ziel

Die App arbeitet ab jetzt mit einer klaren Event-Architektur:

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

## Struktur

```text
index.html
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
```

## Keine Fake-Live-Daten

Die Minecraft-Integration ist vorbereitet, aber nicht verbunden. Solange keine echte Bridge existiert, läuft die App im manuellen Modus.
