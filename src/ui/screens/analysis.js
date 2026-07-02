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
        <section class="card">
          <p class="eyebrow">Analyse</p>
          <h2>Was bedeutet das?</h2>
          <p>Kurze Muster aus echten gespeicherten Quest-Daten.</p>
        </section>

        <section class="card stack">
          <div>
            <p class="eyebrow">Nächster Fokus</p>
            <h3>${escapeHtml(analysis.nextFocus)}</h3>
          </div>
        </section>

        <section class="grid grid-2">
          <div class="card stack">
            <div>
              <p class="eyebrow">Stärken</p>
              <h3>Was läuft gut?</h3>
            </div>
            ${list(analysis.strengths, 'Noch keine klare Stärke', 'Dafür braucht die App mehr Fights und Wins.')}
          </div>
          <div class="card stack">
            <div>
              <p class="eyebrow">Review-Zonen</p>
              <h3>Was braucht Fokus?</h3>
            </div>
            ${list(analysis.reviewZones, 'Noch keine klare Review-Zone', 'Die App markiert nur Muster, wenn genug Daten da sind.')}
          </div>
        </section>
      </div>
    </main>
  `;
}
