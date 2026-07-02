# CurseForge Release Draft - BlockCoach

## Project metadata

```text
Project name: BlockCoach
Game: Minecraft
Game version: 1.21.11
Mod loader: Fabric
Project type: Mod
Release type: Alpha
Environment: Client
License: MIT
```

Suggested categories:

```text
Utility & QoL
Miscellaneous
```

Required relation:

```text
Fabric API
```

## Summary

```text
Level up your fights with a gamified local coaching dashboard for Minecraft Java PvP training.
```

## Description draft

```markdown
# BlockCoach

**Level up your fights.**

BlockCoach is a gamified coaching mod for Minecraft Java Edition and Fabric. It connects safe gameplay events from Minecraft to a local BlockCoach dashboard so players can complete Daily Quests, track fights, earn XP, keep streaks, and learn from their training.

## Features

- Local Minecraft-to-dashboard connection
- Daily Quests for training structure
- Fight Log for wins, losses, and training fights
- XP, streaks, and bonus challenges
- Safe event transport through `localhost`
- Manual fallback when no bridge or mod is running

## Alpha scope

This release is focused on proving the integration chain:

Minecraft Java 1.21.11 → Fabric Client Mod → Local Bridge → BlockCoach Web App

Current events include connection status, server join, health changes, hotbar changes, item-use signals, death signals, and session ticks.

## Fair play

BlockCoach does not aim, click, attack, move the camera, mark enemies, expose hidden information, or automate gameplay. It is a training and review tool.

## Privacy

The current prototype sends events only to the local bridge on the user's own machine. It does not upload gameplay events to a cloud service by default.

## Requirements

- Minecraft Java Edition 1.21.11
- Fabric Loader
- Fabric API if required by the final build
- BlockCoach Local Bridge
- BlockCoach dashboard

## Disclaimer

BlockCoach is not officially affiliated with Minecraft, Mojang, or Microsoft.
```

## File upload draft

```text
Display name: BlockCoach Client 0.56.0 Alpha for Minecraft 1.21.11
File name: blockcoach-client-0.56.0+1.21.11.jar
Release type: Alpha
Game version: 1.21.11
Mod loader: Fabric
Dependencies: Fabric API
```

## Changelog draft

```markdown
Initial alpha release preparation.

- Adds BlockCoach Fabric client prototype metadata
- Targets Minecraft Java 1.21.11
- Sends safe local events to the BlockCoach Local Bridge
- Keeps manual tracking as fallback
- Adds privacy and fair-play boundaries
- No combat automation, camera automation, enemy marking, or cloud upload by default
```

## Pre-submit checklist

- [ ] Real `.jar` built and tested
- [ ] File metadata uses Minecraft `1.21.11`
- [ ] Fabric dependency set correctly
- [ ] Description includes privacy and fair-play boundaries
- [ ] Screenshots added
- [ ] Icon added
- [ ] Release marked alpha
- [ ] Install guide linked from project description
