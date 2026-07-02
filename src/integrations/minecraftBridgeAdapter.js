import { createEvent, EVENT_TYPES } from '../domain/gameEvents.js';

export const BRIDGE_CONTRACT_VERSION = 'blockcoach.bridge.v1';
export const DEFAULT_BRIDGE_URL = 'ws://localhost:4317/events';

export const BRIDGE_STATUS = {
  NOT_CONNECTED: 'not_connected',
  CHECKING: 'checking',
  BRIDGE_DETECTED: 'bridge_detected',
  MINECRAFT_CONNECTED: 'minecraft_connected',
  SERVER_DETECTED: 'server_detected',
  ERROR: 'error'
};

export const BRIDGE_EVENT_TYPES = {
  BRIDGE_STATUS: 'bridge_status',
  MINECRAFT_CONNECTED: 'minecraft_connected',
  SERVER_JOINED: 'server_joined',
  CHAT_MESSAGE: 'chat_message',
  PLAYER_DEATH: 'player_death',
  FIGHT_RESULT: 'fight_result',
  CHALLENGE_SUCCESS: 'challenge_success',
  REVIEW_ISSUE: 'review_issue',
  HEALTH_CHANGED: 'health_changed',
  HOTBAR_CHANGED: 'hotbar_changed',
  ITEM_USED: 'item_used',
  SESSION_TICK: 'session_tick'
};

const KNOWN_STATUSES = new Set(Object.values(BRIDGE_STATUS));
const KNOWN_EVENTS = new Set(Object.values(BRIDGE_EVENT_TYPES));
const INBOX_LIMIT = 16;

