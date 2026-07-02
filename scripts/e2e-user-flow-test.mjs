import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const PROJECT_ROOT = resolve(new URL('..', import.meta.url).pathname);
const STORAGE_KEY = 'minecraftTrainerApp';
const SCREENSHOT_DIR = join(PROJECT_ROOT, 'docs', 'e2e-screens');

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function toPosix(path) {
  return path.split('\\').join('/');
}

function findExecutable() {
  if (process.env.E2E_CHROME_PATH && existsSync(process.env.E2E_CHROME_PATH)) return process.env.E2E_CHROME_PATH;

  const directCandidates = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const candidate of directCandidates) {
    if (existsSync(candidate)) return candidate;
  }

  for (const command of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'chrome', 'msedge']) {
    const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', [command], { encoding: 'utf8' });
    const first = result.stdout?.split(/\r?\n/).find(Boolean);
    if (result.status === 0 && first) return first;
  }

  throw new Error('Kein Chrome/Chromium gefunden. Setze E2E_CHROME_PATH auf den Browser-Pfad.');
}

async function fetchJsonWithRetry(url, label, retries = 80) {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`${label}: HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw lastError || new Error(`${label}: keine Antwort`);
}

class CDPClient {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.runtimeExceptions = [];
    this.logErrors = [];
  }

  async connect() {
    this.ws = new WebSocket(this.webSocketUrl);
    await new Promise((resolvePromise, reject) => {
      this.ws.addEventListener('open', resolvePromise, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });

    this.ws.addEventListener('message', (message) => {
      const data = typeof message.data === 'string' ? message.data : Buffer.from(message.data).toString('utf8');
      const payload = JSON.parse(data);
      if (payload.id && this.pending.has(payload.id)) {
        const { resolve: resolvePromise, reject } = this.pending.get(payload.id);
        this.pending.delete(payload.id);
        if (payload.error) reject(new Error(`${payload.error.message}: ${payload.error.data || ''}`));
        else resolvePromise(payload.result || {});
        return;
      }

      if (payload.method === 'Runtime.exceptionThrown') {
        const detail = payload.params.exceptionDetails?.exception?.description || payload.params.exceptionDetails?.text || 'Runtime exception';
        this.runtimeExceptions.push(detail);
      }
      if (payload.method === 'Log.entryAdded' && payload.params.entry?.level === 'error') {
        this.logErrors.push(payload.params.entry.text);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { resolve: resolvePromise, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 8000);
    });
  }

  async close() {
    this.ws?.close();
  }
}

async function connectToPage(debugPort) {
  const targets = await fetchJsonWithRetry(`http://127.0.0.1:${debugPort}/json/list`, 'CDP targets');
  const target = targets.find((item) => item.type === 'page' && item.webSocketDebuggerUrl) || targets[0];
  if (!target?.webSocketDebuggerUrl) throw new Error('Keine Chrome-Page für CDP gefunden.');

  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Log.enable');
  return client;
}

async function evalJs(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });
  if (result.exceptionDetails) {
    const details = result.exceptionDetails.exception?.description || result.exceptionDetails.exception?.value || result.exceptionDetails.text || 'Runtime.evaluate exception';
    throw new Error(String(details));
  }
  return result.result?.value;
}

async function waitForCondition(client, expression, label, retries = 80) {
  for (let i = 0; i < retries; i += 1) {
    const ok = await evalJs(client, `Boolean(${expression})`);
    if (ok) return;
    await sleep(100);
  }
  throw new Error(`Timeout: ${label}`);
}

async function waitForText(client, text, label = text) {
  const needle = String(text).toLocaleLowerCase('de-DE');
  await waitForCondition(
    client,
    `document.body && document.body.innerText.toLocaleLowerCase('de-DE').includes(${JSON.stringify(needle)})`,
    label
  );
}

