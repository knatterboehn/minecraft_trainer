# Test Report v0.63 - Minecraft Menu Entry and Live Profile Sync

## Scope

v0.63 implements Vince's alpha feedback:

- show a visible `BlockCoach` entry in the Minecraft start menu when the Fabric mod is installed
- add a lightweight in-game BlockCoach status screen
- send a menu handshake to the Local Bridge
- automatically pass the Minecraft account name through `minecraft_connected`
- automatically pass the joined server through `server_joined`
- prefill/sync the BlockCoach web profile from trusted live bridge events
- keep manual mode and all gamification flows intact

## Version targets

- App version: `0.63`
- Package version: `0.63.0`
- Mod version: `0.63.0`
- Minecraft Java target: `1.21.11`
- Alpha tag target: `v0.63.0-alpha`
- Release artifact target: `blockcoach-client-0.63.0+1.21.11.jar`

## Changed areas

### Fabric client

Added:

- `BlockCoachConstants.java`
- `BlockCoachStatusScreen.java`
- `BlockCoachTitleScreenMixin.java`
- `blockcoach-client.mixins.json`

Updated:

- `BlockCoachClient.java`
- `fabric.mod.json`

Expected Minecraft behavior:

1. Minecraft starts with Fabric profile and BlockCoach installed.
2. The main/start menu shows a `BlockCoach` button.
3. The button opens a small BlockCoach status screen.
4. `Bridge testen` sends a safe local `minecraft_connected` handshake.
5. Joining a server sends `server_joined` with server address.

### Web app

Updated:

- Bridge event ingestion now syncs `playerName` into `user.name` when the profile has no name yet.
- Bridge event ingestion now syncs `server` into `user.server` when the profile is still on a default server.
- Custom server strings are preserved instead of being forced back to the fixed dropdown list.
- Onboarding/Profile dropdowns include detected custom servers as selectable options.
- Onboarding shows a short live-detected notice when bridge data is already available.

## Safety checks

Confirmed by tests and source checks:

- no auto-aim
- no auto-click
- no swing/attack automation
- no camera yaw/pitch control
- no enemy marking
- no cloud endpoint in bridge sender
- manual mode remains fallback
- existing `minecraftTrainerApp` storage key remains unchanged

## Commands run locally

```zsh
npm run check
npm run test:core
npm run ci:e2e
npm run ci:web
npm test
```

## Results

```text
Syntax check passed: 40 JavaScript files.
Smoke test passed: Quest completion, gamification loop and Progress UI are consistent.
Regression tests passed: data safety, quest loop, gamification states, render states and concept language are consistent.
Bridge integration tests passed: status states, live player/server profile sync, inbox, no fake live, and active-quest event mapping are consistent.
Local bridge test passed: HTTP health, WebSocket client, POST event ingestion and browser broadcast are consistent.
Fabric prototype test passed: client mod skeleton, Minecraft menu entry, live player/server signals, Yarn mapping setup and localhost-only bridge sender are consistent.
Release preparation test passed: public mod metadata, privacy, fair-play, install and platform release drafts are complete and consistent.
GitHub Actions test passed: CI workflow, separated browser E2E, Fabric artifact build, docs and version metadata are consistent.
Release automation test passed: alpha tag workflow, release notes, artifact naming and tester checklist are consistent.
E2E user-flow test passed: real browser clicks, onboarding, bridge event ingestion, quest loop, completion, progress, analysis, profile and mobile navigation are consistent.
```

## External verification still required

The real Fabric/Gradle build and release are expected to run in GitHub Actions, as before. This environment does not install Minecraft and cannot verify the actual in-game main-menu rendering. The structural checks cover the mixin config, Java source, no-cheat boundary and bridge profile sync behavior.

## Next GitHub step

```zsh
git add .
git commit -m "Add Minecraft menu entry and live profile sync"
git push

git tag v0.63.0-alpha
git push origin v0.63.0-alpha
```

After the workflow is green, download the release `.jar` and let Vince check:

- Minecraft start menu shows `BlockCoach`
- `Bridge testen` sends `minecraft_connected`
- server join sends `server_joined`
- BlockCoach web app shows Minecraft name and server
