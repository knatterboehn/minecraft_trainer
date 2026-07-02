# v0.54 Fabric Mod Prototype

## Goal

Prove the first real integration chain without pretending that full match detection already exists.

```text
Minecraft Java Edition
→ Fabric Client Mod Prototype
→ Local Bridge
→ BlockCoach Web-App
```

## Prototype location

```text
fabric-mod/blockcoach-client/
```

## What it sends

- `minecraft_connected`
- `server_joined`
- `health_changed`
- `hotbar_changed`
- `item_used`
- `player_death`
- `session_tick`

## What it does not do

- no auto-aim
- no auto-clicking
- no camera control
- no enemy marking
- no cloud upload
- no win/loss parser yet
- no full combat analysis yet

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

## Version note

Target version: `Minecraft Java 1.21.11`.

`gradle.properties` is pinned to `minecraft_version=1.21.11`. The remaining open build value is `fabric_api_version`: update it to an official Fabric API artifact for `1.21.11` before running a real Gradle build. Use `npm run fabric:preflight` to catch this before build time.
