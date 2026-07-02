import { escapeHtml } from '../html.js';

export function statCard(label, value, sub = '') {
  return `
    <article class="card compact stat">
      <span class="stat-label">${escapeHtml(label)}</span>
      <strong class="stat-value">${escapeHtml(String(value))}</strong>
      ${sub ? `<span class="stat-sub">${escapeHtml(sub)}</span>` : ''}
    </article>
  `;
}
