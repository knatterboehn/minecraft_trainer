import { statCard } from '../components/statCard.js';
import { calculateXpBreakdown, getWinrate } from '../../domain/progress.js';
import { escapeHtml } from '../html.js';
import { art } from '../assets.js';

const issues = ['Aim', 'Movement', 'Positioning', 'Decision', 'Panic', 'Weiß nicht'];

function renderIssueButtons(activeIssue) {
  return issues.map((issue) => `
    <button type="button" class="btn issue-option ${issue === activeIssue ? 'active' : ''}" data-action="set-issue" data-issue="${escapeHtml(issue)}">${escapeHtml(issue)}</button>
  `).join('');
}

function renderSummary(state) {
  const entry = state.history.find((item) => item.id === state.ui.lastSummaryId);
  if (!entry) return '';
  const winrate = getWinrate(entry.wins, entry.losses);
  const focus = entry.mainIssue && entry.mainIssue !== 'Weiß nicht'
    ? `${entry.mainIssue}: nächste Quest nur darauf achten.`
    : 'Nächste Quest mit einem klaren Fokus spielen.';
  return `
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">Quest abgeschlossen</p>
        <h2>+${escapeHtml(entry.xp)} XP gesammelt.</h2>
        <p>${escapeHtml(`${entry.fights} Fights · ${entry.wins} Wins · ${entry.losses} Losses · ${winrate}% Winrate`)}</p>
        <div class="hero-actions">
          <button class="btn primary" type="button" data-action="clear-summary" data-screen="dashboard">Zurück zum Dashboard</button>
          <button class="btn" type="button" data-screen="progress">Fortschritt ansehen</button>
        </div>
      </div>
      <aside class="hero-panel">
        <div class="hero-panel-top">
          <div>
            <p class="eyebrow">Nächster Fokus</p>
            <h3>${escapeHtml(focus)}</h3>
            <p>${entry.challengeDone ? 'Bonus Challenge geschafft.' : 'Bonus Challenge blieb offen.'}</p>
          </div>
          <div class="panel-art large" aria-hidden="true">${art(entry.challengeDone ? 'reward' : 'focus')}</div>
        </div>
        <div class="tag-row">
          <span class="tag ${entry.challengeDone ? 'good' : 'warn'}">${entry.challengeDone ? 'Bonus erledigt' : 'Bonus offen'}</span>
          <span class="tag">${escapeHtml(entry.mainIssue || 'Weiß nicht')}</span>
        </div>
      </aside>
    </section>
  `;
}

