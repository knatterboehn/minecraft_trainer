# v0.54 Fabric Build Setup - Minecraft Java 1.21.11

## Goal

Prepare the first local build/start path for the BlockCoach Fabric Client Prototype.

```text
Minecraft Java 1.21.11
→ Fabric Client Mod
→ Local Bridge http://127.0.0.1:4317/events
→ BlockCoach Web-App
```

## Current status

Prepared:

- `minecraft_version=1.21.11`
- `fabric.mod.json` depends on Minecraft `1.21.11`
- safe localhost-only bridge endpoint
- no cloud endpoint
- no auto-clicking, auto-aim, camera control, enemy marking, or gameplay automation
- local bridge and web app already tested

Open before a real Gradle build:

- `fabric_api_version` must be updated to an official Fabric API artifact for Minecraft `1.21.11`.

This is intentional. The repository should not silently build against a wrong Fabric API version.

## Local prerequisites

- Minecraft Java Edition `1.21.11`
- Java 21 or newer
- Gradle or an IDE with Gradle support
- Fabric Loader profile for Minecraft `1.21.11`
- Node.js for the local bridge and tests

## Step 1 - Start BlockCoach Web-App

Open the project in VS Code and start the app through Live Server.

## Step 2 - Start the local bridge

From the project root:

```zsh
npm run bridge
```

Expected health endpoint:

```text
http://127.0.0.1:4317/health
```

## Step 3 - Pin Fabric API for 1.21.11

Open:

```text
fabric-mod/blockcoach-client/gradle.properties
```

Current important values:

```properties
minecraft_version=1.21.11
loader_version=0.19.3
fabric_api_version=0.102.0+1.21
```

Before building, replace `fabric_api_version` with the official Fabric API version for Minecraft `1.21.11`.

The preflight checks this on purpose.

## Step 4 - Run preflight

```zsh
npm run fabric:preflight
```

If it fails, fix the listed item first. The most likely first failure is:

```text
fabric_api_version is still not pinned to a 1.21.11 artifact
```

## Step 5 - Build the mod

After preflight passes:

```zsh
npm run fabric:build
```

Expected output location:

```text
fabric-mod/blockcoach-client/build/libs/
```

## Step 6 - Install locally

Copy the built `.jar` into the Minecraft mods folder for the Fabric `1.21.11` profile.

Then start Minecraft through the Fabric profile.

## Step 7 - Verify data flow

With the bridge running, the Web-App should receive:

```json
{ "type": "minecraft_connected", "minecraftVersion": "1.21.11" }
```

Then, after joining a server:

```json
{ "type": "server_joined", "server": "..." }
```

## Safety boundary

BlockCoach is a coach, not a cheat.

The prototype must not:

- aim
- click
- fight
- move the camera
- mark enemies
- automate gameplay
- upload data to cloud endpoints

It only reads safe client-side state and sends local telemetry events to `127.0.0.1`.

## Next version

v0.55 should focus on one narrow automatic detection path:

```text
server_joined + player_death + simple chat_message parser
→ safe fight/loss inference
→ active Daily Quest progress
```

No advanced analysis before the basic event chain works in real Minecraft.
