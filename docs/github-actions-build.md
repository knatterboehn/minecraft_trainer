# v0.57 GitHub Actions Build

## Ziel

BlockCoach soll nicht nur lokal, sondern auch automatisch in GitHub gebaut werden. Dadurch kann die Fabric-Mod später als `.jar` aus einem Workflow-Artefakt oder einem GitHub Release verteilt werden.

```text
Push nach main
→ Web-App Tests
→ Fabric-Versionen auflösen
→ Preflight
→ Gradle Build
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

Das prüft:

- JavaScript-Syntax
- Smoke Test
- Regression Test
- Bridge Integration
- Local Bridge
- Fabric Prototype Structure
- Release Preparation
- GitHub Actions Workflow
- E2E User Flow

### 2. Fabric client JAR

```zsh
npm run fabric:resolve
npm run fabric:preflight
npm run fabric:build
```

Der Job nutzt:

- Node.js `22`
- Java `21`
- Gradle `8.14.3`
- Minecraft Java `1.21.11`
- Yarn Mappings
- Fabric Loader
- Fabric API

## Ergebnis

Nach erfolgreichem Build wird hochgeladen:

```text
blockcoach-client-0.57.0-minecraft-1.21.11
```

Der eigentliche `.jar` liegt im Artifact aus:

```text
fabric-mod/blockcoach-client/build/libs/*.jar
```

Der erwartete spätere Dateiname ist:

```text
blockcoach-client-0.57.0+1.21.11.jar
```

## Warum noch kein automatischer GitHub Release?

v0.57 baut bewusst erstmal nur ein Workflow-Artefakt. Ein öffentlicher GitHub Release sollte erst erstellt werden, wenn:

1. der Workflow erfolgreich durchläuft,
2. das `.jar` lokal in Minecraft 1.21.11 startet,
3. die Bridge echte Events empfängt,
4. keine Fair-Play- oder Privacy-Grenze verletzt wird.

## Bedienung in GitHub

1. Repository öffnen.
2. Tab **Actions** öffnen.
3. Workflow **BlockCoach Fabric Build** wählen.
4. Entweder auf einen Push warten oder **Run workflow** klicken.
5. Nach erfolgreichem Lauf das Artifact herunterladen.

## Troubleshooting

### Fabric Resolver schlägt fehl

Fabric hat dann wahrscheinlich für `1.21.11` noch kein passendes Loader-, Yarn- oder Fabric-API-Artefakt geliefert oder der Runner hatte kurzzeitig kein Netzwerk.

### Preflight schlägt fehl

Der Preflight stoppt absichtlich, wenn Versionen unresolved sind, Java/Gradle fehlt oder versehentlich falsche Mappings genutzt werden.

### Build schlägt fehl

Dann ist der erste echte Kompatibilitätstest erreicht. Die Ursache liegt meistens in:

- veränderten Yarn-Namen,
- geänderten Fabric API Events,
- einer nicht kompatiblen Fabric API Version,
- oder Java-Code, der gegen 1.21.11 angepasst werden muss.
