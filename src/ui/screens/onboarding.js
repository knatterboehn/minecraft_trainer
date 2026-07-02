import { SKILLS, SERVERS, DIFFICULTIES } from '../../state/defaults.js';
import { escapeHtml } from '../html.js';
import { art } from '../assets.js';
import { BRAND_NAME, BRAND_TAGLINE, BRAND_DISCLAIMER } from '../../brand.js';

function options(items, selected) {
  return items.map((item) => `<option value="${escapeHtml(item)}" ${item === selected ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('');
}

export function renderOnboarding(state) {
  return `
    <main class="onboarding-wrap">
      <section class="onboarding">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(BRAND_NAME)}</p>
          <h1>${escapeHtml(BRAND_TAGLINE)}</h1>
          <p>Daily Quests, XP, Streaks und echtes Fight-Feedback. Live-Integration vorbereitet, manueller Modus bleibt Backup.</p>
          <div class="intro-art" aria-hidden="true">${art('platform')}</div>
        </div>

        <form id="onboardingForm" class="card" data-form="onboarding" autocomplete="off">
          <div class="section-head">
            <div>
              <p class="eyebrow">Spielerprofil</p>
              <h2>Startdaten</h2>
              <p>Nur die Daten, die deine Daily Quest wirklich braucht. ${escapeHtml(BRAND_DISCLAIMER)}</p>
            </div>
          </div>
          <div class="form-grid mt-5">
            <div class="field">
              <label for="name">Name</label>
              <input id="name" name="name" required maxlength="24" placeholder="z. B. Vince" value="${escapeHtml(state.user.name)}" />
            </div>
            <div class="field">
              <label for="mainSkill">Hauptskill</label>
              <select id="mainSkill" name="mainSkill" required>${options(SKILLS, state.user.mainSkill)}</select>
            </div>
            <div class="field">
              <label for="server">Server</label>
              <select id="server" name="server" required>${options(SERVERS, state.user.server)}</select>
            </div>
            <div class="field">
              <label for="difficulty">Schwierigkeit</label>
              <select id="difficulty" name="difficulty" required>${options(DIFFICULTIES, state.user.difficulty)}</select>
            </div>
            <div class="field">
              <label for="targetFights">Fights pro Quest</label>
              <input id="targetFights" name="targetFights" type="number" min="1" max="20" value="${escapeHtml(state.user.targetFights)}" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn primary" type="submit">BlockCoach starten</button>
          </div>
        </form>
      </section>
    </main>
  `;
}
