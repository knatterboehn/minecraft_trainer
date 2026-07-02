import { SKILLS, SERVERS, DIFFICULTIES, THEMES, STORAGE_KEY } from '../../state/defaults.js';
import { escapeHtml } from '../html.js';
import { art } from '../assets.js';

function options(items, selected) {
  return items.map((item) => `<option value="${escapeHtml(item)}" ${item === selected ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('');
}

export function renderProfile(state) {
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
          <div class="form-actions">
            <button class="btn primary" type="submit">Änderungen speichern</button>
          </div>
        </form>

        <aside class="grid">
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
