import { questCard } from '../components/questCard.js';
import { statCard } from '../components/statCard.js';
import { getWinrate } from '../../domain/progress.js';
import { getBridgeStatus } from '../../integrations/minecraftBridgeAdapter.js';
import { escapeHtml } from '../html.js';

export function renderDashboard(state) {
  const quest = state.todayTraining.quest;
  const status = getBridgeStatus();
  const progress = state.progress;
  const winrate = getWinrate(progress.wins, progress.losses);

  return `
    <main class="app-shell">
      <div class="screen">
        <section class="quest-grid">
          ${questCard(quest, 'Quest starten')}
          <aside class="stack">
            <div class="card compact integration-status">
              <p class="eyebrow">Datenquelle</p>
              <h3>${escapeHtml(status.label)}</h3>
              <p>${escapeHtml(status.detail)}</p>
              <span class="tag warn">Manueller Modus</span>
            </div>
            <div class="grid grid-2">
              ${statCard('Level', progress.level, progress.rank)}
              ${statCard('Streak', progress.streak, 'Quest-Tage')}
              ${statCard('XP', progress.xp, 'Gesamt')}
              ${statCard('Winrate', `${winrate}%`, `${progress.wins}W / ${progress.losses}L`)}
            </div>
          </aside>
        </section>
        <section class="card">
          <div class="between">
            <div>
              <p class="eyebrow">Nächster Fokus</p>
              <h2>${escapeHtml(state.analysis.nextFocus)}</h2>
              <p>Die App sagt nur Dinge, die aus deinen gespeicherten Daten ableitbar sind.</p>
            </div>
            <button class="btn" data-screen="analysis">Analyse ansehen</button>
          </div>
        </section>
      </div>
    </main>
  `;
}
