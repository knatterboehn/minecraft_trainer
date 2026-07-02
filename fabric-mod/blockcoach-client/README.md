# BlockCoach Fabric Client Prototype

This is the first Java Edition client-mod prototype for BlockCoach, targeted at Minecraft Java `1.21.11`.

It is intentionally small and safe:

- reads client-side state only
- sends telemetry events to the local BlockCoach bridge
- does not click, aim, automate combat, mark enemies, or alter gameplay
- does not send data to a cloud endpoint

Default bridge endpoint:

```text
http://127.0.0.1:4317/events
```

Run the local bridge first from the web-app project root:

```zsh
npm run bridge
```

Then resolve the Fabric artifacts on the local machine:

```zsh
npm run fabric:resolve -- --write
npm run fabric:preflight
npm run fabric:build
```

The prototype sends:

- `minecraft_connected`
- `server_joined`
- `health_changed`
- `hotbar_changed`
- `item_used`
- `player_death`
- `session_tick`

## Version note

The source code uses Yarn-style class names such as `MinecraftClient`, `ClientTickEvents` and `ClientPlayConnectionEvents`. Therefore `build.gradle` now uses Yarn mappings, not Mojang mappings. Run `npm run fabric:resolve -- --write` to write the current official Loader, Yarn and Fabric API artifacts for Minecraft `1.21.11` into `gradle.properties`.
