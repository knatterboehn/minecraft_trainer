# Test Report v0.57 - GitHub Actions Build

## Ziel

v0.57 ergänzt eine GitHub-Actions-Pipeline, damit BlockCoach automatisch getestet und der Fabric-Client als `.jar` gebaut werden kann.

## Geprüfter Scope

- App-Version `0.57`
- Package-Version `0.57.0`
- Mod-Version `0.57.0`
- GitHub Actions Workflow vorhanden
- Web-App Checks als eigener Job
- Fabric Build als eigener Job
- Node.js 22 eingerichtet
- Java 21 eingerichtet
- Gradle eingerichtet
- Fabric Resolver läuft im Workflow vor dem Build
- Fabric Preflight läuft vor Gradle Build
- `.jar` wird als Workflow-Artefakt hochgeladen
- keine Release-/Publish-Secrets im Workflow
- Release-Unterlagen auf `0.57.0` aktualisiert

## Neue Dateien

```text
.github/workflows/fabric-build.yml
.gitignore
docs/github-actions-build.md
scripts/github-actions-test.mjs
docs/test-report-v057.md
```

## Neue Scripts

```zsh
npm run ci:web
npm run ci:fabric
npm run test:workflow
```

## Lokale Testbefehle

```zsh
npm run check
npm test
```

## Ergebnis lokal

```text
Syntax check passed
Smoke test passed
Regression tests passed
Bridge integration tests passed
Local bridge test passed
Fabric prototype test passed
Release preparation test passed
GitHub Actions test passed
E2E user-flow test passed
```

## Nicht lokal ausgeführt

Der echte Gradle-Build gegen Fabric/Minecraft wurde in dieser Umgebung nicht ausgeführt, weil externe Maven-/Gradle-Abhängigkeiten hier nicht geladen werden können. Der Build soll über GitHub Actions oder auf einem lokalen Rechner mit Internetzugriff laufen.

## Nächster Schritt

1. Änderungen pushen.
2. GitHub Actions öffnen.
3. Workflow **BlockCoach Fabric Build** starten oder Push abwarten.
4. Artifact herunterladen.
5. `.jar` auf einem Minecraft-Java-1.21.11-Rechner testen.
