import { statCard } from '../components/statCard.js';
import { emptyState } from '../components/emptyState.js';
import { calculateXpBreakdown, getWinrate } from '../../domain/progress.js';
import { escapeHtml } from '../html.js';

const issues = ['Aim', 'Movement', 'Positioning', 'Decision', 'Panic', 'Weiß nicht'];

function renderIssueButtons(activeIssue) {
  return issues.map((issue) => `
    <button class="issue-option ${issue === activeIssue ? 'active' : ''}" data-action="set-issue" data-issue="${escapeHtml(issue)}">${escapeHtml(issue)}</button>
  `).join('');
}

function renderSummary(state) {
  const id = state.ui.lastSummaryId;
  const entry = state.history.find((item) => item.id === id);
  if (!entry) return '';
  const winrate = getWinrate(entry.wins, entry.losses);
  const focus = entry.mainIssue && entry.mainIssue !== 'Weiß nicht'
    ? `${entry.mainIssue}: nächste Quest nur darauf achten.`
    : 'Nächste Quest mit einem klaren Fokus spielen.';

  return `
    <section class="card result-card stack">
      <div>
        <p class="eyebrow">Quest abgeschlossen</p>
        <h2>+${escapeHtml(entry.xp)} XP</h2>
        <p>${escapeHtml(`${entry.fights} Fights · ${entry.wins} Wins · ${entry.losses} Losses · ${winrate}% Winrate`)}</p>
      </div>
      <div class="row">
        <span class="tag ${entry.challengeDone ? 'good' : 'warn'}">${entry.challengeDone ? 'Bonus geschafft' : 'Bonus offen'}</span>
        <span class="tag">${escapeHtml(`Fokus: ${entry.mainIssue || 'Weiß nicht'}`)}</span>
      </div>
      <div class="card compact quiet-card">
        <p class="eyebrow">Nächster Fokus</p>
        <h3>${escapeHtml(focus)}</h3>
      </div>
      <div class="row">
        <button class="btn primary" data-action="clear-summary" data-screen="dashboard">Zur Daily Quest</button>
        <button class="btn" data-screen="progress">Fortschritt ansehen</button>
      </div>
    </section>
  `;
}

function renderHowToPlay(quest) {
  return `
    <section class="card stack">
      <div>
        <p class="eyebrow">Quest-Flow</p>
        <h3>So nutzt du die App neben Minecraft</h3>
        <p>Die App misst nicht die Zeit, sondern deine Fights und deinen Bonus-Fortschritt.</p>
      </div>
      <div class="flow-grid">
        <article class="flow-step"><span>1</span><div><strong>Minecraft spielen</strong><p>${escapeHtml(`${quest.targetFights} Fights auf ${quest.server}`)}</p></div></article>
        <article class="flow-step"><span>2</span><div><strong>Fight loggen</strong><p>Nach jedem Fight genau ein Klick.</p></div></article>
        <article class="flow-step"><span>3</span><div><strong>Bonus tracken</strong><p>${escapeHtml(`${quest.challenge.target} Erfolge für Bonus-XP`)}</p></div></article>
      </div>
    </section>
  `;
}

