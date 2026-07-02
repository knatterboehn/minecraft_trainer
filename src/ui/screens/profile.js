import { SKILLS, SERVERS, DIFFICULTIES, THEMES, STORAGE_KEY } from '../../state/defaults.js';
import { getBridgeStatus, DEFAULT_BRIDGE_URL, BRIDGE_CONTRACT_VERSION } from '../../integrations/minecraftBridgeAdapter.js';
import { escapeHtml } from '../html.js';
import { art } from '../assets.js';
import { BRAND_DISCLAIMER } from '../../brand.js';

function options(items, selected) {
  const normalized = String(selected || '');
  const optionItems = normalized && !items.includes(normalized) ? [normalized, ...items] : items;
  return optionItems.map((item) => `<option value="${escapeHtml(item)}" ${item === normalized ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('');
}

function formatTime(value) {
  if (!value) return 'Noch kein Event';
  try { return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value)); }
  catch { return String(value); }
}

function renderBridgeInbox(bridge) {
  if (!bridge.inbox.length) {
    return `
      <div class="empty-state with-art mt-4">
        <div class="state-art" aria-hidden="true">${art('sleep')}</div>
        <div><strong>Noch keine Live-Events.</strong><span class="notice-note">Starte später die Local Bridge. Bis dahin bleibt der manuelle Modus aktiv.</span></div>
      </div>
    `;
  }

  return `
    <div class="history-list mt-4">
      ${bridge.inbox.slice(0, 5).map((entry) => `
        <article class="history-item bridge-event-item">
          <div>
            <strong>${escapeHtml(entry.mapped ? '✅ ' : '• ')}${escapeHtml(entry.label)}</strong>
            <div class="history-meta">
              <span class="tag ${entry.mapped ? 'good' : 'warn'}">${entry.mapped ? 'Quest-Event' : 'Inbox'}</span>
              <span class="tag">${escapeHtml(entry.type)}</span>
              <span class="tag">${escapeHtml(formatTime(entry.createdAt))}</span>
            </div>
            <p>${escapeHtml(entry.detail)}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

export function renderProfile(state) {
  const bridge = getBridgeStatus(state);
  return `
    <div class="screen">
      <section class="section-head">
        <div>
          <p class="eyebrow">Profil</p>
          <h2>Daten verwalten.</h2>
          <p>Bearbeite dein Profil oder sichere deinen Fortschritt als Datei. Alles bleibt im Storage-Key: ${escapeHtml(STORAGE_KEY)}.</p>
        </div>
      </section>

      <section class="split">
        <form id="profileForm" class="card" data-form="profile">
          <div class="section-head">
            <div>
              <p class="eyebrow">Spielerdaten</p>
              <h3>Profil bearbeiten</h3>
            </div>
          </div>
          <div class="form-grid mt-5">
            <div class="field">
              <label for="profileName">Name</label>
              <input id="profileName" name="name" required maxlength="24" value="${escapeHtml(state.user.name)}" />
            </div>
            <div class="field">
              <label for="profileSkill">Hauptskill</label>
              <select id="profileSkill" name="mainSkill">${options(SKILLS, state.user.mainSkill)}</select>
            </div>
            <div class="field">
              <label for="profileServer">Server</label>
              <select id="profileServer" name="server">${options(SERVERS, state.user.server)}</select>
            </div>
            <div class="field">
              <label for="profileDifficulty">Schwierigkeit</label>
              <select id="profileDifficulty" name="difficulty">${options(DIFFICULTIES, state.user.difficulty)}</select>
            </div>
            <div class="field">
              <label for="profileTargetFights">Fights pro Quest</label>
              <input id="profileTargetFights" name="targetFights" type="number" min="1" max="20" value="${escapeHtml(state.user.targetFights)}" />
            </div>
            <div class="field">
              <label for="profileTheme">Theme</label>
              <select id="profileTheme" name="theme">${options(THEMES, state.settings.theme)}</select>
            </div>
          </div>
          <div class="notice mt-4">
            <div><strong>Hinweis:</strong> ${escapeHtml(BRAND_DISCLAIMER)}</div>
          </div>
          <div class="form-actions">
            <button class="btn primary" type="submit">Änderungen speichern</button>
          </div>
        </form>

        <aside class="grid">
          <div class="card">
            <p class="eyebrow">BlockCoach Live</p>
            <h3>${escapeHtml(bridge.label)}</h3>
            <p>${escapeHtml(bridge.detail)}</p>
            <div class="card-art" aria-hidden="true">${art(bridge.connected ? 'reward' : 'platform')}</div>
            <div class="tag-row mt-4">
              <span class="tag ${bridge.connected ? 'good' : 'warn'}">${bridge.connected ? '● Live bereit' : '● Manueller Backup'}</span>
              <span class="tag">${escapeHtml(BRIDGE_CONTRACT_VERSION)}</span>
              <span class="tag">${escapeHtml(bridge.url || DEFAULT_BRIDGE_URL)}</span>
            </div>
            <div class="hero-actions mt-4">
              <button class="btn" type="button" data-action="check-bridge">Bridge prüfen</button>
            </div>
            ${renderBridgeInbox(bridge)}
          </div>
          <div class="card">
            <p class="eyebrow">Daten</p>
            <h3>Export / Import</h3>
            <p>Sichere deinen Fortschritt als JSON-Datei oder importiere einen alten Stand.</p>
            <div class="card-art" aria-hidden="true">${art('laugh')}</div>
            <div class="hero-actions mt-4">
              <button class="btn" type="button" data-action="export-data">Export</button>
              <label class="btn" for="importFile">Import</label>
              <input id="importFile" type="file" accept="application/json,.json" class="hidden" data-input="import" />
            </div>
          </div>
          <div class="card danger-zone">
            <p class="eyebrow">Reset</p>
            <h3>App zurücksetzen</h3>
            <p>Das löscht deine gespeicherten App-Daten. Vorher am besten exportieren.</p>
            <div class="card-art" aria-hidden="true">${art('creeper')}</div>
            <div class="hero-actions mt-4">
              <button class="btn danger" type="button" data-action="reset-app">Reset</button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  `;
}
