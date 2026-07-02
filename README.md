# BlockCoach

**Level up your fights.**

BlockCoach ist ein gamifizierter Minecraft-Java-Coach: Daily Quests, XP, Streaks, Bonus Challenges und ein Live-Integrationspfad für echte Gameplay-Daten.

**Version 0.54** richtet den Fabric-Prototyp auf Minecraft Java `1.21.11` aus und ergänzt einen lokalen Build-/Startpfad für die erste Mod-Verbindung.

## Produktprinzip

- **Original UI bleibt Source of Truth.**
- Gamification bleibt Kern: Quest → Fights → Bonus → Abschluss → XP/Streak.
- Keine Fake-Live-Daten.
- Kein zusätzlicher localStorage-Key.
- Manuelle Eingabe bleibt Backup.
- Live-Events laufen durch dieselbe Trainingslogik wie manuelle Events.
- Der Coach liest und analysiert nur. Er automatisiert kein Gameplay.

## Branding

```text
BlockCoach
Level up your fights.
```

Hinweis: BlockCoach ist nicht offiziell mit Minecraft, Mojang oder Microsoft verbunden.

## Kernkonzepte

1. **🎯 Daily Quest** - was heute gespielt wird
2. **⚔️ Fight Log** - was im Spiel passiert ist
3. **💎 Bonus Challenge** - was Extra-XP bringt
4. **📈 Fortschritt** - was der Spieler erreicht hat
5. **BlockCoach Live** - echter Event-Eingang für Minecraft Java, wenn Bridge/Mod verbunden sind

## Gamification Loop

```text
Daily Quest sehen
→ Quest starten
→ Fights loggen oder automatisch übernehmen
→ Bonus Challenge schaffen
→ Kurz-Review wählen
→ Quest abschließen
→ XP, Streak und Quest-Verlauf sehen
```

## Live Integration v0.54

Zielarchitektur:

```text
Minecraft Java Edition
→ Fabric Client Mod Prototype
→ Local Bridge http://127.0.0.1:4317/events
→ WebSocket ws://localhost:4317/events
→ BlockCoach Web-App
→ GameEvents + Gamification
```

Bereits vorhanden seit v0.53:

- `tools/local-bridge/server.mjs`
- `tools/local-bridge/emit.mjs`
- `fabric-mod/blockcoach-client/`
- Local Bridge mit HTTP Health, HTTP POST und WebSocket-Broadcast
- Fabric-Client-Prototyp für sichere Client-Events:
  - `minecraft_connected`
  - `server_joined`
  - `health_changed`
  - `hotbar_changed`
  - `item_used`
  - `player_death`
  - `session_tick`

## Bridge starten

```zsh
npm run bridge
```

Test-Event senden:

```zsh
npm run bridge:emit -- --server PvPClub
npm run bridge:emit -- --win
npm run bridge:emit -- --loss
```

## Fabric Prototype

Der Prototype liegt hier:

```text
fabric-mod/blockcoach-client/
```

Zielversion für den Fabric-Prototyp ist jetzt Minecraft Java `1.21.11`. Die Datei `gradle.properties` ist auf `minecraft_version=1.21.11` gesetzt. Der exakte `fabric_api_version`-Wert muss vor einem echten Gradle-Build auf ein offizielles Fabric-API-Artefakt für `1.21.11` aktualisiert werden.


## Fabric Build Setup für 1.21.11

Die lokale Mod-Strecke ist vorbereitet für:

```text
Minecraft Java 1.21.11
Fabric Client Mod
Local Bridge localhost:4317
BlockCoach Web-App
```

Preflight prüfen:

```zsh
npm run fabric:preflight
```

Der Preflight stoppt bewusst, wenn `fabric_api_version` noch nicht auf ein offizielles Fabric-API-Artefakt für `1.21.11` gesetzt wurde. Dadurch bauen wir nicht versehentlich gegen eine falsche Minecraft-Version.

Build nach erfolgreichem Preflight:

```zsh
npm run fabric:build
```

Details: `docs/fabric-build-1.21.11.md`.

## Daten

Die App nutzt weiterhin genau einen localStorage-Key:

```text
minecraftTrainerApp
```

Der Key bleibt absichtlich erhalten, damit bestehende Daten nicht verloren gehen.

## Starten

Empfohlen über VS Code Live Server oder GitHub Pages.

Wichtig: Immer den kompletten Ordner hochladen, nicht nur `index.html`.

## Struktur

```text
index.html
assets/
styles/
  original.css
src/
  brand.js
  main.js
  state/
  domain/
  integrations/
  ui/
tools/
  local-bridge/
fabric-mod/
  blockcoach-client/
scripts/
docs/
```

## Checks

```bash
npm run check
npm test
npm run test:e2e
npm run test:bridge
npm run test:local-bridge
npm run test:fabric
```

## Testabdeckung

- Syntax-Check aller JS-Dateien
- Smoke- und Regression-Tests
- Bridge-Integration-Test
- Local-Bridge-Test mit echtem WebSocket
- Fabric-Prototyp-Strukturtest
- Browser-E2E mit echten Klicks

Siehe `docs/test-report-v054.md`.
