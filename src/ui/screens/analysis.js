import { escapeHtml } from '../html.js';
import { art } from '../assets.js';

function renderTags(items, className = '') {
  if (!items.length) return '<span class="tag">Noch nicht genug Daten</span>';
  return items.map((item) => `<span class="tag ${className}">${escapeHtml(item)}</span>`).join('');
}

export function renderAnalysis(state) {
  const analysis = state.analysis;
  return `
    <div class="screen">
      <section class="hero">
        <div class="hero-content">
          <p class="eyebrow">🧠 Analyse</p>
          <h2>Ein Fokus reicht.</h2>
          <p>${escapeHtml(analysis.nextFocus || 'Starte deine erste Daily Quest.')}</p>
          <div class="hero-actions">
            <button class="btn primary" type="button" data-screen="training">Zur Quest</button>
          </div>
        </div>
        <aside class="hero-panel">
          <div class="hero-panel-top">
            <div>
              <p class="eyebrow">✅ Gespeicherte Quests</p>
              <h3>${escapeHtml(state.history.length)} Quests</h3>
              <p>Die App wertet nur gespeicherte Fights aus. Keine Daten bedeuten keine Diagnose.</p>
            </div>
            <div class="panel-art large" aria-hidden="true">${art('focus')}</div>
          </div>
          <div class="coach-state compact">
            <div class="state-art" aria-hidden="true">${art('torch')}</div>
            <div><strong>Ehrlicher Fokus</strong><span>Keine Fake-Analyse ohne gespeicherte Fights.</span></div>
          </div>
        </aside>
      </section>

      <section class="grid grid-3">
        <article class="card">
          <p class="eyebrow">🏆 Läuft gut</p>
          <h3>Starke Muster</h3>
          <div class="tag-row mt-4">${renderTags(analysis.strengths, 'good')}</div>
        </article>
        <article class="card">
          <p class="eyebrow">👀 Darauf achten</p>
          <h3>Baustellen</h3>
          <div class="tag-row mt-4">${renderTags(analysis.reviewZones, 'warn')}</div>
        </article>
        <article class="card">
          <p class="eyebrow">🧠 Nächster Fokus</p>
          <h3>${escapeHtml(analysis.nextFocus || state.user.mainSkill)}</h3>
          <p>Spiele die nächste Quest mit maximal einem Fokus. Danach direkt speichern.</p>
        </article>
      </section>
    </div>
  `;
}
