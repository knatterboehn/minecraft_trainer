# Test Report v0.58 - CI Failure Patch

## Anlass

Der erste GitHub-Actions-Lauf nach v0.57 ist im Job **Web app checks** mit Exit Code 1 fehlgeschlagen. Aus der sichtbaren GitHub-Zusammenfassung war nicht erkennbar, welcher einzelne Testschritt die Ursache war.

## Ziel

v0.58 macht die CI-Pipeline robuster und besser debugbar:

- Core-Web-Tests ohne Browser getrennt ausführen
- Browser-E2E als eigenen Job ausführen
- Browser-Umgebung im Workflow sichtbar machen
- E2E-Screenshots als Artifact hochladen
- Fabric-Build erst nach Core-Tests und Browser-E2E starten

## Änderungen

### Package Scripts

```text
npm run test:core
npm run test:e2e
npm run ci:web
npm run ci:e2e
npm run ci:fabric
```

`ci:web` enthält bewusst nicht mehr den Browser-E2E-Test.

### GitHub Actions

Der Workflow hat jetzt drei Jobs:

```text
Web app checks
Browser E2E checks
Fabric client JAR
```

Der Fabric-Build hängt von beiden Testjobs ab:

```text
needs:
  - web-tests
  - browser-e2e
```

### Browser E2E

Der Browser-Job nutzt explizit:

```text
E2E_CHROME_PATH=/usr/bin/google-chrome-stable
```

Vor dem Test werden verfügbare Browser angezeigt. Screenshots werden immer als Artifact hochgeladen:

```text
blockcoach-e2e-screens
```

### Versionen

- App-Version: `0.58`
- Package-Version: `0.58.0`
- Mod-Version: `0.58.0`
- Bridge-Version: `0.58`
- Artifact-Ziel: `blockcoach-client-0.58.0+1.21.11.jar`

## Lokal ausgeführte Tests

```zsh
npm run check
npm test
npm run test:local-bridge
```

## Ergebnis

```text
Syntax check passed: 39 JavaScript files.
Smoke test passed
Regression tests passed
Bridge integration tests passed
Local bridge test passed
Fabric prototype test passed
Release preparation test passed
GitHub Actions test passed
E2E user-flow test passed
```

## Erwartung nach Push

Beim nächsten Push sollte ein Fehler nicht mehr als unklare Sammelmeldung unter **Web app checks** erscheinen. Falls weiterhin ein Fehler auftritt, ist der betroffene Bereich direkt sichtbar:

- **Web app checks** = Syntax/Core/App-Logik
- **Browser E2E checks** = Browser/UI/E2E
- **Fabric client JAR** = Fabric/Gradle/Mod-Build
