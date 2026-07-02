# BlockCoach

**Level up your fights.**

BlockCoach ist ein gamifizierter Minecraft-Java-Coach: Daily Quests, XP, Streaks, Bonus Challenges und ein Live-Integrationspfad für echte Gameplay-Daten.

**Version 0.61** ergänzt die Alpha-Release-Automation: Ein Tag wie `v0.61.0-alpha` kann automatisch Web-Tests, Browser-E2E, Fabric-Build und einen GitHub-Prerelease mit `.jar`-Asset auslösen.

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

## Live Integration

Zielarchitektur:

```text
Minecraft Java Edition 1.21.11
→ Fabric Client Mod Prototype
→ Local Bridge http://127.0.0.1:4317/events
→ WebSocket ws://localhost:4317/events
→ BlockCoach Web-App
→ GameEvents + Gamification
```

Vorhanden:

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

## Release Automation

Release-Unterlagen und Automation für die Fabric-Mod sind vorbereitet:

```text
INSTALL_MOD.md
PRIVACY.md
FAIR_PLAY.md
LICENSE
docs/mod-release-metadata.json
docs/modrinth.md
docs/curseforge.md
docs/github-release-checklist.md
docs/github-actions-build.md
docs/release-notes-alpha-template.md
docs/alpha-test-checklist.md
.github/workflows/fabric-build.yml
.github/workflows/fabric-release.yml
```

Empfohlene Veröffentlichungsreihenfolge:

```text
1. GitHub Release Alpha
2. Alpha-Test mit Vince/Testern
3. Modrinth Draft / Alpha
4. CurseForge Alpha
```

Noch nicht erledigt:

```text
JAR lokal in Minecraft Java 1.21.11 testen
Bridge mit echter Minecraft-Instanz prüfen
Modrinth/CurseForge manuell einreichen
```

## GitHub Actions

### Build Workflow

```text
.github/workflows/fabric-build.yml
```

Der Build-Workflow läuft bei Push auf `main`, Pull Request und manuell. Er ist in drei Jobs getrennt:

```text
npm run ci:web      # Syntax + Core-Tests ohne Browser
npm run ci:e2e      # echter Browser-E2E-Test
npm run ci:fabric   # Fabric Resolver + Preflight + Gradle Build
```

Nach erfolgreichem Fabric-Build heißt das Workflow-Artefakt:

```text
blockcoach-client-0.61.0-minecraft-1.21.11
```

### Alpha Release Workflow

```text
.github/workflows/fabric-release.yml
```

Der Release-Workflow läuft bei Tags wie:

```text
v0.61.0-alpha
```

Er baut die Web-App-Checks, den Browser-E2E-Test und die Fabric-JAR erneut. Danach erstellt er einen GitHub-Prerelease und hängt die `.jar` an.

Details: `docs/github-actions-build.md`.

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

Wichtig: Der Java-Code nutzt Yarn-Namen wie `MinecraftClient`, `ClientTickEvents` und `ClientPlayConnectionEvents`. Deshalb verwendet `build.gradle` Yarn-Mappings.

Versionen lokal auflösen und schreiben:

```zsh
npm run fabric:resolve -- --write
```

Preflight prüfen:

```zsh
npm run fabric:preflight
```

Build starten:

```zsh
npm run fabric:build
```

Details: `docs/fabric-build-1.21.11.md`.

## Mod installieren

Für Alpha-Tester nach einem erfolgreichen Release:

```text
1. Minecraft Java 1.21.11 installieren
2. Fabric Loader installieren
3. Fabric API installieren, falls benötigt
4. blockcoach-client-0.61.0+1.21.11.jar in den mods-Ordner legen
5. npm run bridge starten
6. BlockCoach Web-App öffnen
7. Minecraft mit Fabric starten
```

Details:

- `INSTALL_MOD.md`
- `docs/alpha-test-checklist.md`

## Datenschutz und Fair Play

Kurzfassung:

- localhost-only
- keine Cloud per Default
- keine Account-Daten
- kein Auto-Aim
- kein Auto-Click
- keine Gegner-Markierung
- keine Gameplay-Automation

Details:

- `PRIVACY.md`
- `FAIR_PLAY.md`

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
npm run test:release-prep
npm run test:workflow
npm run test:release-automation
```

## Fabric-spezifisch

```bash
npm run fabric:resolve:dry
npm run fabric:resolve -- --write
npm run fabric:preflight
npm run fabric:build
```

`fabric:resolve` braucht Internetzugriff auf Fabric Meta und Fabric Maven. In dieser Chat-Umgebung kann ich den echten Gradle-Build nicht ausführen, weil externe Maven-/Gradle-Abhängigkeiten nicht geladen werden können.
