import { SKILLS, SERVERS, DIFFICULTIES, THEMES, STORAGE_KEY } from '../../state/defaults.js';
import { escapeHtml } from '../html.js';

function options(items, selected) {
  return items.map((item) => `<option value="${escapeHtml(item)}" ${item === selected ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('');
}

export function renderProfile(state) {
  return `
    <main class="app-shell">
      <div class="screen">
        <section class="card page-intro">
          <p class="eyebrow">Profil</p>
          <h2>Daten & Sicherheit</h2>
          <p>Alles bleibt lokal in einem Storage-Key: <strong>${escapeHtml(STORAGE_KEY)}</strong>.</p>
        </section>

        <form class="card stack" data-form="profile">
          <div>
            <p class="eyebrow">Spieler</p>
            <h3>Basisdaten</h3>
          </div>
          <div class="grid grid-2">
            <label class="field">Name
              <input name="name" required maxlength="40" value="${escapeHtml(state.user.name)}" />
            </label>
            <label class="field">Hauptskill
              <select name="mainSkill">${options(SKILLS, state.user.mainSkill)}</select>
            </label>
            <label class="field">Server
              <select name="server">${options(SERVERS, state.user.server)}</select>
            </label>
            <label class="field">Schwierigkeit
              <select name="difficulty">${options(DIFFICULTIES, state.user.difficulty)}</select>
            </label>
            <label class="field">Fights pro Quest
              <input name="targetFights" type="number" min="1" max="20" value="${escapeHtml(state.user.targetFights)}" />
            </label>
            <label class="field">Theme
              <select name="theme">${options(THEMES, state.settings.theme)}</select>
            </label>
          </div>
          <button class="btn primary" type="submit">Profil speichern</button>
        </form>

        <section class="grid grid-2">
          <div class="card stack">
            <div>
              <p class="eyebrow">Export / Import</p>
              <h3>Daten sichern</h3>
              <p>Exportiere deine lokalen Daten oder importiere eine Sicherung.</p>
            </div>
            <div class="row">
              <button class="btn" data-action="export-data">Export</button>
              <label class="btn ghost" for="importFile">Import</label>
              <input id="importFile" class="sr-only" data-input="import" type="file" accept="application/json" />
            </div>
          </div>
          <div class="card stack danger-zone">
            <div>
              <p class="eyebrow">Reset</p>
              <h3>Gefährlicher Bereich</h3>
              <p>Setzt App-Daten lokal zurück. Exportiere vorher, wenn du sicher sein willst.</p>
            </div>
            <button class="btn danger" data-action="reset-app">App zurücksetzen</button>
          </div>
        </section>
      </div>
    </main>
  `;
}
