# v0.58 Fabric Mod Prototype

## Ziel

Die erste echte Integrationskette vorbereiten, ohne zu behaupten, dass vollständige Match-Erkennung schon existiert.

```text
Minecraft Java Edition 1.21.11
→ Fabric Client Mod Prototype
→ Local Bridge
→ BlockCoach Web-App
```

## Prototype location

```text
fabric-mod/blockcoach-client/
```

## Was er sendet

- `minecraft_connected`
- `server_joined`
- `health_changed`
- `hotbar_changed`
- `item_used`
- `player_death`
- `session_tick`

## Was er nicht macht

- kein Auto-Aim
- kein Auto-Klicken
- keine Kamera-Kontrolle
- keine Gegner-Markierung
- kein Cloud-Upload
- kein Win/Loss-Parser yet
- keine vollständige Fight-Analyse yet

## Local bridge requirement

Run the bridge before running Minecraft:

```zsh
npm run bridge
```

Default endpoint used by the mod:

```text
http://127.0.0.1:4317/events
```

Override endpoint for development:

```text
-Dblockcoach.bridge=http://127.0.0.1:4317/events
```

## Mapping note

The source uses Yarn names. Build must therefore use Yarn mappings:

```gradle
mappings "net.fabricmc:yarn:${project.yarn_mappings}:v2"
```

Run this before the first real build:

```zsh
npm run fabric:resolve -- --write
npm run fabric:preflight
npm run fabric:build
```
