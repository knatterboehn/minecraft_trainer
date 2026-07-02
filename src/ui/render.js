import { renderOnboarding } from './screens/onboarding.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderTraining } from './screens/training.js';
import { renderProgress } from './screens/progress.js';
import { renderAnalysis } from './screens/analysis.js';
import { renderProfile } from './screens/profile.js';
import { escapeHtml } from './html.js';

const screens = {
  onboarding: renderOnboarding,
  dashboard: renderDashboard,
  training: renderTraining,
  progress: renderProgress,
  analysis: renderAnalysis,
  profile: renderProfile
};

const nav = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'training', label: 'Training' },
  { id: 'progress', label: 'Fortschritt' },
  { id: 'analysis', label: 'Analyse' },
  { id: 'profile', label: 'Profil' }
];

function renderTopbar(state) {
  if (state.ui.screen === 'onboarding') return '';
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true"><span></span></div>
          <div class="brand-copy">
            <p class="eyebrow">Minecraft Trainer</p>
            <h1>${escapeHtml(state.user.name || 'Trainer')}</h1>
          </div>
        </div>
        <nav class="nav" aria-label="Hauptnavigation">
          ${nav.map((item) => `
            <button type="button" data-screen="${item.id}" class="${state.ui.screen === item.id ? 'active' : ''}">${escapeHtml(item.label)}</button>
          `).join('')}
        </nav>
        <div class="topbar-actions">
          <span class="user-pill">Level ${escapeHtml(state.progress.level)} · ${escapeHtml(state.progress.rank)}</span>
          <div class="theme-control" style="--theme-color: var(--accent); --theme-rgb: var(--accent-rgb)">
            <select class="theme-select" data-input="theme" aria-label="Theme wählen">
              ${['emerald','redstone','diamond','amethyst','netherite'].map((theme) => `<option value="${theme}" ${state.settings.theme === theme ? 'selected' : ''}>${theme[0].toUpperCase()}${theme.slice(1)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function renderApp(state) {
  document.body.dataset.theme = state.settings.theme || 'emerald';
  const screen = screens[state.ui.screen] || screens.dashboard;
  if (state.ui.screen === 'onboarding') return screen(state);
  return `<main class="app-shell">${renderTopbar(state)}${screen(state)}</main>`;
}
