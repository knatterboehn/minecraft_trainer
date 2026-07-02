import { statCard } from '../components/statCard.js';
import { getWinrate } from '../../domain/progress.js';
import { getQuestWeek } from '../../domain/questStatus.js';
import { escapeHtml } from '../html.js';
import { art } from '../assets.js';

function formatDate(date) {
  try { return new Intl.DateTimeFormat('de-DE').format(new Date(date)); }
  catch { return String(date || ''); }
}

function renderEmpty() {
  return `
    <div class="empty-state with-art">
      <div class="state-art" aria-hidden="true">${art('sleep')}</div>
      <div><strong>Noch keine Quest gespeichert.</strong><span class="notice-note">Starte im Training und schließe deine erste Daily Quest ab.</span></div>
    </div>
  `;
}

function renderHistoryItem(entry) {
  const winrate = getWinrate(entry.wins, entry.losses);
  return `
    <article class="history-item quest-history-item">
      <div>
        <strong>✅ ${escapeHtml(entry.skill)} · ${escapeHtml(formatDate(entry.date))}</strong>
        <div class="history-meta">
          <span class="tag ${entry.wins > entry.losses ? 'good' : 'warn'}">🏆 ${escapeHtml(`${entry.wins}W / ${entry.losses}L`)}</span>
          <span class="tag">⚔️ ${escapeHtml(`${entry.fights} Fights`)}</span>
          <span class="tag">📈 ${escapeHtml(`${winrate}% Winrate`)}</span>
          <span class="tag ${entry.challengeDone ? 'good' : ''}">${entry.challengeDone ? '💎 Bonus geschafft' : '✨ Bonus offen'}</span>
          <span class="tag">🧠 ${escapeHtml(entry.mainIssue || 'Weiß nicht')}</span>
        </div>
      </div>
      <span class="tag accent">⭐ +${escapeHtml(entry.xp)} XP</span>
    </article>
  `;
}

function renderWeek(state) {
  const week = getQuestWeek(state);
  return `
    <div class="quest-week" aria-label="Quest-Woche">
      ${week.map((day) => `
        <div class="quest-day ${day.completed ? 'done' : ''} ${day.today ? 'today' : ''}">
          <span>${escapeHtml(day.label)}</span>
          <strong>${day.completed ? '✅' : day.today ? '🎯' : '—'}</strong>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderProgress(state) {
  const progress = state.progress;
  const winrate = getWinrate(progress.wins, progress.losses);
  const levelProgress = ((progress.xp % 500) / 500) * 100;
  const history = [...state.history].sort((a, b) => String(b.completedAt || b.date).localeCompare(String(a.completedAt || a.date)));

  return `
    <div class="screen">
      <section class="section-head">
        <div>
          <p class="eyebrow">📈 Fortschritt</p>
          <h2>Deine erledigten Quests.</h2>
          <p>XP, Rang, Fights und Quest-Verlauf werden nur aus gespeicherten Daten berechnet.</p>
        </div>
      </section>

      <section class="grid grid-4">
        ${statCard('⭐ XP', progress.xp, `${Math.round(levelProgress)}% im aktuellen Level`, 'diamonds')}
        ${statCard('⬆️ Level', progress.level, `${500 - (progress.xp % 500 || 0)} XP bis zum nächsten Level`, 'reward')}
        ${statCard('👑 Rang', progress.rank, 'Rang basiert auf Gesamt-XP', 'laugh')}
        ${statCard('⚔️ Winrate', `${winrate}%`, `${progress.wins + progress.losses} Fights mit Ergebnis`, winrate >= 50 ? 'reward' : 'creeper')}
      </section>

      <section class="split">
        <div class="card">
          <div class="section-head">
            <div>
              <p class="eyebrow">🔥 Quest-Serie</p>
              <h3>Diese Woche</h3>
              <p>Ein Haken bedeutet: an dem Tag wurde mindestens eine Quest gespeichert.</p>
            </div>
          </div>
          <div class="mt-5">${renderWeek(state)}</div>
          <div class="grid mt-5">
            <div>
              <div class="metric-label"><span>⚔️ Fights gesamt</span><span>${escapeHtml(progress.fights)}</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, progress.fights * 4)}%"></div></div>
            </div>
            <div>
              <div class="metric-label"><span>💎 Bonus Challenges</span><span>${escapeHtml(progress.challengesDone)}</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, progress.challengesDone * 12)}%"></div></div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="section-head">
            <div>
              <p class="eyebrow">✅ Quest-Verlauf</p>
              <h3>Abgeschlossene Quests</h3>
            </div>
          </div>
          <div class="history-list mt-5">
            ${history.length ? history.slice(0, 8).map(renderHistoryItem).join('') : renderEmpty()}
          </div>
        </div>
      </section>
    </div>
  `;
}
