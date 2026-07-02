# BlockCoach Client 0.63.0 Alpha

**Level up your fights.**

This is an alpha release of the BlockCoach Fabric client for Minecraft Java `1.21.11`.

## What works

- Fabric client `.jar` is built by GitHub Actions.
- Minecraft start menu shows a `BlockCoach` entry when the mod is installed.
- The `BlockCoach` menu entry opens a lightweight in-game status screen.
- Minecraft account name is sent via `minecraft_connected`.
- Joined server is sent via `server_joined` and can prefill the web profile.
- Client-side events are sent only to the local BlockCoach bridge.
- Supported prototype events:
  - `minecraft_connected`
  - `server_joined`
  - `health_changed`
  - `hotbar_changed`
  - `item_used`
  - `player_death`
  - `session_tick`
- The BlockCoach web app remains usable in manual mode when the bridge is not running.

## What this alpha does not do yet

- No full match detection.
- No server-specific Win/Loss parser.
- No scoreboard parser.
- No cloud sync.
- No auto-aim, auto-click, camera control, enemy marking, or gameplay automation.

## Requirements

- Minecraft Java Edition `1.21.11`
- Fabric Loader for `1.21.11`
- Fabric API, if required by the resolved build
- BlockCoach Local Bridge
- BlockCoach Web App

## Install

See `INSTALL_MOD.md`.

## Privacy and fair play

See `PRIVACY.md` and `FAIR_PLAY.md`.

BlockCoach is not officially affiliated with Minecraft, Mojang, or Microsoft.
