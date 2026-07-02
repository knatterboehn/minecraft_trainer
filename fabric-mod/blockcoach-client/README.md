# BlockCoach Fabric Client Prototype

This is the first Java Edition client-mod prototype for BlockCoach.

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

Then run Minecraft with Fabric in a development environment. The prototype sends:

- `minecraft_connected`
- `server_joined`
- `health_changed`
- `hotbar_changed`
- `item_used`
- `player_death`
- `session_tick`

## Version note

The Gradle properties use a Fabric example configuration for Minecraft `1.21`. Before building for Vince, update `gradle.properties` to his exact Minecraft Java version.
