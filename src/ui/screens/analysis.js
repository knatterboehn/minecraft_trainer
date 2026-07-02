import { emptyState } from '../components/emptyState.js';
import { escapeHtml } from '../html.js';

function list(items, fallbackTitle, fallbackText) {
  if (!items.length) return emptyState(fallbackTitle, fallbackText);
  return `<div class="stack-tight">${items.map((item) => `<div class="card compact"><p>${escapeHtml(item)}</p></div>`).join('')}</div>`;
}

export function renderAnalysis(state) {
  const analysis = state.analysis;
  return `
    <main class="app-shell">
      <div class="screen">
        <section class="card page-intro focus-intro">
          <p class="eyebrow">Fokus</p>
          <h2>Was trainierst du als Nächstes?</h2>
          <p>Kurz, ehrlich und nur aus deinen gespeicherten Quest-Daten abgeleitet.</p>
        </section>

        <section class="card stack next-focus-large">
          <div>
            <p class="eyebrow">Nächster Fokus</p>
            <h3>${escapeHtml(analysis.nextFocus)}</h3>
          </div>
          <button class="btn primary" data-screen="training">Zur Quest</button>
        </section>

        <section class="grid grid-2">
          <div class="card stack">
            <div>
              <p class="eyebrow">Läuft gut</p>
              <h3>Starke Muster</h3>
            </div>
            ${list(analysis.strengths, 'Noch keine klare Stärke', 'Dafür braucht die App mehr Fights und Wins.')}
          </div>
          <div class="card stack">
            <div>
              <p class="eyebrow">Braucht Fokus</p>
              <h3>Review-Zonen</h3>
            </div>
            ${list(analysis.reviewZones, 'Noch keine klare Review-Zone', 'Die App markiert nur Muster, wenn genug Daten da sind.')}
          </div>
        </section>
      </div>
    </main>
  `;
}
