import { questCard } from '../components/questCard.js';
import { statCard } from '../components/statCard.js';
import { getWinrate } from '../../domain/progress.js';
import { getBridgeStatus } from '../../integrations/minecraftBridgeAdapter.js';
import { escapeHtml } from '../html.js';

function renderFlowStep(number, title, text) {
  return `
    <article class="flow-step">
      <span>${escapeHtml(number)}</span>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(text)}</p>
      </div>
    </article>
  `;
}

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
          <aside class="stack dashboard-side">
            <div class="card compact integration-status quiet-card">
              <div>
                <p class="eyebrow">Datenquelle</p>
                <h3>${escapeHtml(status.connected ? 'Live verbunden' : 'Manueller Modus')}</h3>
                <p>${escapeHtml(status.detail)}</p>
                <span class="tag warn">Keine Fake-Live-Daten</span>
              </div>
              <img class="status-art" src="./assets/player-ghast-torch.svg" alt="" loading="lazy" aria-hidden="true" />
            </div>
            <div class="grid grid-2">
              ${statCard('Level', progress.level, progress.rank)}
              ${statCard('Streak', progress.streak, 'Quest-Tage')}
              ${statCard('XP', progress.xp, 'Gesamt')}
              ${statCard('Winrate', `${winrate}%`, `${progress.wins}W / ${progress.losses}L`)}
            </div>
          </aside>
        </section>

        <section class="card flow-card">
          <div>
            <p class="eyebrow">So läuft dein Training</p>
            <h2>Spielen, loggen, Fortschritt sehen.</h2>
            <p>Die App bleibt ein Companion neben Minecraft. Du musst nicht viel tippen.</p>
          </div>
          <div class="flow-grid">
            ${renderFlowStep('1', 'Daily Quest spielen', `${quest.targetFights} Fights auf ${quest.server}`)}
            ${renderFlowStep('2', 'Fight Log nutzen', 'Nach jedem Fight: Win, Loss oder Trainingsfight')}
            ${renderFlowStep('3', 'Bonus schaffen', `${quest.challenge.target} Erfolge für Extra-XP`)}
          </div>
        </section>

        <section class="card next-focus-card">
          <div class="between">
            <div>
              <p class="eyebrow">Nächster Fokus</p>
              <h2>${escapeHtml(state.analysis.nextFocus)}</h2>
              <p>Nur aus gespeicherten Quests. Wenn Daten fehlen, sagt die App das ehrlich.</p>
            </div>
            <button class="btn" data-screen="analysis">Fokus ansehen</button>
          </div>
        </section>
      </div>
    </main>
  `;
}
