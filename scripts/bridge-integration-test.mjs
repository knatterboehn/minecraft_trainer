import assert from 'node:assert/strict';
import { createDefaultApp, STORAGE_KEY } from '../src/state/defaults.js';
import { createEvent, EVENT_TYPES, applyGameEvent } from '../src/domain/gameEvents.js';
import {
  BRIDGE_CONTRACT_VERSION,
  BRIDGE_STATUS,
  BRIDGE_EVENT_TYPES,
  createDefaultBridgeState,
  getBridgeStatus,
  ingestBridgeEvent,
  normalizeBridgeState
} from '../src/integrations/minecraftBridgeAdapter.js';
import { renderApp } from '../src/ui/render.js';

// Render helpers need a small document stub.
global.document = { body: { dataset: {} } };

assert.equal(STORAGE_KEY, 'minecraftTrainerApp');

const defaultBridge = createDefaultBridgeState();
assert.equal(defaultBridge.contract, BRIDGE_CONTRACT_VERSION);
assert.equal(defaultBridge.status, BRIDGE_STATUS.NOT_CONNECTED);
assert.equal(getBridgeStatus({ integrations: { minecraftBridge: defaultBridge } }).label, 'Nicht verbunden');

const normalized = normalizeBridgeState({
  status: 'bad',
  inbox: [{ type: 'fight_result', label: 'Win', detail: 'Test', createdAt: 'bad-date' }],
  counters: { received: -1, mapped: 2, ignored: 3 }
});
assert.equal(normalized.status, BRIDGE_STATUS.NOT_CONNECTED);
assert.equal(normalized.counters.received, 0);
assert.equal(normalized.inbox.length, 1);

const app = createDefaultApp();
app.user.name = '';
app.ui.screen = 'dashboard';

let mapped = ingestBridgeEvent(app, { type: BRIDGE_EVENT_TYPES.MINECRAFT_CONNECTED, playerName: 'VinceMC', minecraftVersion: '1.21.11' });
assert.equal(mapped.length, 0);
assert.equal(app.integrations.minecraftBridge.status, BRIDGE_STATUS.MINECRAFT_CONNECTED);
assert.equal(app.integrations.minecraftBridge.playerName, 'VinceMC');
assert.equal(app.user.name, 'VinceMC');
assert.match(getBridgeStatus(app).detail, /Minecraft läuft/);

mapped = ingestBridgeEvent(app, { type: BRIDGE_EVENT_TYPES.SERVER_JOINED, server: 'play.pvpclub.example' });
assert.equal(mapped.length, 0);
assert.equal(app.integrations.minecraftBridge.status, BRIDGE_STATUS.SERVER_DETECTED);
assert.equal(app.integrations.minecraftBridge.server, 'play.pvpclub.example');
assert.equal(app.user.server, 'play.pvpclub.example');

// Without an active quest, live fight events stay in the inbox and do not mutate quest progress.
mapped = ingestBridgeEvent(app, { type: BRIDGE_EVENT_TYPES.FIGHT_RESULT, result: 'win' });
assert.equal(mapped.length, 0);
assert.equal(app.todayTraining.activeSession, null);
assert.equal(app.integrations.minecraftBridge.inbox[0].mapped, false);
assert.match(app.integrations.minecraftBridge.inbox[0].detail, /Quest ist nicht aktiv/);

// With an active quest, bridge events become the same GameEvents as manual clicks.
applyGameEvent(app, createEvent(EVENT_TYPES.QUEST_STARTED, { source: 'test' }));
mapped = ingestBridgeEvent(app, { type: BRIDGE_EVENT_TYPES.FIGHT_RESULT, result: 'win' });
assert.equal(mapped.length, 1);
assert.equal(mapped[0].type, EVENT_TYPES.FIGHT_WIN);
for (const event of mapped) applyGameEvent(app, event);
assert.equal(app.todayTraining.activeSession.fights, 1);
assert.equal(app.todayTraining.activeSession.wins, 1);
assert.equal(app.todayTraining.activeSession.fightEvents[0].source, 'bridge');

mapped = ingestBridgeEvent(app, { type: BRIDGE_EVENT_TYPES.PLAYER_DEATH, cause: 'player' });
assert.equal(mapped.length, 1);
assert.equal(mapped[0].type, EVENT_TYPES.FIGHT_LOSS);
for (const event of mapped) applyGameEvent(app, event);
assert.equal(app.todayTraining.activeSession.losses, 1);

mapped = ingestBridgeEvent(app, { type: BRIDGE_EVENT_TYPES.CHALLENGE_SUCCESS, label: 'Clean reset' });
assert.equal(mapped.length, 1);
assert.equal(mapped[0].type, EVENT_TYPES.CHALLENGE_SUCCESS);
for (const event of mapped) applyGameEvent(app, event);
assert.equal(app.todayTraining.activeSession.challengeProgress, 1);

mapped = ingestBridgeEvent(app, { type: BRIDGE_EVENT_TYPES.HOTBAR_CHANGED, slot: 3, item: 'golden_apple' });
assert.equal(mapped.length, 0);
assert.equal(app.integrations.minecraftBridge.inbox[0].label, 'Hotbar gewechselt');

app.ui.screen = 'profile';
const html = renderApp(app);
assert.match(html, /BlockCoach Live/);
assert.match(html, /play\.pvpclub\.example/);
assert.match(html, /Hotbar gewechselt/);
assert.doesNotMatch(html, /undefined|NaN|\[object Object\]/);

console.log('Bridge integration tests passed: status states, live player/server profile sync, inbox, no fake live, and active-quest event mapping are consistent.');
