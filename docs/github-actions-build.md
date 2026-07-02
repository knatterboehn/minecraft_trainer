# v0.60 GitHub Actions Build

## Ziel

BlockCoach soll automatisch in GitHub getestet und als Fabric-Mod gebaut werden. Die Pipeline bleibt in drei Jobs getrennt; v0.60 ergänzt zusätzlich den ersten Minecraft-1.21.11-Compile-Fix im Fabric-Client-Code.

```text
Push nach main
→ Web app checks
→ Browser E2E checks
→ Fabric client JAR
→ .jar als GitHub Actions Artifact
```

## Workflow

```text
.github/workflows/fabric-build.yml
```

Der Workflow läuft bei:

- Push auf `main`
- Pull Request
- manuellem Start über `workflow_dispatch`

## Jobs

### 1. Web app checks

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

Der Browser-E2E-Test läuft absichtlich nicht mehr in diesem Job. Dadurch ist sofort sichtbar, ob ein Fehler aus der App-Logik oder aus der Browser-Umgebung kommt.

### 2. Browser E2E checks

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

### 3. Fabric client JAR

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

## Ergebnis

Nach erfolgreichem Build wird hochgeladen:

```text
blockcoach-client-0.60.0-minecraft-1.21.11
```

Der eigentliche `.jar` liegt im Artifact aus:

```text
fabric-mod/blockcoach-client/build/libs/*.jar
```

Der erwartete spätere Dateiname ist:

```text
blockcoach-client-0.60.0+1.21.11.jar
```

## Warum noch kein automatischer GitHub Release?

v0.60 baut bewusst erstmal nur ein Workflow-Artefakt. Ein öffentlicher GitHub Release sollte erst erstellt werden, wenn:

1. der Workflow erfolgreich durchläuft,
2. das `.jar` lokal in Minecraft 1.21.11 startet,
3. die Bridge echte Events empfängt,
4. keine Fair-Play- oder Privacy-Grenze verletzt wird.

## Bedienung in GitHub

1. Repository öffnen.
2. Tab **Actions** öffnen.
3. Workflow **BlockCoach Fabric Build** wählen.
4. Entweder auf einen Push warten oder **Run workflow** klicken.
5. Bei Fehlern den betroffenen Job öffnen:
   - **Web app checks** = App-/Node-Testproblem
   - **Browser E2E checks** = Headless-Chrome-/UI-Testproblem
   - **Fabric client JAR** = Fabric-/Gradle-/Mod-Buildproblem
6. Nach erfolgreichem Lauf das `.jar`-Artifact herunterladen.

## Troubleshooting

### Web app checks schlagen fehl

Dann liegt der Fehler nicht im Browser, sondern in Syntax, Domain-Logik, Bridge-Tests, Release-Dokumenten oder Workflow-Konsistenz. Den Schritt **Run web checks and core tests** öffnen und die erste Fehlermeldung kopieren.

### Browser E2E checks schlagen fehl

Den Schritt **Show browser environment** und danach **Run browser E2E test** öffnen. Screenshots werden zusätzlich als `blockcoach-e2e-screens` hochgeladen.

### Fabric Resolver schlägt fehl

Fabric hat dann wahrscheinlich für `1.21.11` noch kein passendes Loader-, Yarn- oder Fabric-API-Artefakt geliefert oder der Runner hatte kurzzeitig kein Netzwerk.

### Preflight schlägt fehl

Der Preflight stoppt absichtlich, wenn Versionen unresolved sind, Java/Gradle fehlt oder versehentlich falsche Mappings genutzt werden.

### Build schlägt mit `No matching variant of net.fabricmc:fabric-loom` fehl

Dann passt die Gradle-Version nicht zur von Loom geforderten Gradle Plugin API. Der v0.58-Fehler kam genau daher: Fabric Loom 1.17 wurde geladen, der Runner nutzte aber noch Gradle 8.14.3. v0.60 setzt den Workflow deshalb auf Gradle `9.5.0`.

Wenn dieser Fehler erneut auftaucht, im Workflow prüfen, ob der Step **Set up Gradle** wirklich `gradle-version: 9.5.0` nutzt.

### Build schlägt mit `GameVersion.getName()` oder `selectedSlot has private access` fehl

Dieser Fehler wurde in v0.60 behoben. Der Client-Code nutzt jetzt eine feste Zielversion für das Event-Feld `minecraftVersion` und liest den Hotbar-Slot über einen sicheren Resolver statt über das private Feld.

### Build schlägt danach weiter fehl

Dann ist der nächste Java-/Fabric-Kompatibilitätstest erreicht. Die Ursache liegt meistens in:

- weiteren veränderten Yarn-Namen,
- geänderten Fabric API Events,
- einer nicht kompatiblen Fabric API Version,
- oder Java-Code, der gegen 1.21.11 angepasst werden muss.
