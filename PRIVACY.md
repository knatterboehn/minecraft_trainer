# BlockCoach Privacy Notes

BlockCoach is designed as a local coaching tool for Minecraft Java Edition.

## Core rule

**Gameplay events stay local by default.**

The Fabric client mod sends safe gameplay events to the local BlockCoach bridge:

```text
http://127.0.0.1:4317/events
```

The public web app or local web app then reads those local bridge events through:

```text
ws://localhost:4317/events
```

## What BlockCoach may process locally

Depending on the prototype version, BlockCoach may process:

- Minecraft connection status
- Minecraft version
- server name
- health changes
- hotbar slot changes
- item-use signals
- player-death signals
- session tick / play-time signals
- later: server-specific chat or scoreboard text if explicitly implemented for match detection

## What BlockCoach does not collect

BlockCoach does not intentionally collect:

- Minecraft account password
- Microsoft account password
- payment data
- email inbox data
- private files
- browser cookies
- authentication tokens
- full system scans

## Cloud policy

The current prototype is **localhost-only**.

- No default cloud endpoint
- No central analytics backend
- No automatic upload of fight data to a remote server
- No public sharing of chat messages or gameplay events

If a future version adds optional cloud sync, it must be opt-in and documented before release.

## Local app storage

The web app stores local progress in the browser under one localStorage key:

```text
minecraftTrainerApp
```

The key is intentionally kept for backwards compatibility so older local data is not lost during the BlockCoach rename.

## User control

Users can use BlockCoach manually without the Fabric mod. Users can also stop live integration at any time by closing the Local Bridge or removing the mod from the Minecraft mods folder.

## Disclaimer

BlockCoach is not officially affiliated with Minecraft, Mojang, or Microsoft.
