import { statCard } from '../components/statCard.js';
import { getWinrate } from '../../domain/progress.js';
import { getBridgeStatus } from '../../integrations/minecraftBridgeAdapter.js';
import { escapeHtml } from '../html.js';
import { art } from '../assets.js';

function formatDate(date) {
  try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date)); }
  catch { return String(date || 'heute'); }
}

export function renderDashboard(state) {
  const quest = state.todayTraining.quest;
  const progress = state.progress;
  const winrate = getWinrate(progress.wins, progress.losses);
  const status = getBridgeStatus();
  const xpToNext = 500 - (progress.xp % 500 || 0);
  const hasHistory = state.history.length > 0;
  const active = state.todayTraining.activeSession;
  const completed = active?.fights || 0;
  const segments = Array.from({ length: quest.targetFights }, (_, index) => `<span class="plan-segment ${index < completed ? 'done' : ''}"></span>`).join('');

  return `
    <div class="dashboard-screen">
      <section class="hero cinema-hero" aria-label="Dashboard Fokus">
        <div class="cinema-stage" aria-hidden="true">
          <div class="scene-art scene-ghast">${art('ghast')}</div>
          <div class="scene-art scene-creeper">${art('creeper')}</div>
          <div class="scene-art scene-main">${art('runner')}</div>
          <div class="scene-art scene-rival">${art('pig')}</div>
          <div class="scene-art scene-reward">${art('reward')}</div>
          <div class="scene-art scene-diamond-trail">${art('diamonds')}</div>
          <div class="scene-art scene-loot">${art('loot')}</div>
        </div>
        <div class="hero-content">
          <p class="eyebrow">Heute · ${escapeHtml(formatDate(quest.date))}</p>
          <h2>Heute zählt <span class="accent-word">${escapeHtml(quest.skill)}.</span></h2>
          <p>${escapeHtml(quest.focus)} Eine kurze saubere Quest schlägt Autopilot.</p>
          <div class="hero-actions">
            <button class="btn primary" type="button" data-action="start-quest">Quest starten →</button>
            <button class="btn" type="button" data-screen="analysis">Coach-Check</button>
          </div>
        </div>
        <aside class="hero-panel cinema-challenge" aria-label="Bonus Challenge">
          <div class="hero-panel-top">
            <div>
              <p class="eyebrow">Tages-Challenge</p>
              <h3>${escapeHtml(quest.challenge.label)}</h3>
              <p>${escapeHtml(`${quest.targetFights} Fights · ${quest.server} · Manueller Modus`)}</p>
            </div>
            <div class="panel-art" aria-hidden="true">${art('torch')}</div>
          </div>
          <div class="tag-row">
            <span class="tag accent">+100 XP Quest</span>
            <span class="tag">+100 XP Bonus</span>
          </div>
        </aside>
      </section>

      <section class="grid grid-3 cinema-metrics" aria-label="Spielerwerte">
        ${statCard('XP', progress.xp, `${xpToNext} XP bis Level ${progress.level + 1}`, 'diamonds')}
        ${statCard('Level', progress.level, `Rang: ${progress.rank}`, 'loot')}
        ${statCard('Streak', `${progress.streak} Tage`, progress.lastQuestDate ? `Letzte Quest: ${formatDate(progress.lastQuestDate)}` : 'Starte heute deine erste Serie', 'ghast')}
      </section>

      <section class="dashboard-content">
        <article class="card cinematic-plan">
          <div class="section-head">
            <div>
              <p class="eyebrow">Daily Quest</p>
              <h3>Dein Plan für heute</h3>
              <p>Spiele echte Fights, logge kurz das Ergebnis und sammle Bonus-Fortschritt.</p>
            </div>
          </div>
          <div class="featured-exercise">
            <div class="exercise-shot" aria-hidden="true">${art('reward')}</div>
            <div class="exercise-copy">
              <strong>${escapeHtml(quest.title)}</strong>
              <span>${escapeHtml(`${quest.targetFights} Fights · ${quest.server} · ${quest.focus}`)}</span>
            </div>
            <button class="btn" type="button" data-screen="training">Zur Quest →</button>
          </div>
          <div class="plan-progress" aria-label="Fortschritt im Tagesplan">
            <div class="plan-segments" style="--segment-count:${quest.targetFights}">${segments}</div>
            <span class="plan-count">${completed} / ${quest.targetFights}</span>
          </div>
        </article>

        <aside class="card compact cinematic-status">
          <div>
            <p class="eyebrow">Status</p>
            <h3>${escapeHtml(status.connected ? 'Live verbunden' : 'Manueller Modus')}</h3>
            <p>${escapeHtml(status.detail || 'Aktuell läuft die App im manuellen Modus. Keine Live-Daten werden vorgetäuscht.')}</p>
            <div class="mt-4">
              <button class="btn" type="button" data-screen="training">Training öffnen →</button>
            </div>
          </div>
          <div class="status-visual" aria-hidden="true">${art(hasHistory ? 'laugh' : 'sleep')}</div>
        </aside>
      </section>

      <aside class="daily-tip" aria-label="Tipp des Tages">
        <strong>Nächster Fokus</strong>
        <span>${escapeHtml(state.analysis.nextFocus || 'Starte deine erste Daily Quest.')}</span>
      </aside>
    </div>
  `;
}
