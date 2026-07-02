import { statCard } from '../components/statCard.js';
import { getWinrate } from '../../domain/progress.js';
import { getLatestTodayQuest, getDailyQuestState, getStreakMessage } from '../../domain/questStatus.js';
import { getBridgeStatus } from '../../integrations/minecraftBridgeAdapter.js';
import { escapeHtml } from '../html.js';
import { art } from '../assets.js';

function formatDate(date) {
  try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date)); }
  catch { return String(date || 'heute'); }
}

function completionText(entry) {
  if (!entry) return '';
  return `${entry.fights} Fights · ${entry.wins} Wins · ${entry.losses} Losses · +${entry.xp} XP`;
}

export function renderDashboard(state) {
  const quest = state.todayTraining.quest;
  const progress = state.progress;
  const winrate = getWinrate(progress.wins, progress.losses);
  const status = getBridgeStatus(state);
  const xpToNext = 500 - (progress.xp % 500 || 0);
  const hasHistory = state.history.length > 0;
  const active = state.todayTraining.activeSession;
  const todayDone = getLatestTodayQuest(state);
  const questState = getDailyQuestState(state);
  const completed = active?.fights || todayDone?.fights || 0;
  const segments = Array.from({ length: quest.targetFights }, (_, index) => `<span class="plan-segment ${index < completed ? 'done' : ''}"></span>`).join('');
  const challengeLabel = todayDone
    ? todayDone.challengeDone ? '✅ Bonus geschafft' : '✨ Bonus offen'
    : active?.challengeDone ? '🎉 Bonus freigeschaltet' : '✨ Bonus Challenge';
  const challengeProgress = active
    ? `${active.challengeProgress} / ${active.challengeTarget}`
    : todayDone ? `${todayDone.challengeProgress} / ${todayDone.challengeTarget}` : `0 / ${quest.challenge.target}`;

  const heroCopy = {
    open: {
      eyebrow: `🎯 Heute · ${formatDate(quest.date)}`,
      title: `Heute zählt <span class="accent-word">${escapeHtml(quest.skill)}.</span>`,
      body: `${quest.focus} Eine kurze saubere Quest schlägt Autopilot.`,
      primary: 'Quest starten →',
      primaryAction: 'start-quest',
      primaryScreen: '',
      secondary: 'Analyse ansehen',
      secondaryScreen: 'analysis'
    },
    active: {
      eyebrow: `⚔️ Quest läuft · ${formatDate(quest.date)}`,
      title: `Logge deine <span class="accent-word">Fights.</span>`,
      body: `${active?.fights || 0} / ${quest.targetFights} Fights erledigt. Nach jedem Fight nur ein Klick.`,
      primary: 'Zur Quest →',
      primaryAction: '',
      primaryScreen: 'training',
      secondary: 'Analyse ansehen',
      secondaryScreen: 'analysis'
    },
    completed: {
      eyebrow: `✅ Heute erledigt · ${formatDate(quest.date)}`,
      title: `Quest <span class="accent-word">abgeschlossen.</span>`,
      body: `${completionText(todayDone)}. ${todayDone?.challengeDone ? 'Bonus Challenge geschafft.' : 'Bonus Challenge blieb offen.'}`,
      primary: 'Fortschritt ansehen →',
      primaryAction: '',
      primaryScreen: 'progress',
      secondary: 'Noch eine Quest',
      secondaryAction: 'start-quest',
      secondaryScreen: ''
    }
  }[questState];

  const primaryAttrs = heroCopy.primaryAction
    ? `data-action="${heroCopy.primaryAction}"`
    : `data-screen="${heroCopy.primaryScreen}"`;
  const secondaryAttrs = heroCopy.secondaryAction
    ? `data-action="${heroCopy.secondaryAction}"`
    : `data-screen="${heroCopy.secondaryScreen}"`;

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
          <p class="eyebrow">${escapeHtml(heroCopy.eyebrow)}</p>
          <h2>${heroCopy.title}</h2>
          <p>${escapeHtml(heroCopy.body)}</p>
          <div class="hero-actions">
            <button class="btn primary" type="button" ${primaryAttrs}>${escapeHtml(heroCopy.primary)}</button>
            <button class="btn" type="button" ${secondaryAttrs}>${escapeHtml(heroCopy.secondary)}</button>
          </div>
        </div>
        <aside class="hero-panel cinema-challenge" aria-label="Bonus Challenge">
          <div class="hero-panel-top">
            <div>
              <p class="eyebrow">${escapeHtml(challengeLabel)}</p>
              <h3>${escapeHtml(quest.challenge.label)}</h3>
              <p>${escapeHtml(`${challengeProgress} Erfolge · ${quest.targetFights} Fights · ${quest.server}`)}</p>
            </div>
            <div class="panel-art" aria-hidden="true">${art(todayDone?.challengeDone || active?.challengeDone ? 'reward' : 'torch')}</div>
          </div>
          <div class="tag-row">
            <span class="tag accent">⭐ +100 XP Quest</span>
            <span class="tag ${todayDone?.challengeDone || active?.challengeDone ? 'good' : ''}">💎 +100 XP Bonus</span>
          </div>
        </aside>
      </section>

      <section class="grid grid-3 cinema-metrics" aria-label="Spielerwerte">
        ${statCard('⭐ XP', progress.xp, `${xpToNext} XP bis Level ${progress.level + 1}`, 'diamonds')}
        ${statCard('👑 Level', progress.level, `Rang: ${progress.rank}`, 'loot')}
        ${statCard('🔥 Streak', `${progress.streak} Tage`, getStreakMessage(state), 'ghast')}
      </section>

      <section class="dashboard-content">
        <article class="card cinematic-plan">
          <div class="section-head">
            <div>
              <p class="eyebrow">🎯 Daily Quest</p>
              <h3>${questState === 'completed' ? 'Heute erledigt' : 'Dein Plan für heute'}</h3>
              <p>${questState === 'completed' ? 'Guter Abschluss. Morgen wartet die nächste Daily Quest.' : 'Spiele echte Fights, logge kurz das Ergebnis und sammle Bonus-Fortschritt.'}</p>
            </div>
          </div>
          <div class="featured-exercise">
            <div class="exercise-shot" aria-hidden="true">${art(todayDone ? 'laugh' : 'reward')}</div>
            <div class="exercise-copy">
              <strong>${escapeHtml(todayDone ? `✅ ${quest.title}` : quest.title)}</strong>
              <span>${escapeHtml(todayDone ? completionText(todayDone) : `${quest.targetFights} Fights · ${quest.server} · ${quest.focus}`)}</span>
            </div>
            <button class="btn" type="button" data-screen="${questState === 'completed' ? 'progress' : 'training'}">${questState === 'completed' ? 'Verlauf ansehen →' : 'Zur Quest →'}</button>
          </div>
          <div class="plan-progress" aria-label="Fortschritt im Tagesplan">
            <div class="plan-segments" style="--segment-count:${quest.targetFights}">${segments}</div>
            <span class="plan-count">${escapeHtml(completed)} / ${escapeHtml(quest.targetFights)}</span>
          </div>
        </article>

        <aside class="card compact cinematic-status">
          <div>
            <p class="eyebrow">${questState === 'completed' ? '✅ Tagesstatus' : 'BlockCoach Live'}</p>
            <h3>${escapeHtml(questState === 'completed' ? 'Streak gesichert' : status.label)}</h3>
            <p>${escapeHtml(questState === 'completed' ? 'Deine heutige Quest ist gespeichert. Extra-Fights sind optional.' : status.detail)}</p>
            <div class="tag-row mt-4">
              <span class="tag ${status.connected ? 'good' : 'warn'}">${status.connected ? '● Live bereit' : '● Manueller Backup'}</span>
              ${status.server ? `<span class="tag accent">${escapeHtml(status.server)}</span>` : ''}
            </div>
            <div class="hero-actions mt-4">
              <button class="btn" type="button" data-screen="${questState === 'completed' ? 'progress' : 'training'}">${questState === 'completed' ? 'Fortschritt öffnen →' : 'Zur Quest →'}</button>
              ${questState === 'completed' ? '' : '<button class="btn ghost" type="button" data-action="check-bridge">Bridge prüfen</button>'}
            </div>
          </div>
          <div class="status-visual" aria-hidden="true">${art(questState === 'completed' ? 'laugh' : hasHistory ? 'laugh' : 'sleep')}</div>
        </aside>
      </section>

      <aside class="daily-tip" aria-label="Tipp des Tages">
        <strong>${questState === 'completed' ? '🎉 Geschafft' : '🧠 Nächster Fokus'}</strong>
        <span>${escapeHtml(questState === 'completed' ? `${getStreakMessage(state)}. Morgen wieder eine kurze Quest.` : state.analysis.nextFocus || 'Starte deine erste Daily Quest.')}</span>
      </aside>
    </div>
  `;
}
