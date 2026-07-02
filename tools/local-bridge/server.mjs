import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { URL } from 'node:url';

const DEFAULT_PORT = 4317;
const MAX_BODY_BYTES = 1024 * 64;
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function parseArgs(argv) {
  const result = { port: Number(process.env.BLOCKCOACH_BRIDGE_PORT || DEFAULT_PORT), quiet: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--quiet') result.quiet = true;
    if (arg === '--port') result.port = Number(argv[i + 1] || DEFAULT_PORT);
    if (arg.startsWith('--port=')) result.port = Number(arg.slice('--port='.length));
  }
  if (!Number.isInteger(result.port) || result.port < 1 || result.port > 65535) result.port = DEFAULT_PORT;
  return result;
}

const options = parseArgs(process.argv.slice(2));
const clients = new Set();
const recentEvents = [];
const stats = {
  startedAt: new Date().toISOString(),
  received: 0,
  broadcast: 0,
  clients: 0,
  lastEventAt: null
};

function log(...args) {
  if (!options.quiet) console.log('[BlockCoach Bridge]', ...args);
}

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra
  };
}

function sendJson(response, status, payload) {
  response.writeHead(status, corsHeaders({ 'Content-Type': 'application/json; charset=utf-8' }));
  response.end(JSON.stringify(payload, null, 2));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Payload too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function normalizeBridgeEvent(input) {
  const event = input && typeof input === 'object' && !Array.isArray(input) ? { ...input } : {};
  if (!event.type || typeof event.type !== 'string') event.type = 'unknown';
  if (!event.id || typeof event.id !== 'string') event.id = `bridge-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  if (!event.createdAt || typeof event.createdAt !== 'string') event.createdAt = new Date().toISOString();
  return event;
}

function encodeWebSocketMessage(payload) {
  const data = Buffer.from(JSON.stringify(payload));
  const length = data.length;
  if (length < 126) {
    return Buffer.concat([Buffer.from([0x81, length]), data]);
  }
  if (length < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
    return Buffer.concat([header, data]);
  }
  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(length), 2);
  return Buffer.concat([header, data]);
}

function sendToClient(socket, payload) {
  if (socket.destroyed) return false;
  try {
    socket.write(encodeWebSocketMessage(payload));
    return true;
  } catch {
    clients.delete(socket);
    return false;
  }
}

function broadcast(event) {
  const payload = normalizeBridgeEvent(event);
  recentEvents.unshift(payload);
  recentEvents.splice(20);
  stats.received += 1;
  stats.lastEventAt = payload.createdAt;
  let sent = 0;
  for (const client of clients) {
    if (sendToClient(client, payload)) sent += 1;
  }
  stats.broadcast += sent;
  stats.clients = clients.size;
  log('event', payload.type, 'clients', sent);
  return { event: payload, sent };
}

function handleUpgrade(request, socket) {
  const parsed = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (parsed.pathname !== '/events') {
    socket.destroy();
    return;
  }
  const key = request.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = createHash('sha1').update(`${key}${WS_GUID}`).digest('base64');
  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '',
    ''
  ].join('\r\n'));
  clients.add(socket);
  stats.clients = clients.size;
  sendToClient(socket, {
    type: 'bridge_status',
    status: 'bridge_detected',
    createdAt: new Date().toISOString(),
    payload: { clients: clients.size }
  });
  socket.on('close', () => {
    clients.delete(socket);
    stats.clients = clients.size;
  });
  socket.on('error', () => {
    clients.delete(socket);
    stats.clients = clients.size;
  });
  socket.on('data', () => {
    // The browser does not need to send data. Incoming frames are intentionally ignored.
  });
}

const server = createServer(async (request, response) => {
  const parsed = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders());
    response.end();
    return;
  }

  if (request.method === 'GET' && (parsed.pathname === '/health' || parsed.pathname === '/status')) {
    sendJson(response, 200, { ok: true, service: 'blockcoach-local-bridge', version: '0.54', ...stats, clients: clients.size });
    return;
  }

  if (request.method === 'GET' && parsed.pathname === '/events/recent') {
    sendJson(response, 200, { ok: true, events: recentEvents });
    return;
  }

  if (request.method === 'GET' && parsed.pathname === '/events') {
    sendJson(response, 200, { ok: true, endpoint: 'ws://localhost:4317/events', note: 'Use WebSocket for browser updates or POST JSON to this endpoint.' });
    return;
  }

  if (request.method === 'POST' && parsed.pathname === '/events') {
    try {
      const rawBody = await readBody(request);
      const parsedBody = rawBody ? JSON.parse(rawBody) : {};
      const { event, sent } = broadcast(parsedBody);
      sendJson(response, 202, { ok: true, sent, event });
    } catch (error) {
      sendJson(response, 400, { ok: false, error: error.message || 'Invalid bridge event' });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: 'Not found' });
});

server.on('upgrade', handleUpgrade);
server.listen(options.port, '127.0.0.1', () => {
  log(`running on http://127.0.0.1:${options.port}`);
});

function shutdown() {
  for (const client of clients) client.destroy();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