export function renderTraining(state) {
  const quest = state.todayTraining.quest;
  const session = state.todayTraining.activeSession;
  const summary = renderSummary(state);
  if (summary) return `<div class="screen">${summary}</div>`;

  if (!session) {
    return `
      <div class="screen">
        <section class="section-head">
          <div>
            <p class="eyebrow">Training · Daily Quest</p>
            <h2>${escapeHtml(quest.title)}</h2>
            <p>${escapeHtml(`Server: ${quest.server}. Fokus: ${quest.focus}`)}</p>
          </div>
          <button class="btn" type="button" data-screen="dashboard">Dashboard</button>
        </section>

        <section class="split">
          <div class="card">
            <div class="section-head">
              <div>
                <p class="eyebrow">Quest vorbereiten</p>
                <h3>Starte erst, wenn Minecraft offen ist.</h3>
                <p>Die App bleibt neben dem Spiel. Du loggst nur Fights und Bonus-Erfolge.</p>
              </div>
              <span class="tag accent">Manuell</span>
            </div>
            <div class="exercise-list">
              ${quest.hints.map((hint) => `
                <label class="exercise">
                  <input type="checkbox" disabled />
                  <div><strong>${escapeHtml(hint)}</strong><span>Fokus-Hinweis für diese Quest</span></div>
                  <span class="tag">Check</span>
                </label>`).join('')}
            </div>
            <div class="notice with-art mt-4">
              <div class="state-art" aria-hidden="true">${art('torch')}</div>
              <div><strong>Bonus Challenge:</strong><br>${escapeHtml(quest.challenge.label)}<span class="notice-note">Ziel: ${escapeHtml(quest.challenge.target)} Erfolge · +100 XP Bonus</span></div>
            </div>
          </div>

          <aside class="grid">
            <div class="card timer">
              <p class="eyebrow">Daily Quest</p>
              <div class="timer-time">${escapeHtml(quest.targetFights)} Fights</div>
              <p>${escapeHtml(quest.server)} · ${escapeHtml(quest.skill)}</p>
              <div class="timer-controls">
                <button class="btn primary" type="button" data-action="start-quest">Quest starten</button>
              </div>
            </div>
            <div class="card compact cinematic-status">
              <div>
                <p class="eyebrow">Datenquelle</p>
                <h3>Manueller Modus</h3>
                <p>Live-Integration ist vorbereitet, aber nicht verbunden. Keine Fake-Daten.</p>
              </div>
              <div class="status-visual" aria-hidden="true">${art('platform')}</div>
            </div>
          </aside>
        </section>
      </div>
    `;
  }

  const preview = calculateXpBreakdown({ ...session, streakBonus: true });
  const challengePercent = Math.min(100, Math.round((session.challengeProgress / session.challengeTarget) * 100));
  const fightPercent = Math.min(100, Math.round((session.fights / session.targetFights) * 100));

  return `
    <div class="screen">
      <section class="section-head">
        <div>
          <p class="eyebrow">Training läuft</p>
          <h2>${escapeHtml(session.skill)} Quest</h2>
          <p>${escapeHtml(session.focus)}</p>
        </div>
        <span class="tag accent">XP-Vorschau +${escapeHtml(preview.total)}</span>
      </section>

      <section class="split">
        <div class="card">
          <div class="section-head">
            <div>
              <p class="eyebrow">Fight Log</p>
              <h3>Nach jedem Fight ein Klick.</h3>
              <p>Logge nur, was wirklich passiert ist. Schnell, ohne aus Minecraft rauszufallen.</p>
            </div>
            <span class="tag accent">${escapeHtml(`${session.fights} / ${session.targetFights}`)}</span>
          </div>
          <div class="progress-track mt-4" aria-label="Fight-Fortschritt"><div class="progress-fill" style="width:${fightPercent}%"></div></div>
          <section class="grid grid-3 mt-5">
            ${statCard('Wins', session.wins, '+30 XP je Win', 'reward')}
            ${statCard('Losses', session.losses, '+10 XP je Loss', 'creeper')}
            ${statCard('Training', session.trainingFights, 'zählt nicht zur Winrate', 'ghast')}
          </section>
          <div class="hero-actions mt-4">
            <button class="btn primary" type="button" data-action="fight-win">+ Win</button>
            <button class="btn" type="button" data-action="fight-loss">+ Loss</button>
            <button class="btn" type="button" data-action="fight-training">+ Trainingsfight</button>
            <button class="btn ghost" type="button" data-action="fight-undo" ${session.fights <= 0 ? 'disabled' : ''}>Undo</button>
          </div>

          <div class="notice with-art mt-4">
            <div class="state-art" aria-hidden="true">${art(session.challengeDone ? 'diamonds' : 'torch')}</div>
            <div><strong>Bonus Challenge:</strong><br>${escapeHtml(session.challengeLabel)}<span class="notice-note">${escapeHtml(session.challengeProgress)} / ${escapeHtml(session.challengeTarget)} Erfolge</span></div>
          </div>
          <div class="progress-track mt-3" aria-label="Bonus-Fortschritt"><div class="progress-fill" style="width:${challengePercent}%"></div></div>
          <div class="hero-actions mt-4">
            <button class="btn primary" type="button" data-action="challenge-success" ${session.challengeDone ? 'disabled' : ''}>+ Erfolg</button>
            <button class="btn" type="button" data-action="challenge-decrement" ${session.challengeProgress <= 0 ? 'disabled' : ''}>Korrigieren</button>
          </div>
        </div>

        <aside class="grid">
          <div class="card timer">
            <p class="eyebrow">Quest-Fortschritt</p>
            <div class="timer-time">${escapeHtml(session.fights)}</div>
            <p>${escapeHtml(`von ${session.targetFights} Fights`)}</p>
            <div class="timer-controls">
              <span class="tag ${session.challengeDone ? 'good' : 'warn'}">${session.challengeDone ? 'Bonus geschafft' : 'Bonus offen'}</span>
            </div>
          </div>

          <form class="card" data-form="quest-review">
            <p class="eyebrow">Kurz-Review</p>
            <h3>Was war am schwersten?</h3>
            <p>Ein Klick reicht. Kein langer Report.</p>
            <div class="issue-grid mt-4">${renderIssueButtons(session.mainIssue)}</div>
            <div class="field mt-4">
              <label for="questNotes">Notiz optional</label>
              <textarea id="questNotes" data-input="notes" maxlength="500" placeholder="z. B. zweimal zu früh committed">${escapeHtml(session.notes)}</textarea>
            </div>
            <div class="form-actions">
              <button class="btn primary" type="button" data-action="finish-quest" ${session.fights <= 0 ? 'disabled' : ''}>Quest abschließen</button>
            </div>
          </form>
        </aside>
      </section>
    </div>
  `;
}
