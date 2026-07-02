import { escapeHtml } from '../html.js';

function questVisual() {
  return `
    <div class="quest-visual" aria-hidden="true">
      <img class="quest-art quest-art-main" src="./assets/player-wave.svg" alt="" loading="lazy" />
      <img class="quest-art quest-art-rival" src="./assets/creeper-angry.svg" alt="" loading="lazy" />
      <img class="quest-art quest-art-bonus" src="./assets/player-diamonds.svg" alt="" loading="lazy" />
      <img class="quest-art quest-art-ghast" src="./assets/ghast-fire.svg" alt="" loading="lazy" />
    </div>
  `;
}

export function questCard(quest, actionLabel = 'Quest starten') {
  return `
    <section class="card quest-card">
      <div class="quest-copy">
        <p class="eyebrow">Daily Quest</p>
        <h2 class="quest-title">${escapeHtml(quest.title)}</h2>
        <p>${escapeHtml(`Spiele auf ${quest.server}. Fokus: ${quest.focus}`)}</p>
      </div>
      <div class="row quest-meta">
        <span class="tag accent">${escapeHtml(quest.skill)}</span>
        <span class="tag">${escapeHtml(quest.server)}</span>
        <span class="tag">${escapeHtml(`${quest.targetFights} Fights`)}</span>
      </div>
      <div class="card compact quest-challenge">
        <p class="eyebrow">Bonus Challenge</p>
        <h3>${escapeHtml(quest.challenge.label)}</h3>
        <p>${escapeHtml(`Ziel: ${quest.challenge.target} Erfolge`)}</p>
      </div>
      <div class="quest-hints">
        ${quest.hints.map((hint) => `<span class="tag">${escapeHtml(hint)}</span>`).join('')}
      </div>
      <button class="btn primary quest-action" data-action="start-quest">${escapeHtml(actionLabel)}</button>
      ${questVisual()}
    </section>
  `;
}
