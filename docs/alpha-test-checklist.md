# BlockCoach Alpha Test Checklist

Use this checklist only after GitHub Actions has created a green alpha release.

## Before Minecraft starts

- [ ] Download the `.jar` from the GitHub Release, not from a local build folder.
- [ ] Confirm Minecraft Java Edition is `1.21.11`.
- [ ] Confirm Fabric Loader is installed for `1.21.11`.
- [ ] Confirm Fabric API is installed if the release requires it.
- [ ] Put the BlockCoach `.jar` into the Fabric profile `mods` folder.
- [ ] Start the Local Bridge:

```zsh
npm run bridge
```

- [ ] Open the BlockCoach web app.
- [ ] Confirm the app still works in manual mode before Minecraft connects.

## In Minecraft

- [ ] Start Minecraft with the Fabric profile.
- [ ] Join a singleplayer world or multiplayer server.
- [ ] Confirm the bridge receives `minecraft_connected`.
- [ ] Confirm the bridge receives `server_joined` after joining a server.
- [ ] Switch hotbar slots and confirm a `hotbar_changed` event appears.
- [ ] Use an item and confirm an `item_used` event appears.
- [ ] Take damage and confirm a `health_changed` event appears.
- [ ] Confirm BlockCoach does not aim, click, move, mark enemies, or automate gameplay.

## In BlockCoach Web App

- [ ] Live status changes from manual/not connected to connected.
- [ ] The Profile bridge inbox shows recent events.
- [ ] Starting a Daily Quest still works.
- [ ] Manual Fight Log buttons still work as fallback.
- [ ] Quest completion still awards XP/streak correctly.

## Stop criteria

Stop the alpha test if any of these happen:

- Minecraft fails to launch with only BlockCoach and required Fabric dependencies installed.
- The mod sends data to anything other than localhost or `127.0.0.1`.
- The mod affects combat input, aiming, camera movement, or player movement.
- The web app loses existing localStorage data.
- The bridge causes repeated disconnects or severe client lag.

## Report format

```text
Minecraft version:
Fabric Loader version:
Fabric API version:
BlockCoach version:
Server/world tested:
Bridge started: yes/no
Events seen:
Problems:
Screenshot/log:
```
