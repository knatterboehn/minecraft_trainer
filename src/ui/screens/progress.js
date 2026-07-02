import { statCard } from '../components/statCard.js';
import { emptyState } from '../components/emptyState.js';
import { getWinrate } from '../../domain/progress.js';
import { escapeHtml } from '../html.js';

function renderHistoryItem(entry) {
  const winrate = getWinrate(entry.wins, entry.losses);
  return `
    <article class="history-item">
      <div>
        <strong>${escapeHtml(entry.skill)} · ${escapeHtml(entry.server)}</strong>
        <p>${escapeHtml(`${entry.fights} Fights · ${entry.wins}W / ${entry.losses}L · ${winrate}% Winrate · +${entry.xp} XP`)}</p>
        <div class="history-meta">
          <span class="tag ${entry.challengeDone ? 'good' : 'warn'}">${entry.challengeDone ? 'Bonus geschafft' : 'Bonus offen'}</span>
          <span class="tag">${escapeHtml(entry.mainIssue || 'Weiß nicht')}</span>
          ${entry.notes ? `<span class="tag">${escapeHtml(entry.notes)}</span>` : ''}
        </div>
      </div>
      <span class="tag">${escapeHtml(entry.date)}</span>
    </article>
  `;
}

export function renderProgress(state) {
  const progress = state.progress;
  const winrate = getWinrate(progress.wins, progress.losses);
  const history = [...state.history].sort((a, b) => b.date.localeCompare(a.date));

  return `
    <main class="app-shell">
      <div class="screen">
        <section class="card">
          <p class="eyebrow">Progress</p>
          <h2>Was ist passiert?</h2>
          <p>Zahlen und Verlauf. Keine erfundenen Skill-Werte.</p>
        </section>

        <section class="grid grid-4">
          ${statCard('XP', progress.xp, `Level ${progress.level}`)}
          ${statCard('Rang', progress.rank, 'Langzeitfortschritt')}
          ${statCard('Fights', progress.fights, `${progress.wins}W / ${progress.losses}L`)}
          ${statCard('Winrate', `${winrate}%`, 'nur Wins/Losses')}
        </section>

        <section class="card stack">
          <div>
            <p class="eyebrow">History</p>
            <h3>Gespeicherte Quests</h3>
          </div>
          <div class="history-list">
            ${history.length ? history.map(renderHistoryItem).join('') : emptyState('Noch keine History', 'Schließe deine erste Daily Quest ab, dann erscheint sie hier.')}
          </div>
        </section>
      </div>
    </main>
  `;
}
