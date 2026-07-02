# BlockCoach Bridge Contract v1

**Contract:** `blockcoach.bridge.v1`  
**Target:** Minecraft Java Edition + Fabric Client Mod + Local Bridge + BlockCoach Web-App

## Purpose

The web app cannot read Minecraft directly. The Fabric mod sends safe client-side gameplay events to a local bridge. The bridge forwards them to the web app. The app must never pretend to be live-connected without receiving bridge events.

## Architecture

```text
Minecraft Java Edition
→ Fabric Client Mod Prototype
→ HTTP POST http://127.0.0.1:4317/events
→ Local Bridge
→ WebSocket ws://localhost:4317/events
→ BlockCoach Web-App
```

## Local endpoints

### Bridge health

```text
GET http://127.0.0.1:4317/health
```

### Mod-to-bridge event input

```text
POST http://127.0.0.1:4317/events
Content-Type: application/json
```

### Browser WebSocket endpoint

```text
ws://localhost:4317/events
```

### Recent event debug endpoint

```text
GET http://127.0.0.1:4317/events/recent
```

## Browser dev API

The web app also exposes a browser-side test/dev API once loaded:

```js
window.BlockCoachBridge.receive({ type: 'minecraft_connected', playerName: 'Vince' })
window.BlockCoachBridge.status('server_detected', { server: 'PvPClub' })
window.dispatchEvent(new CustomEvent('blockcoach:bridge-event', { detail: { type: 'fight_result', result: 'win' } }))
```

This API is an input channel for local tests. It does not create fake live data by itself.

## Status events

```json
{ "type": "bridge_status", "status": "bridge_detected" }
{ "type": "minecraft_connected", "playerName": "Vince", "minecraftVersion": "1.21" }
{ "type": "server_joined", "server": "PvPClub" }
```

Supported status values:

- `not_connected`
- `checking`
- `bridge_detected`
- `minecraft_connected`
- `server_detected`
- `error`

## Gameplay events

### Fight result

Only mapped into the active Daily Quest when a quest is running.

```json
{ "type": "fight_result", "result": "win" }
{ "type": "fight_result", "result": "loss" }
{ "type": "fight_result", "result": "training" }
```

### Death

Mapped as a loss only when a quest is active.

```json
{ "type": "player_death", "cause": "client_health_zero", "health": 0 }
```

### Bonus Challenge progress

```json
{ "type": "challenge_success", "label": "Clean reset" }
```

### Coaching signals

These are stored in the live inbox first. Later versions can derive skill insights from them.

```json
{ "type": "health_changed", "health": 8, "maxHealth": 20 }
{ "type": "hotbar_changed", "slot": 3, "item": "golden_apple" }
{ "type": "item_used", "item": "bow" }
{ "type": "chat_message", "text": "You won the duel!" }
{ "type": "session_tick", "playTimeSeconds": 420 }
```

## Mapping rule

Bridge events are not automatically trusted as completed quests.

- If no Daily Quest is active, fight/death/challenge events go to the inbox only.
- If a Daily Quest is active, safe events become the same internal `GameEvents` as manual clicks.
- Quest completion still needs the normal app flow.
- Manual input remains available as a backup.

## Anti-cheat boundary

BlockCoach reads and analyzes. It must not aim, click, fight, mark enemies, automate camera movement, or automate gameplay.
