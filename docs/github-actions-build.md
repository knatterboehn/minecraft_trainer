# v0.63 GitHub Actions Build and Alpha Release

## Ziel

BlockCoach soll automatisch in GitHub getestet, als Fabric-Mod gebaut und bei Alpha-Tags als GitHub-Prerelease veröffentlicht werden.

```text
Push nach main
→ Web app checks
→ Browser E2E checks
→ Fabric client JAR
→ .jar als GitHub Actions Artifact
```

```text
Tag v0.63.0-alpha
→ Web app checks
→ Browser E2E checks
→ Fabric client JAR
→ GitHub Prerelease mit .jar Asset
```

## Workflows

```text
.github/workflows/fabric-build.yml
.github/workflows/fabric-release.yml
```

## Build Workflow

Der Build-Workflow läuft bei:

- Push auf `main`
- Pull Request
- manuellem Start über `workflow_dispatch`

### Jobs

#### 1. Web app checks

```zsh
npm run ci:web
```

Das prüft ohne Browser-Abhängigkeit:

- JavaScript-Syntax
- Smoke Test
- Regression Test
- Bridge Integration
- Local Bridge
- Fabric Prototype Structure
- Release Preparation
- GitHub Actions Workflow
- Release Automation Workflow

Der Browser-E2E-Test läuft absichtlich nicht in diesem Job. Dadurch ist sofort sichtbar, ob ein Fehler aus der App-Logik oder aus der Browser-Umgebung kommt.

#### 2. Browser E2E checks

```zsh
npm run ci:e2e
```

Das prüft den echten Nutzerfluss im Headless-Browser:

- Onboarding
- Daily Quest starten
- Bridge-Event empfangen
- manuelle Fights klicken
- Bonus Challenge abschließen
- Quest abschließen
- Fortschritt, Analyse und Profil öffnen
- mobile Navigation

Der Job zeigt vorher die Browser-Umgebung an und nutzt:

```text
E2E_CHROME_PATH=/usr/bin/google-chrome-stable
```

Zusätzlich werden die E2E-Screenshots als Artifact hochgeladen:

```text
blockcoach-e2e-screens
```

#### 3. Fabric client JAR

```zsh
npm run fabric:resolve
npm run fabric:preflight
npm run fabric:build
```

Der Job nutzt:

- Node.js `22`
- Java `21`
- Gradle `9.5.0`
- Fabric Loom `1.17-SNAPSHOT`
- Minecraft Java `1.21.11`
- Yarn Mappings
- Fabric Loader
- Fabric API

Der Fabric-Build startet erst, wenn Web-App-Checks und Browser-E2E grün sind.

### Ergebnis

Nach erfolgreichem Build wird hochgeladen:

```text
blockcoach-client-0.63.0-minecraft-1.21.11
```

Der eigentliche `.jar` liegt im Artifact aus:

```text
fabric-mod/blockcoach-client/build/libs/*.jar
```

Der erwartete Release-Dateiname ist:

```text
blockcoach-client-0.63.0+1.21.11.jar
```

## Alpha Release Workflow

Der Release-Workflow läuft bei Tags wie:

```text
v0.63.0-alpha
```

Er kann auch manuell gestartet werden:

```text
Actions → BlockCoach Alpha Release → Run workflow → tag_name: v0.63.0-alpha
```

### Was der Release Workflow macht

```text
Checkout
→ Node 22
→ Java 21
→ Gradle 9.5.0
→ npm run ci:web
→ npm run ci:e2e
→ npm run fabric:resolve
→ npm run fabric:preflight
→ npm run fabric:build
→ Release-JAR finden
→ Artifact hochladen
→ GitHub Prerelease erstellen
→ .jar als Release Asset anhängen
```

### Rechte

Nur der Release-Workflow nutzt Schreibrechte:

```yaml
permissions:
  contents: write
```

Der normale Build-Workflow bleibt read-only.

### Release Notes

Der Release-Workflow nutzt:

```text
docs/release-notes-alpha-template.md
```

### Alpha-Test

Nach dem Release nutzt der Tester:

```text
docs/alpha-test-checklist.md
```

## Bedienung in GitHub

### Build prüfen

1. Repository öffnen.
2. Tab **Actions** öffnen.
3. Workflow **BlockCoach Fabric Build** wählen.
4. Entweder auf einen Push warten oder **Run workflow** klicken.
5. Bei Fehlern den betroffenen Job öffnen:
   - **Web app checks** = App-/Node-Testproblem
   - **Browser E2E checks** = Headless-Chrome-/UI-Testproblem
   - **Fabric client JAR** = Fabric-/Gradle-/Mod-Buildproblem
6. Nach erfolgreichem Lauf das `.jar`-Artifact herunterladen.

### Alpha Release erzeugen

```zsh
git tag v0.63.0-alpha
git push origin v0.63.0-alpha
```

Danach:

1. GitHub → **Actions** öffnen.
2. Workflow **BlockCoach Alpha Release** prüfen.
3. Nach grünem Lauf GitHub → **Releases** öffnen.
4. Prüfen, ob die `.jar` am Prerelease hängt.
5. Link an Tester schicken.

## Troubleshooting

### Web app checks schlagen fehl

Dann liegt der Fehler nicht im Browser, sondern in Syntax, Domain-Logik, Bridge-Tests, Release-Dokumenten oder Workflow-Konsistenz. Den Schritt **Run web checks** öffnen und die erste Fehlermeldung kopieren.

### Browser E2E checks schlagen fehl

Den Schritt **Show browser environment** und danach **Run browser E2E test** öffnen. Screenshots werden zusätzlich als `blockcoach-e2e-screens` hochgeladen.

### Fabric Resolver schlägt fehl

Fabric hat dann wahrscheinlich für `1.21.11` kurzzeitig kein passendes Loader-, Yarn- oder Fabric-API-Artefakt geliefert oder der Runner hatte ein Netzwerkproblem.

### Preflight schlägt fehl

Der Preflight stoppt absichtlich, wenn Versionen unresolved sind, Java/Gradle fehlt oder versehentlich falsche Mappings genutzt werden.

### Build schlägt mit `No matching variant of net.fabricmc:fabric-loom` fehl

Dann passt die Gradle-Version nicht zur von Loom geforderten Gradle Plugin API. Der frühere Fehler kam genau daher: Fabric Loom 1.17 wurde geladen, der Runner nutzte aber noch Gradle 8.14.3. Der Workflow setzt deshalb auf Gradle `9.5.0`.

### Build schlägt mit `GameVersion.getName()` oder `selectedSlot has private access` fehl

Dieser Fehler wurde in v0.60 behoben. Der Client-Code nutzt eine feste Zielversion für das Event-Feld `minecraftVersion` und liest den Hotbar-Slot über einen sicheren Resolver statt über das private Feld.

### Release existiert bereits

Der Workflow lädt das neue `.jar` mit `--clobber` erneut hoch. Release Notes werden dabei nicht überschrieben.

### Release-Tag hat falsches Format

Der Release-Workflow akzeptiert nur Alpha-Tags wie:

```text
v0.63.0-alpha
```
