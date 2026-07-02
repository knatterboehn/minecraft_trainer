# BlockCoach

**Level up your fights.**

BlockCoach ist ein gamifizierter Minecraft-Java-Coach: Daily Quests, XP, Streaks, Bonus Challenges und ein Live-Integrationspfad für echte Gameplay-Daten.

**Version 0.52** führt das Rebranding und die Live Integration Foundation ein. Die App bleibt vollständig nutzbar im manuellen Modus und zeigt Live-Daten nur an, wenn echte Bridge-Events empfangen werden.

## Produktprinzip

- **Original UI bleibt Source of Truth.**
- Gamification bleibt Kern: Quest → Fights → Bonus → Abschluss → XP/Streak.
- Keine Fake-Live-Daten.
- Kein zusätzlicher localStorage-Key.
- Manuelle Eingabe bleibt Backup.
- Live-Events laufen später durch dieselbe Trainingslogik wie manuelle Events.

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

## Live Integration Foundation

Zielarchitektur:

```text
Minecraft Java Edition
→ Fabric Client Mod
→ Local Bridge ws://localhost:4317/events
→ BlockCoach Web-App
→ GameEvents + Gamification
```

Die App unterstützt jetzt:

- Live-Status: nicht verbunden, checking, bridge erkannt, Minecraft verbunden, Server erkannt, error
- Bridge-Inbox im Profil
- WebSocket-Prüfung über `ws://localhost:4317/events`
- Browser-Eingang über `window.BlockCoachBridge.receive(...)`
- Custom Event Eingang über `blockcoach:bridge-event`
- Mapping von sicheren Bridge-Events auf interne GameEvents, wenn eine Quest aktiv ist

Details: `docs/minecraft-bridge-contract.md`

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
scripts/
docs/
```

## Checks

```bash
npm run check
npm test
npm run test:e2e
npm run test:bridge
```

## Testabdeckung

- Syntax-Check aller JS-Dateien
- Smoke- und Regression-Tests
- Bridge-Integration-Test
- Browser-E2E mit echten Klicks

Siehe `docs/test-report-v052.md`.