export function renderTraining(state) {
  const quest = state.todayTraining.quest;
  const session = state.todayTraining.activeSession;
  const summary = renderSummary(state);
  if (summary) {
    return `<main class="app-shell"><div class="screen">${summary}</div></main>`;
  }

  if (!session) {
    return `
      <main class="app-shell">
        <div class="screen training-screen">
          <section class="card quest-start-card stack">
            <div>
              <p class="eyebrow">Daily Quest</p>
              <h2>${escapeHtml(quest.title)}</h2>
              <p>${escapeHtml(`Server: ${quest.server}. Fokus: ${quest.focus}`)}</p>
            </div>
            <div class="card compact quest-challenge">
              <p class="eyebrow">Bonus Challenge</p>
              <h3>${escapeHtml(quest.challenge.label)}</h3>
              <p>${escapeHtml(`Ziel: ${quest.challenge.target} Erfolge`)}</p>
            </div>
            <div class="quest-hints">
              ${quest.hints.map((hint) => `<span class="tag">${escapeHtml(hint)}</span>`).join('')}
            </div>
            <button class="btn primary" data-action="start-quest">Quest starten</button>
          </section>
          ${renderHowToPlay(quest)}
          ${emptyState('Noch nicht gestartet', 'Starte die Quest erst, wenn du Minecraft offen hast und die Fights wirklich spielen willst.')}
        </div>
      </main>
    `;
  }

  const preview = calculateXpBreakdown({ ...session, streakBonus: true });
  const challengePercent = Math.min(100, Math.round((session.challengeProgress / session.challengeTarget) * 100));
  const fightPercent = Math.min(100, Math.round((session.fights / session.targetFights) * 100));

  return `
    <main class="app-shell">
      <div class="screen training-screen">
        <section class="card quest-status-card stack">
          <div class="between">
            <div>
              <p class="eyebrow">Daily Quest läuft</p>
              <h2>${escapeHtml(session.targetFights)} ${escapeHtml(session.skill)}-Fights</h2>
              <p>${escapeHtml(session.focus)}</p>
            </div>
            <span class="tag warn">Manueller Modus</span>
          </div>
          <div class="progress-track" aria-label="Fight-Fortschritt"><div class="progress-fill" style="width:${fightPercent}%"></div></div>
          <div class="row">
            <span class="tag accent">${escapeHtml(`${session.fights} / ${session.targetFights} Fights`)}</span>
            <span class="tag">${escapeHtml(session.server)}</span>
            <span class="tag">XP-Vorschau: +${escapeHtml(preview.total)}</span>
          </div>
        </section>

        <section class="card fight-log-card stack">
          <div class="between">
            <div>
              <p class="eyebrow">Fight Log</p>
              <h3>Nach jedem Fight ein Klick</h3>
              <p>Schnell eintragen, nicht aus dem Spiel-Flow fallen.</p>
            </div>
            <span class="tag accent">${escapeHtml(`${session.fights} Fights`)}</span>
          </div>
          <section class="grid grid-3 fight-log">
            ${statCard('Wins', session.wins, '+30 XP je Win')}
            ${statCard('Losses', session.losses, '+10 XP je Loss')}
            ${statCard('Training', session.trainingFights, 'zählt nicht zur Winrate')}
          </section>
          <div class="fight-actions">
            <button class="btn primary" data-action="fight-win">+ Win</button>
            <button class="btn" data-action="fight-loss">+ Loss</button>
            <button class="btn" data-action="fight-training">+ Trainingsfight</button>
            <button class="btn ghost" data-action="fight-undo" ${session.fights <= 0 ? 'disabled' : ''}>Undo</button>
          </div>
        </section>

        <section class="card challenge-counter stack">
          <div class="between">
            <div>
              <p class="eyebrow">Bonus Challenge</p>
              <h3>${escapeHtml(session.challengeLabel)}</h3>
              <p>${escapeHtml(`${session.challengeProgress} / ${session.challengeTarget} Erfolge`)}</p>
            </div>
            <span class="tag ${session.challengeDone ? 'good' : 'warn'}">${session.challengeDone ? 'geschafft' : 'offen'}</span>
          </div>
          <div class="progress-track" aria-label="Bonus-Fortschritt"><div class="progress-fill" style="width:${challengePercent}%"></div></div>
          <div class="row">
            <button class="btn primary" data-action="challenge-success" ${session.challengeDone ? 'disabled' : ''}>+ Erfolg</button>
            <button class="btn" data-action="challenge-decrement" ${session.challengeProgress <= 0 ? 'disabled' : ''}>Korrigieren</button>
          </div>
        </section>

        <section class="card review-card stack">
          <div>
            <p class="eyebrow">Kurz-Fokus</p>
            <h3>Was war am schwersten?</h3>
            <p>Ein Klick reicht. Kein langer Report.</p>
          </div>
          <div class="issue-grid">${renderIssueButtons(session.mainIssue)}</div>
          <label class="field">Notiz optional
            <textarea data-input="notes" maxlength="500" placeholder="z. B. zweimal zu früh committed">${escapeHtml(session.notes)}</textarea>
          </label>
          <button class="btn primary" data-action="finish-quest" ${session.fights <= 0 ? 'disabled' : ''}>Quest abschließen</button>
        </section>
      </div>
    </main>
  `;
}
