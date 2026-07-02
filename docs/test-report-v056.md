# Test Report v0.56 - Public Mod Release Preparation

## Ziel

BlockCoach für eine spätere öffentliche Veröffentlichung der Fabric-Mod vorbereiten, ohne die Mod bereits auf GitHub Releases, Modrinth oder CurseForge zu veröffentlichen.

## Umfang

Neu oder aktualisiert:

- `package.json` auf `0.56.0`
- `src/state/defaults.js` auf App-Version `0.56`
- `fabric-mod/blockcoach-client/gradle.properties` auf `mod_version=0.56.0`
- `INSTALL_MOD.md`
- `PRIVACY.md`
- `FAIR_PLAY.md`
- `LICENSE`
- `docs/mod-release-metadata.json`
- `docs/modrinth.md`
- `docs/curseforge.md`
- `docs/github-release-checklist.md`
- `scripts/release-prep-test.mjs`

## UX / Produktprüfung

Bestanden:

- Release-Unterlagen erklären den Nutzen klar: Training, Daily Quests, XP, Streaks, Fight Review.
- Öffentliche Beschreibung vermeidet Cheat-Wording.
- Privacy/Fair-Play-Grenzen sind vor Veröffentlichung sichtbar.
- Installation ist für Alpha-Tester schrittweise dokumentiert.
- Manuelle Nutzung bleibt möglich, wenn Mod oder Bridge nicht laufen.
- Keine Änderung am originalen UI-Designsystem.

## Sicherheitsprüfung

Bestanden:

- localhost-only Transport dokumentiert.
- Kein Cloud-Endpoint per Default.
- Keine Account-/Passwort-Erfassung.
- Kein Auto-Aim.
- Kein Auto-Click.
- Keine Kamera-Steuerung.
- Keine Gegner-Markierung.
- Keine Gameplay-Automation.

## Automatisierte Tests

Ausgeführt:

```zsh
npm run check
npm test
```

Ergebnis:

```text
Syntax check passed: 38 JavaScript files.
Smoke test passed: Quest completion, gamification loop and Progress UI are consistent.
Regression tests passed: data safety, quest loop, gamification states, render states and concept language are consistent.
Bridge integration tests passed: status states, inbox, no fake live, and active-quest event mapping are consistent.
Local bridge test passed: HTTP health, WebSocket client, POST event ingestion and browser broadcast are consistent.
Fabric prototype test passed: client mod skeleton, Yarn mapping setup, safe event sources and localhost-only bridge sender are consistent.
Release preparation test passed: public mod metadata, privacy, fair-play, install and platform release drafts are complete and consistent.
E2E user-flow test passed: real browser clicks, onboarding, bridge event ingestion, quest loop, completion, progress, analysis, profile and mobile navigation are consistent.
```

## Ergebnis

v0.56 ist bereit als Release-Preparation-Paket.

Noch nicht erledigt:

- kein echter Gradle-Build im Container
- keine echte `.jar` veröffentlicht
- kein Modrinth-/CurseForge-Upload ausgeführt
- kein echter Minecraft-Starttest, weil lokal kein Minecraft verfügbar ist

## Nächster sinnvoller Schritt

v0.57 sollte GitHub Actions vorbereiten, damit der Fabric-Mod-JAR automatisch gebaut wird. Danach kann ein GitHub Alpha Release erstellt und anschließend Modrinth/CurseForge vorbereitet werden.

## ZIP-Test

Ausgeführt nach Entpacken von `minecraft-trainer-v056.zip`:

```zsh
npm run check
npm run test:release-prep
```

Ergebnis:

```text
Syntax check passed: 38 JavaScript files.
Release preparation test passed: public mod metadata, privacy, fair-play, install and platform release drafts are complete and consistent.
```
