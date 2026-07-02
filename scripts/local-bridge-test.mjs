import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import net from 'node:net';

const PORT = 4318;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(retries = 60) {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      const body = await response.json();
      if (response.ok && body.ok) return body;
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw lastError || new Error('Local bridge health check failed');
}

function decodeServerFrame(buffer) {
  if (buffer.length < 2) return null;
  const opcode = buffer[0] & 0x0f;
  if (opcode !== 1) return null;
  let offset = 2;
  let length = buffer[1] & 0x7f;
  if (length === 126) {
    if (buffer.length < 4) return null;
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    if (buffer.length < 10) return null;
    length = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }
  if (buffer.length < offset + length) return null;
  return {
    payload: JSON.parse(buffer.subarray(offset, offset + length).toString('utf8')),
    rest: buffer.subarray(offset + length)
  };
}

function connectWebSocket() {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: '127.0.0.1', port: PORT });
    const key = randomBytes(16).toString('base64');
    const expectedAccept = createHash('sha1').update(`${key}${WS_GUID}`).digest('base64');
    let buffer = Buffer.alloc(0);
    const messages = [];

    socket.once('connect', () => {
      socket.write([
        'GET /events HTTP/1.1',
        `Host: 127.0.0.1:${PORT}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '',
        ''
      ].join('\r\n'));
    });

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (!socket.ready && headerEnd !== -1) {
        const header = buffer.subarray(0, headerEnd).toString('utf8');
        assert.match(header, /101 Switching Protocols/);
        assert.match(header, new RegExp(expectedAccept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        socket.ready = true;
        buffer = buffer.subarray(headerEnd + 4);
        resolve({ socket, messages, readMessages: () => messages.slice() });
      }

      while (socket.ready) {
        const decoded = decodeServerFrame(buffer);
        if (!decoded) break;
        messages.push(decoded.payload);
        buffer = decoded.rest;
      }
    });

    socket.once('error', reject);
  });
}

async function postEvent(event) {
  const response = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
  const body = await response.json();
  assert.equal(response.ok, true, JSON.stringify(body));
  return body;
}

const bridge = spawn(process.execPath, ['tools/local-bridge/server.mjs', '--port', String(PORT), '--quiet'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

try {
  const health = await waitForHealth();
  assert.equal(health.service, 'blockcoach-local-bridge');

  const ws = await connectWebSocket();
  await sleep(100);
  assert.ok(ws.readMessages().some((event) => event.type === 'bridge_status'));

  await postEvent({ type: 'minecraft_connected', playerName: 'Vince', minecraftVersion: '1.21.11' });
  await postEvent({ type: 'server_joined', server: 'PvPClub' });
  await postEvent({ type: 'fight_result', result: 'win' });
  await sleep(150);

  const types = ws.readMessages().map((event) => event.type);
  assert.ok(types.includes('minecraft_connected'));
  assert.ok(types.includes('server_joined'));
  assert.ok(types.includes('fight_result'));

  const recent = await fetch(`${BASE_URL}/events/recent`).then((response) => response.json());
  assert.equal(recent.ok, true);
  assert.ok(recent.events.length >= 3);

  ws.socket.destroy();
  console.log('Local bridge test passed: HTTP health, WebSocket client, POST event ingestion and browser broadcast are consistent.');
} finally {
  bridge.kill('SIGTERM');
}
