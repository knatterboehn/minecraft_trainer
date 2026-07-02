import { escapeHtml } from '../html.js';

function questVisual() {
  return `
    <div class="quest-visual" aria-hidden="true">
      <span class="hero-crystal"></span>
      <span class="hero-ghast"></span>
      <span class="hero-mob"></span>
      <span class="hero-rival"></span>
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
      <button class="btn primary quest-action" data-action="start-quest">${escapeHtml(actionLabel)}</button>
      ${questVisual()}
    </section>
  `;
}
