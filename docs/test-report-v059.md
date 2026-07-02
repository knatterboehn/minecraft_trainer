# Test Report v0.59 - Gradle/Loom Compatibility Fix

## Auslöser

Der GitHub-Actions-Workflow war nach v0.58 nur noch im Job **Fabric client JAR** rot. Web-App-Checks und Browser-E2E waren grün.

Der Build-Log zeigte:

```text
Could not resolve net.fabricmc:fabric-loom:1.17.13
No matching variant ... org.gradle.plugin.api-version ... value '9.5.0'
consumer ... required '8.14.3'
```

## Diagnose

Der Fehler lag nicht im BlockCoach-Java-Code, sondern im Build-Tooling:

```text
Fabric Loom 1.17.x verlangt Gradle Plugin API 9.5.0.
Der GitHub Runner nutzte noch Gradle 8.14.3.
```

## Änderungen

- App-Version auf `0.59`
- Package-Version auf `0.59.0`
- Mod-Version auf `0.59.0`
- GitHub-Actions-Workflow auf Gradle `9.5.0` umgestellt
- Artifact-Ziel aktualisiert:

```text
blockcoach-client-0.59.0-minecraft-1.21.11
blockcoach-client-0.59.0+1.21.11.jar
```

- Fabric-Preflight erweitert:
  - prüft Java 21+
  - prüft Gradle `9.5.0+`
  - gibt bei Gradle-Mismatch eine klare Ursache aus
- Fabric-Build-Runner erweitert:
  - zeigt vor dem Build `gradle --version`
  - gibt klareren Installationshinweis bei fehlendem Gradle
- Doku ergänzt:
  - `docs/github-actions-build.md`
  - `docs/fabric-build-1.21.11.md`
  - `README.md`

## Lokal ausgeführte Tests

```zsh
npm run check
npm test
npm run ci:web
npm run ci:e2e
```

## Ergebnis

```text
Syntax check passed: 39 JavaScript files.
Smoke test passed.
Regression tests passed.
Bridge integration tests passed.
Local bridge test passed.
Fabric prototype test passed.
Release preparation test passed.
GitHub Actions test passed.
E2E user-flow test passed.
```

## Nicht lokal ausgeführt

Der echte Fabric-/Gradle-Build wurde in dieser Umgebung nicht ausgeführt, weil externe Gradle-/Maven-Abhängigkeiten hier nicht geladen werden können.

Der nächste echte Test ist der Push nach GitHub Actions.

## Erwartung für den nächsten GitHub-Lauf

Der vorherige Fehler

```text
No matching variant of net.fabricmc:fabric-loom
required org.gradle.plugin.api-version 8.14.3
```

sollte durch Gradle `9.5.0` verschwinden.

Falls der Job danach wieder scheitert, ist der nächste Fehler wahrscheinlich der erste echte Java-/Fabric-Kompatibilitätsfehler im Mod-Code oder eine fehlende Fabric-/Yarn-/API-Version für Minecraft `1.21.11`.
