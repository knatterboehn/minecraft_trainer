import { SKILLS, SERVERS, DIFFICULTIES } from '../../state/defaults.js';
import { escapeHtml } from '../html.js';

function options(items, selected) {
  return items.map((item) => `<option value="${escapeHtml(item)}" ${item === selected ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('');
}

export function renderOnboarding(state) {
  return `
    <main class="onboarding-wrap">
      <section class="onboarding">
        <div class="hero">
          <p class="eyebrow">Minecraft Trainer</p>
          <h1>Trainiere wie eine Quest.</h1>
          <p>Daily Quest bekommen, Fights spielen, Bonus schaffen, Fortschritt sehen. Später vorbereitet für echte Minecraft-Daten.</p>
          <div class="hero-art" aria-hidden="true"><img src="./assets/player-platform.svg" alt="" loading="lazy" /></div>
        </div>
        <form class="card stack" data-form="onboarding">
          <div>
            <p class="eyebrow">Setup</p>
            <h2>Dein Profil</h2>
            <p>Nur das Nötigste. Keine langen Formulare.</p>
          </div>
          <div class="grid grid-2">
            <label class="field">Name
              <input name="name" required maxlength="40" placeholder="Vince" value="${escapeHtml(state.user.name)}" />
            </label>
            <label class="field">Hauptskill
              <select name="mainSkill">${options(SKILLS, state.user.mainSkill)}</select>
            </label>
            <label class="field">Server
              <select name="server">${options(SERVERS, state.user.server)}</select>
            </label>
            <label class="field">Schwierigkeit
              <select name="difficulty">${options(DIFFICULTIES, state.user.difficulty)}</select>
            </label>
            <label class="field">Fights pro Quest
              <input name="targetFights" type="number" min="1" max="20" value="${escapeHtml(state.user.targetFights)}" />
            </label>
          </div>
          <button class="btn primary" type="submit">App starten</button>
        </form>
      </section>
    </main>
  `;
}
