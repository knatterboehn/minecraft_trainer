# Install BlockCoach Fabric Mod

Target version:

```text
Minecraft Java Edition 1.21.11
Fabric Loader
BlockCoach Client 0.63.0 alpha
```

## Current status

The Fabric client now builds successfully in GitHub Actions, and v0.63 adds automated GitHub alpha release creation.

Expected release artifact:

```text
blockcoach-client-0.63.0+1.21.11.jar
```

## Install for alpha testers

1. Install Minecraft Java Edition `1.21.11`.
2. Install Fabric Loader for Minecraft `1.21.11`.
3. Install Fabric API if the release requires it.
4. Download the BlockCoach `.jar` from the GitHub Alpha Release.
5. Put the `.jar` into the Minecraft `mods` folder of the Fabric profile.
6. Start the Local Bridge from the BlockCoach project:

```zsh
npm run bridge
```

7. Open the BlockCoach web app.
8. Start Minecraft with the Fabric profile.
9. Join a server or world.
10. Check whether BlockCoach shows a live connection.

Use `docs/alpha-test-checklist.md` for the full alpha test flow.

## Local bridge

The Fabric mod sends events only to:

```text
http://127.0.0.1:4317/events
```

The web app listens to:

```text
ws://localhost:4317/events
```

If the bridge is not running, the mod should fail safely and the web app remains usable in manual mode.

## Uninstall

1. Close Minecraft.
2. Remove the BlockCoach `.jar` from the `mods` folder.
3. Stop the Local Bridge.
4. The web app can still be used manually.

## Troubleshooting

### BlockCoach says `Nicht verbunden`

- Start the Local Bridge with `npm run bridge`.
- Reload the web app.
- Restart Minecraft with the Fabric profile.

### Minecraft does not start

- Check that Minecraft version, Fabric Loader, Fabric API, and BlockCoach target the same Minecraft version.
- For this alpha target, that is `1.21.11`.

### No server name appears

- Join a multiplayer server.
- The prototype can only send a server event after Minecraft reports a connection.

## Safety

BlockCoach does not aim, click, fight, move the camera, mark opponents, or automate gameplay. It reads safe local signals for training feedback.
