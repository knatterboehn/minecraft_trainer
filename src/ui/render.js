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
  { id: 'dashboard', label: 'Heute' },
  { id: 'training', label: 'Quest' },
  { id: 'progress', label: 'Fortschritt' },
  { id: 'analysis', label: 'Fokus' },
  { id: 'profile', label: 'Profil' }
];

function renderTopbar(state) {
  if (state.ui.screen === 'onboarding') return '';
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true"><span></span></div>
          <div>
            <p>Minecraft Trainer</p>
            <h1>${escapeHtml(state.user.name || 'Trainer')}</h1>
          </div>
        </div>
        <nav class="nav" aria-label="Hauptnavigation">
          ${nav.map((item) => `
            <button data-screen="${item.id}" class="${state.ui.screen === item.id ? 'active' : ''}">${escapeHtml(item.label)}</button>
          `).join('')}
        </nav>
        <div class="user-tools">
          <span class="tag accent">Level ${escapeHtml(state.progress.level)}</span>
          <span class="tag">${escapeHtml(state.settings.dataMode === 'bridge' ? 'Bridge' : 'Manuell')}</span>
        </div>
      </div>
    </header>
  `;
}

export function renderApp(state) {
  document.body.dataset.theme = state.settings.theme || 'emerald';
  const screen = screens[state.ui.screen] || screens.dashboard;
  return `${renderTopbar(state)}${screen(state)}`;
}