function safeString(value, fallback = '') {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeDate(value) {
  const date = typeof value === 'string' ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

function normalizeStatus(status) {
  return KNOWN_STATUSES.has(status) ? status : BRIDGE_STATUS.NOT_CONNECTED;
}

export function createDefaultBridgeState() {
  return {
    contract: BRIDGE_CONTRACT_VERSION,
    status: BRIDGE_STATUS.NOT_CONNECTED,
    url: DEFAULT_BRIDGE_URL,
    server: null,
    minecraftVersion: null,
    playerName: null,
    lastSeenAt: null,
    lastError: null,
    inbox: [],
    counters: {
      received: 0,
      mapped: 0,
      ignored: 0
    }
  };
}

export function normalizeBridgeState(input = {}) {
  const base = createDefaultBridgeState();
  const source = input && typeof input === 'object' ? input : {};
  return {
    ...base,
    contract: safeString(source.contract, BRIDGE_CONTRACT_VERSION),
    status: normalizeStatus(source.status),
    url: safeString(source.url, DEFAULT_BRIDGE_URL),
    server: safeString(source.server, '') || null,
    minecraftVersion: safeString(source.minecraftVersion, '') || null,
    playerName: safeString(source.playerName, '') || null,
    lastSeenAt: safeString(source.lastSeenAt, '') || null,
    lastError: safeString(source.lastError, '') || null,
    inbox: Array.isArray(source.inbox)
      ? source.inbox.slice(0, INBOX_LIMIT).map((entry, index) => ({
          id: safeString(entry?.id, `bridge-event-${index}`),
          type: safeString(entry?.type, 'unknown'),
          label: safeString(entry?.label, 'Unbekanntes Event'),
          detail: safeString(entry?.detail, 'Keine Details'),
          createdAt: safeDate(entry?.createdAt),
          mapped: Boolean(entry?.mapped),
          ignoredReason: safeString(entry?.ignoredReason, '') || null
        }))
      : [],
    counters: {
      received: Math.max(0, safeNumber(source.counters?.received, 0)),
      mapped: Math.max(0, safeNumber(source.counters?.mapped, 0)),
      ignored: Math.max(0, safeNumber(source.counters?.ignored, 0))
    }
  };
}

function ensureBridgeState(app) {
  if (!app.integrations || typeof app.integrations !== 'object') app.integrations = {};
  app.integrations.minecraftBridge = normalizeBridgeState(app.integrations.minecraftBridge);
  return app.integrations.minecraftBridge;
}

export function getBridgeStatus(state) {
  const bridge = normalizeBridgeState(state?.integrations?.minecraftBridge);
  const connected = [BRIDGE_STATUS.BRIDGE_DETECTED, BRIDGE_STATUS.MINECRAFT_CONNECTED, BRIDGE_STATUS.SERVER_DETECTED].includes(bridge.status);
  const statusText = {
    [BRIDGE_STATUS.NOT_CONNECTED]: 'Nicht verbunden',
    [BRIDGE_STATUS.CHECKING]: 'Bridge wird geprüft',
    [BRIDGE_STATUS.BRIDGE_DETECTED]: 'Bridge erkannt',
    [BRIDGE_STATUS.MINECRAFT_CONNECTED]: 'Minecraft verbunden',
    [BRIDGE_STATUS.SERVER_DETECTED]: 'Server erkannt',
    [BRIDGE_STATUS.ERROR]: 'Bridge nicht erreichbar'
  }[bridge.status] || 'Nicht verbunden';

  const detail = {
    [BRIDGE_STATUS.NOT_CONNECTED]: 'Manueller Modus ist aktiv. Keine Live-Daten werden vorgetäuscht.',
    [BRIDGE_STATUS.CHECKING]: `BlockCoach prüft ${bridge.url}.`,
    [BRIDGE_STATUS.BRIDGE_DETECTED]: 'Local Bridge ist erreichbar. Warte auf Minecraft-Events.',
    [BRIDGE_STATUS.MINECRAFT_CONNECTED]: `Minecraft läuft${bridge.playerName ? ` · ${bridge.playerName}` : ''}.`,
    [BRIDGE_STATUS.SERVER_DETECTED]: `Live bereit${bridge.server ? ` · Server: ${bridge.server}` : ''}.`,
    [BRIDGE_STATUS.ERROR]: bridge.lastError || 'Die Local Bridge ist nicht erreichbar. Manueller Modus bleibt aktiv.'
  }[bridge.status] || 'Manueller Modus ist aktiv.';

  return {
    ...bridge,
    connected,
    label: statusText,
    detail
  };
}

function normalizeRawBridgeEvent(rawEvent) {
  const source = rawEvent && typeof rawEvent === 'object' ? rawEvent : {};
  const type = safeString(source.type || source.eventType, 'unknown');
  const payload = source.payload && typeof source.payload === 'object' ? source.payload : source;
  return {
    id: safeString(source.id, `bridge-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    type,
    payload,
    createdAt: safeDate(source.createdAt || source.at || source.timestamp),
    source: 'bridge'
  };
}

function summarizeBridgeEvent(event, bridge, app) {
  const payload = event.payload || {};
  if (event.type === BRIDGE_EVENT_TYPES.BRIDGE_STATUS) {
    return {
      label: 'Bridge Status',
      detail: getBridgeStatus({ integrations: { minecraftBridge: bridge } }).detail
    };
  }
  if (event.type === BRIDGE_EVENT_TYPES.MINECRAFT_CONNECTED) {
    return {
      label: 'Minecraft verbunden',
      detail: `${payload.playerName || 'Spieler'}${payload.minecraftVersion ? ` · ${payload.minecraftVersion}` : ''}`
    };
  }
  if (event.type === BRIDGE_EVENT_TYPES.SERVER_JOINED) {
    return {
      label: 'Server erkannt',
      detail: safeString(payload.server || payload.serverName || payload.address, 'Server unbekannt')
    };
  }
  if (event.type === BRIDGE_EVENT_TYPES.FIGHT_RESULT) {
    const result = safeString(payload.result, 'unknown');
    const active = Boolean(app.todayTraining?.activeSession);
    return {
      label: `Fight erkannt: ${result}`,
      detail: active ? 'Wird in die aktive Quest übernommen.' : 'Quest ist nicht aktiv. Event bleibt nur in der Inbox.'
    };
  }
  if (event.type === BRIDGE_EVENT_TYPES.PLAYER_DEATH) {
    const active = Boolean(app.todayTraining?.activeSession);
    return {
      label: 'Death erkannt',
      detail: active ? 'Wird als Loss in die aktive Quest übernommen.' : 'Quest ist nicht aktiv. Kein automatischer Loss.'
    };
  }
  if (event.type === BRIDGE_EVENT_TYPES.CHALLENGE_SUCCESS) {
    return {
      label: 'Bonus-Fortschritt',
      detail: app.todayTraining?.activeSession ? 'Bonus-Erfolg wird übernommen.' : 'Quest ist nicht aktiv. Kein Bonus-Fortschritt.'
    };
  }
  if (event.type === BRIDGE_EVENT_TYPES.HEALTH_CHANGED) {
    return { label: 'Health geändert', detail: `Health: ${safeNumber(payload.health, 0)} / ${safeNumber(payload.maxHealth, 20)}` };
  }
  if (event.type === BRIDGE_EVENT_TYPES.HOTBAR_CHANGED) {
    return { label: 'Hotbar gewechselt', detail: `Slot ${safeNumber(payload.slot, 0)}${payload.item ? ` · ${payload.item}` : ''}` };
  }
  if (event.type === BRIDGE_EVENT_TYPES.ITEM_USED) {
    return { label: 'Item genutzt', detail: safeString(payload.item, 'Item unbekannt') };
  }
  if (event.type === BRIDGE_EVENT_TYPES.CHAT_MESSAGE) {
    return { label: 'Chat gelesen', detail: safeString(payload.text || payload.message, '').slice(0, 80) || 'Chat-Event' };
  }
  return {
    label: KNOWN_EVENTS.has(event.type) ? event.type : 'Unbekanntes Bridge-Event',
    detail: KNOWN_EVENTS.has(event.type) ? 'Event empfangen.' : 'Event wurde gespeichert, aber nicht verarbeitet.'
  };
}

function updateBridgeStatus(bridge, event) {
  const payload = event.payload || {};
  bridge.lastSeenAt = event.createdAt;
  bridge.lastError = null;

  if (event.type === BRIDGE_EVENT_TYPES.BRIDGE_STATUS) {
    bridge.status = normalizeStatus(payload.status);
    bridge.lastError = safeString(payload.error, '') || null;
  }

  if (event.type === BRIDGE_EVENT_TYPES.MINECRAFT_CONNECTED) {
    bridge.status = BRIDGE_STATUS.MINECRAFT_CONNECTED;
    bridge.minecraftVersion = safeString(payload.minecraftVersion || payload.version, '') || bridge.minecraftVersion;
    bridge.playerName = safeString(payload.playerName || payload.name, '') || bridge.playerName;
  }

  if (event.type === BRIDGE_EVENT_TYPES.SERVER_JOINED) {
    bridge.status = BRIDGE_STATUS.SERVER_DETECTED;
    bridge.server = safeString(payload.server || payload.serverName || payload.address, '') || bridge.server;
  }
}

function mapBridgeEventToGameEvents(app, event) {
  const active = Boolean(app.todayTraining?.activeSession);
  const payload = event.payload || {};
  const meta = { source: 'bridge', bridgeEventId: event.id };

  if (!active) return [];

  if (event.type === BRIDGE_EVENT_TYPES.FIGHT_RESULT) {
    const result = safeString(payload.result, '').toLowerCase();
    if (result === 'win') return [createEvent(EVENT_TYPES.FIGHT_WIN, meta)];
    if (result === 'loss') return [createEvent(EVENT_TYPES.FIGHT_LOSS, meta)];
    if (result === 'training') return [createEvent(EVENT_TYPES.FIGHT_TRAINING, meta)];
  }

  if (event.type === BRIDGE_EVENT_TYPES.PLAYER_DEATH) {
    return [createEvent(EVENT_TYPES.FIGHT_LOSS, meta)];
  }

  if (event.type === BRIDGE_EVENT_TYPES.CHALLENGE_SUCCESS) {
    return [createEvent(EVENT_TYPES.CHALLENGE_SUCCESS, meta)];
  }

  if (event.type === BRIDGE_EVENT_TYPES.REVIEW_ISSUE) {
    const issue = safeString(payload.issue, 'Weiß nicht');
    return [createEvent(EVENT_TYPES.REVIEW_SET, { ...meta, issue })];
  }

  return [];
}

export function ingestBridgeEvent(app, rawEvent) {
  const bridge = ensureBridgeState(app);
  const event = normalizeRawBridgeEvent(rawEvent);
  updateBridgeStatus(bridge, event);
  bridge.counters.received += 1;

  const mappedEvents = mapBridgeEventToGameEvents(app, event);
  const summary = summarizeBridgeEvent(event, bridge, app);
  const ignoredReason = mappedEvents.length ? null : (KNOWN_EVENTS.has(event.type) ? 'Nicht auf aktive Quest gemappt' : 'Unbekannter Event-Typ');

  bridge.inbox.unshift({
    id: event.id,
    type: event.type,
    label: summary.label,
    detail: summary.detail,
    createdAt: event.createdAt,
    mapped: mappedEvents.length > 0,
    ignoredReason
  });
  bridge.inbox = bridge.inbox.slice(0, INBOX_LIMIT);
  bridge.counters.mapped += mappedEvents.length;
  if (!mappedEvents.length) bridge.counters.ignored += 1;

  return mappedEvents;
}

export function connectBridge({ onEvent, onStatus, url = DEFAULT_BRIDGE_URL } = {}) {
  let socket = null;

  function emitStatus(status, extra = {}) {
    onStatus?.({ type: BRIDGE_EVENT_TYPES.BRIDGE_STATUS, status, ...extra, createdAt: new Date().toISOString() });
  }

  function handleRawEvent(raw) {
    if (!raw || typeof raw !== 'object') return;
    onEvent?.(raw);
  }

  function handleMessage(event) {
    if (!event?.data || typeof event.data !== 'object') return;
    if (event.data.source !== 'blockcoach-bridge') return;
    handleRawEvent(event.data.event || event.data);
  }

  function handleCustomEvent(event) {
    handleRawEvent(event.detail);
  }

  function exposeWindowApi() {
    if (typeof window === 'undefined') return;
    window.BlockCoachBridge = {
      contract: BRIDGE_CONTRACT_VERSION,
      receive(event) { handleRawEvent(event); },
      status(status, extra = {}) { emitStatus(status, extra); }
    };
    window.addEventListener('message', handleMessage);
    window.addEventListener('blockcoach:bridge-event', handleCustomEvent);
  }

  function check() {
    if (typeof WebSocket === 'undefined') {
      emitStatus(BRIDGE_STATUS.ERROR, { error: 'WebSocket wird in dieser Umgebung nicht unterstützt.' });
      return;
    }

    emitStatus(BRIDGE_STATUS.CHECKING);
    try {
      socket?.close();
      socket = new WebSocket(url);
      socket.addEventListener('open', () => emitStatus(BRIDGE_STATUS.BRIDGE_DETECTED));
      socket.addEventListener('message', (message) => {
        try { handleRawEvent(JSON.parse(message.data)); }
        catch { emitStatus(BRIDGE_STATUS.ERROR, { error: 'Bridge sendet ungültiges JSON.' }); }
      });
      socket.addEventListener('error', () => emitStatus(BRIDGE_STATUS.ERROR, { error: 'Keine Local Bridge auf ws://localhost:4317/events erreichbar.' }));
      socket.addEventListener('close', () => {
        if (socket) emitStatus(BRIDGE_STATUS.NOT_CONNECTED);
      });
    } catch (error) {
      emitStatus(BRIDGE_STATUS.ERROR, { error: error.message || 'Bridge-Verbindung fehlgeschlagen.' });
    }
  }

  function disconnect() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('blockcoach:bridge-event', handleCustomEvent);
    }
    socket?.close();
    socket = null;
  }

  exposeWindowApi();
  return { check, disconnect };
}
