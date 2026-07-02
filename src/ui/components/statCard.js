import { escapeHtml } from '../html.js';
import { art } from '../assets.js';

export function statCard(label, value, sub = '', icon = '') {
  return `
    <article class="card compact metric">
      ${icon ? `<div class="metric-art" aria-hidden="true">${art(icon)}</div>` : ''}
      <div class="metric-label"><span>${escapeHtml(label)}</span></div>
      <div>
        <p class="metric-value">${escapeHtml(String(value))}</p>
        ${sub ? `<div class="metric-sub">${escapeHtml(sub)}</div>` : ''}
      </div>
    </article>
  `;
}
