# Modrinth Release Draft - BlockCoach

## Project metadata

```text
Title: BlockCoach
Slug: blockcoach
Project type: Mod
Loader: Fabric
Minecraft version: 1.21.11
Side: Client required, Server unsupported
License: MIT
Release channel: Alpha
```

Recommended categories:

```text
fabric
utility
game-mechanics
management
```

Required dependency:

```text
Fabric API
```

## Short description

```text
Level up your fights with a gamified local coaching dashboard for Minecraft Java PvP training.
```

## Long description

```markdown
# BlockCoach

**Level up your fights.**

BlockCoach is a gamified Minecraft Java coaching mod for Fabric. It connects safe local gameplay events to the BlockCoach dashboard, where players can complete Daily Quests, track fights, earn XP, build streaks, and learn from their training sessions.

## What it does

- Connects Minecraft Java to the local BlockCoach dashboard
- Sends safe local gameplay signals to `127.0.0.1`
- Supports training quests, XP, streaks, bonus challenges, and fight review
- Keeps manual tracking available as a fallback
- Helps players learn from fights instead of just counting stats

## Current alpha scope

The first alpha focuses on the integration chain:

Minecraft Java 1.21.11 → Fabric Client Mod → Local Bridge → BlockCoach Web App

Current prototype event types include connection, server join, health change, hotbar change, item-use signal, death signal, and session tick.

## Fair play

BlockCoach is a coach, not a cheat client.

It does not aim, click, attack, move the camera, mark enemies, expose hidden information, or automate gameplay.

## Privacy

The prototype is localhost-only by default. It does not send gameplay events to a cloud server.

## Requirements

- Minecraft Java Edition 1.21.11
- Fabric Loader
- Fabric API, if required by the build
- Local BlockCoach Bridge
- BlockCoach dashboard

## Disclaimer

BlockCoach is not officially affiliated with Minecraft, Mojang, or Microsoft.
```

## Version upload draft

```text
Version name: BlockCoach Client 0.62.0 Alpha
Version number: 0.62.0+1.21.11
Version type: Alpha
Game versions: 1.21.11
Loaders: Fabric
Primary file: blockcoach-client-0.62.0+1.21.11.jar
```

## Changelog draft

```markdown
## 0.62.0 Alpha

Alpha release preparation for BlockCoach Client with automated GitHub Actions build support.

- Adds GitHub Actions artifact build support
- Keeps the first Fabric client prototype metadata
- Targets Minecraft Java 1.21.11
- Sends safe local events to the BlockCoach Local Bridge
- Supports localhost-only coaching telemetry
- Documents privacy, fair-play boundaries, and installation flow
- Does not automate combat, camera movement, inventory decisions, or clicks
```

## Pre-submit checklist

- [ ] Real `.jar` exists in `fabric-mod/blockcoach-client/build/libs/`
- [ ] `.jar` file name matches release metadata
- [ ] Fabric Loader version resolved
- [ ] Fabric API version resolved
- [ ] Local bridge test passes
- [ ] Manual Minecraft launch test passed on a real machine
- [ ] Privacy notes linked
- [ ] Fair Play policy linked
- [ ] Install guide linked
- [ ] Screenshots added
- [ ] Icon added
- [ ] Project starts as draft/unlisted if alpha is not ready for wide release
