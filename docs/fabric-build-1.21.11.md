# v0.59 Fabric Build Setup - Minecraft Java 1.21.11

## Ziel

Den Fabric-Prototyp so vorbereiten, dass er lokal auf Vinces Rechner gegen Minecraft Java `1.21.11` gebaut werden kann.

```text
Minecraft Java 1.21.11
→ Fabric Client Mod
→ Local Bridge http://127.0.0.1:4317/events
→ BlockCoach Web-App
```

## Warum v0.55 wichtig war

v0.54 hatte einen versteckten Build-Risikopunkt: Der Java-Code war in Yarn-Namen geschrieben, aber `build.gradle` nutzte Mojang-Mappings. Das ist für den echten Build nicht sauber.

v0.55 korrigiert das:

```gradle
mappings "net.fabricmc:yarn:${project.yarn_mappings}:v2"
```

## Status

Vorbereitet:

- `minecraft_version=1.21.11`
- `fabric.mod.json` hängt exakt an Minecraft `1.21.11`
- Yarn-Mappings statt falscher Mapping-Kombination
- Resolver für Loader, Yarn und Fabric API
- sicherer Build-Runner
- localhost-only Bridge Endpoint
- kein Cloud-Endpoint
- keine Auto-Aim-/Auto-Click-/Gameplay-Automation

Noch lokal zu erledigen:

- Fabric-Artefakte auf Vinces Rechner auflösen
- Preflight ausführen
- Gradle-Build ausführen

## Voraussetzungen lokal

- Minecraft Java Edition `1.21.11`
- Java 21 oder neuer
- Gradle `9.5.0` oder neuer oder IntelliJ/VS Code mit kompatibler Gradle-Unterstützung
- Node.js
- Internetzugriff für Fabric Meta/Fabric Maven

## Schritt 1 - Web-App starten

Öffne das Projekt in VS Code und starte die App über Live Server.

## Schritt 2 - Local Bridge starten

Im Projektroot:

```zsh
npm run bridge
```

Health Check:

```text
http://127.0.0.1:4317/health
```

## Schritt 3 - Fabric-Versionen auflösen

Dry Run:

```zsh
npm run fabric:resolve:dry
```

Schreiben in `gradle.properties`:

```zsh
npm run fabric:resolve -- --write
```

Der Resolver liest:

- Fabric Loader über Fabric Meta
- Yarn Mappings über Fabric Meta
- Fabric API über Fabric Maven metadata

Und schreibt danach:

```properties
loader_version=...
yarn_mappings=...
fabric_api_version=...
```

## Schritt 4 - Preflight

```zsh
npm run fabric:preflight
```

Der Preflight stoppt, wenn:

- `loader_version` noch `UNRESOLVED` ist
- `yarn_mappings` nicht zu `1.21.11` passt
- `fabric_api_version` nicht zu `1.21.11` passt
- Java 21 fehlt
- Gradle fehlt oder älter als `9.5.0` ist
- `build.gradle` wieder auf falsche Mappings zurückfällt

## Schritt 5 - Build

```zsh
npm run fabric:build
```

Erwarteter Output:

```text
fabric-mod/blockcoach-client/build/libs/
```

## Schritt 6 - In Minecraft testen

1. Built `.jar` in den Mods-Ordner des Fabric-Profils kopieren.
2. Bridge laufen lassen.
3. Minecraft 1.21.11 mit Fabric starten.
4. BlockCoach Web-App öffnen.
5. Erwartete Events:

```json
{ "type": "minecraft_connected", "minecraftVersion": "1.21.11" }
{ "type": "server_joined", "server": "..." }
```

## Sicherheitsgrenze

BlockCoach ist ein Coach, kein Cheat.

Der Prototype darf nicht:

- aimen
- klicken
- kämpfen
- Kamera bewegen
- Gegner markieren
- Gameplay automatisieren
- Daten an Cloud-Endpunkte senden

Er liest sichere Client-Zustände und sendet lokale Telemetrie an `127.0.0.1`.

## v0.59 Build-Fix

Der erste GitHub-Actions-Fabric-Build ist nicht am Mod-Code gescheitert, sondern an der Gradle-/Loom-Kombination:

```text
Fabric Loom 1.17.x → benötigt Gradle Plugin API 9.5.0
Runner vorher → Gradle 8.14.3
```

v0.59 setzt GitHub Actions deshalb auf Gradle `9.5.0` und der Preflight prüft Gradle `9.5.0+`.

## Nächster Schritt nach erfolgreichem Build

v0.60 kann serverabhängige Erkennung ergänzen:

```text
chat_message + scoreboard_update
→ vorsichtige Fight-/Win-/Loss-Erkennung
→ aktiver Daily-Quest-Fortschritt
```