async function click(client, selector, label = selector) {
  const rect = await evalJs(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height, disabled: Boolean(el.disabled) };
  })()`);

  assert.ok(rect, `Element nicht gefunden: ${label}`);
  assert.equal(rect.disabled, false, `Element ist disabled: ${label}`);

  await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y });
  await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await sleep(120);
}


async function clickUntil(client, selector, conditionExpression, label, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await click(client, selector, `${label} Versuch ${attempt}`);
      await waitForCondition(client, conditionExpression, label, 12);
      return;
    } catch (error) {
      lastError = error;
      await sleep(180);
    }
  }
  throw lastError || new Error(`Klickbedingung nicht erreicht: ${label}`);
}

async function typeInto(client, selector, text, label = selector) {
  await click(client, selector, label);
  const focused = await evalJs(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.focus();
    el.value = '';
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
    return document.activeElement === el;
  })()`);
  assert.equal(focused, true, `Eingabefeld konnte nicht fokussiert werden: ${label}`);
  await client.send('Input.insertText', { text });
  await sleep(80);
}

async function setSelect(client, selector, value, label = selector) {
  const ok = await evalJs(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.value = ${JSON.stringify(value)};
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return el.value === ${JSON.stringify(value)};
  })()`);
  assert.equal(ok, true, `Select konnte nicht gesetzt werden: ${label}`);
  await sleep(80);
}

async function appState(client) {
  return evalJs(client, `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`);
}

async function assertBodyHas(client, texts, label) {
  const body = await evalJs(client, 'document.body.innerText');
  const searchable = body.toLocaleLowerCase('de-DE');
  for (const text of texts) {
    assert.ok(searchable.includes(String(text).toLocaleLowerCase('de-DE')), `${label}: Text fehlt: ${text}`);
  }
  assert.doesNotMatch(body, /undefined|NaN|\[object Object\]/, `${label}: ungültiger sichtbarer Text`);
}

async function screenshot(client, name) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const result = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(join(SCREENSHOT_DIR, `${name}.png`), Buffer.from(result.data, 'base64'));
}

function collectSources(dir, out = {}) {
  for (const entry of readdirSync(dir)) {
    const absolute = join(dir, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) collectSources(absolute, out);
    if (stat.isFile() && absolute.endsWith('.js')) {
      const key = toPosix(relative(PROJECT_ROOT, absolute));
      out[key] = readFileSync(absolute, 'utf8');
    }
  }
  return out;
}

function assetDataUrls() {
  const assetsDir = join(PROJECT_ROOT, 'assets');
  const urls = {};
  for (const entry of readdirSync(assetsDir)) {
    if (!entry.endsWith('.svg')) continue;
    const raw = readFileSync(join(assetsDir, entry));
    urls[`./assets/${entry}`] = `data:image/svg+xml;base64,${raw.toString('base64')}`;
  }
  return urls;
}

async function loadAppInBlankPage(client) {
  const css = readFileSync(join(PROJECT_ROOT, 'styles', 'original.css'), 'utf8');
  const sources = collectSources(join(PROJECT_ROOT, 'src'));
  const assetUrls = assetDataUrls();

  for (const [assetPath, dataUrl] of Object.entries(assetUrls)) {
    sources['src/ui/assets.js'] = sources['src/ui/assets.js'].split(assetPath).join(dataUrl);
  }

  const bootstrap = `
    (async () => {
      document.open();
      document.write(${JSON.stringify(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>BlockCoach E2E</title><style>${css}</style></head><body><div id="app"></div><div id="toast" class="toast" role="status" aria-live="polite"></div></body></html>`)});
      document.close();

      const storage = new Map();
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
          getItem(key) { return storage.has(String(key)) ? storage.get(String(key)) : null; },
          setItem(key, value) { storage.set(String(key), String(value)); },
          removeItem(key) { storage.delete(String(key)); },
          clear() { storage.clear(); },
          key(index) { return Array.from(storage.keys())[index] || null; },
          get length() { return storage.size; }
        }
      });

      const modules = ${JSON.stringify(sources)};
      const urls = {};
      const resolving = new Set();

      function normalizePath(path) {
        const parts = [];
        for (const part of path.split('/')) {
          if (!part || part === '.') continue;
          if (part === '..') parts.pop();
          else parts.push(part);
        }
        return parts.join('/');
      }

      function dirname(path) {
        return path.split('/').slice(0, -1).join('/');
      }

      function resolvePath(spec, from) {
        if (!spec.startsWith('.')) return spec;
        return normalizePath(dirname(from) + '/' + spec);
      }

      function moduleUrl(path) {
        if (urls[path]) return urls[path];
        const source = modules[path];
        if (!source) throw new Error('Missing module source: ' + path);
        if (resolving.has(path)) throw new Error('Circular module import in E2E bundler: ' + path);
        resolving.add(path);
        const rewritten = source
          .replace(/(from\\s*['"])(\\.{1,2}\\/[^'"]+)(['"])/g, (_match, start, spec, end) => start + moduleUrl(resolvePath(spec, path)) + end)
          .replace(/(import\\s*\\(\\s*['"])(\\.{1,2}\\/[^'"]+)(['"]\\s*\\))/g, (_match, start, spec, end) => start + moduleUrl(resolvePath(spec, path)) + end);
        resolving.delete(path);
        urls[path] = URL.createObjectURL(new Blob([rewritten], { type: 'text/javascript' }));
        return urls[path];
      }

      await import(moduleUrl('src/main.js'));
      window.__blockCoachE2EReady = true;
    })().catch((error) => {
      window.__blockCoachE2EError = error.stack || error.message || String(error);
      throw error;
    });
  `;

  await evalJs(client, bootstrap);
  await waitForCondition(client, 'window.__blockCoachE2EReady === true', 'App aus Modulquellen geladen');
}

async function run() {
  const debugPort = 43000 + Math.floor(Math.random() * 1000);
  const userDataDir = mkdtempSync(join(tmpdir(), 'blockcoach-e2e-'));
  const chrome = findExecutable();

  const chromeProcess = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let client;
  try {
    await fetchJsonWithRetry(`http://127.0.0.1:${debugPort}/json/version`, 'Chrome Debugger');
    client = await connectToPage(debugPort);
    await client.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await loadAppInBlankPage(client);

    await waitForText(client, 'Level up your fights.', 'Onboarding sichtbar');
    await assertBodyHas(client, ['BlockCoach starten', 'Startdaten', 'FIGHTS PRO QUEST'], 'Onboarding');
    await screenshot(client, '01-onboarding');

    await typeInto(client, '#name', 'Vince E2E', 'Name');
    await setSelect(client, '#mainSkill', 'Sword PvP', 'Hauptskill');
    await setSelect(client, '#server', 'PvPClub', 'Server');
    await typeInto(client, '#targetFights', '5', 'Fights pro Quest');
    await click(client, '[data-form="onboarding"] button[type="submit"]', 'BlockCoach starten');
    await waitForText(client, 'Quest starten', 'Dashboard Quest CTA');
    await assertBodyHas(client, ['Daily Quest', '🔥 Streak', '⭐ XP'], 'Dashboard offen');
    await screenshot(client, '02-dashboard-open');

    await click(client, '[data-action="start-quest"]', 'Quest starten');
    await waitForText(client, '⚔️ Fight Log', 'Fight Log sichtbar');
    await assertBodyHas(client, ['Quest läuft', 'Nach jedem Fight ein Klick.', 'Bonus offen', 'Quest abschließen'], 'Training aktiv');

    await evalJs(client, `window.BlockCoachBridge.receive({ type: 'minecraft_connected', playerName: 'Vince E2E', minecraftVersion: '1.21.11' });`);
    await evalJs(client, `window.BlockCoachBridge.receive({ type: 'server_joined', server: 'PvPClub' });`);
    await evalJs(client, `window.BlockCoachBridge.receive({ type: 'fight_result', result: 'win' });`);
    await waitForCondition(client, `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})).todayTraining.activeSession.fights === 1`, 'Bridge Win übernommen');
    await waitForText(client, 'Live', 'Live-Status nach Bridge-Events sichtbar');

    await clickUntil(client, '[data-action="fight-win"]', `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})).todayTraining.activeSession.fights === 2`, 'Manueller Win gespeichert');
    await clickUntil(client, '[data-action="fight-loss"]', `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})).todayTraining.activeSession.fights === 3`, 'Loss gespeichert');
    await clickUntil(client, '[data-action="fight-training"]', `JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})).todayTraining.activeSession.fights === 4`, 'Trainingsfight gespeichert');

    let state = await appState(client);
    assert.equal(state.todayTraining.activeSession.fights, 4, '4 Fights nach Klicks');
    assert.equal(state.todayTraining.activeSession.wins, 2, '2 Wins nach Klicks');
    assert.equal(state.todayTraining.activeSession.losses, 1, '1 Loss nach Klick');
    assert.equal(state.todayTraining.activeSession.trainingFights, 1, '1 Trainingsfight nach Klick');

    const challengeTarget = state.todayTraining.activeSession.challengeTarget;
    for (let i = 0; i < challengeTarget; i += 1) await click(client, '[data-action="challenge-success"]', `Bonus Erfolg ${i + 1}`);
    await waitForText(client, 'Bonus freigeschaltet', 'Bonus Erfolgsmoment');
    await assertBodyHas(client, ['🎉 Bonus freigeschaltet', '💎 Bonus geschafft'], 'Bonus geschafft');

    await click(client, '[data-issue="Positioning"]', 'Review Positioning');
    await typeInto(client, '#questNotes', 'Zweimal zu früh committed. Mehr Abstand halten.', 'Quest-Notiz');
    await screenshot(client, '03-training-active');

    await click(client, '[data-action="finish-quest"]', 'Quest abschließen');
    await waitForText(client, '✅ Quest abgeschlossen', 'Abschluss-Summary');
    await assertBodyHas(client, ['XP gesammelt', 'Streak gesichert', 'Quest-Verlauf ansehen', 'Nächster Fokus'], 'Abschlussgefühl');
    await screenshot(client, '04-quest-complete');

    state = await appState(client);
    assert.equal(state.history.length, 1, 'Eine Quest wurde gespeichert');
    assert.equal(state.todayTraining.activeSession, null, 'Aktive Quest wurde beendet');
    assert.equal(state.history[0].fights, 4, 'Gespeicherte Fights stimmen');
    assert.equal(state.history[0].challengeDone, true, 'Bonus wurde gespeichert');
    assert.equal(state.history[0].mainIssue, 'Positioning', 'Review wurde gespeichert');
    assert.equal(state.progress.streak, 1, 'Streak wurde gesichert');
    assert.ok(state.progress.xp > 0, 'XP wurde vergeben');

    await click(client, '[data-action="clear-summary"][data-screen="dashboard"]', 'Zum Dashboard');
    await waitForText(client, 'Heute erledigt', 'Dashboard abgeschlossen');
    await assertBodyHas(client, ['Quest abgeschlossen', 'Streak gesichert', 'Fortschritt ansehen'], 'Dashboard abgeschlossen');

    await click(client, '[data-screen="progress"]', 'Fortschritt öffnen');
    await waitForText(client, 'Quest-Verlauf', 'Fortschritt sichtbar');
    await assertBodyHas(client, ['Diese Woche', 'Abgeschlossene Quests', 'Vince E2E'], 'Fortschritt');
    await screenshot(client, '05-progress');

    await click(client, 'nav [data-screen="analysis"]', 'Analyse öffnen');
    await waitForText(client, 'Nächster Fokus', 'Analyse sichtbar');
    await assertBodyHas(client, ['Darauf achten', 'Positioning'], 'Analyse');

    await click(client, 'nav [data-screen="profile"]', 'Profil öffnen');
    await waitForText(client, 'Export / Import', 'Profil sichtbar');
    await assertBodyHas(client, ['BlockCoach Live', 'App zurücksetzen', 'Fights pro Quest', 'minecraftTrainerApp'], 'Profil');

    await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await click(client, 'nav [data-screen="progress"]', 'Mobile Fortschritt Nav');
    await waitForText(client, 'Quest-Verlauf', 'Mobile Fortschritt');
    await click(client, 'nav [data-screen="training"]', 'Mobile Training Nav');
    await waitForText(client, 'Daily Quest', 'Mobile Training');
    await screenshot(client, '06-mobile-training');

    assert.deepEqual(client.runtimeExceptions, [], `Runtime Exceptions: ${client.runtimeExceptions.join('\n')}`);
    assert.deepEqual(client.logErrors, [], `Browser-Log-Fehler: ${client.logErrors.join('\n')}`);

    console.log('E2E user-flow test passed: real browser clicks, onboarding, bridge event ingestion, quest loop, completion, progress, analysis, profile and mobile navigation are consistent.');
  } finally {
    await client?.close();
    chromeProcess.kill('SIGTERM');
    await sleep(400);
    try {
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // Chrome can keep profile files locked briefly. Do not mask the test result with cleanup noise.
    }
  }
}

run().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
