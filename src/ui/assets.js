import { escapeHtml } from './html.js';

const assets = {
  runner: './assets/player-wave.svg',
  main: './assets/player-wave.svg',
  pig: './assets/player-pig.svg',
  creeper: './assets/creeper-angry.svg',
  ghast: './assets/ghast-fire.svg',
  diamonds: './assets/player-diamonds.svg',
  loot: './assets/player-diamonds.svg',
  reward: './assets/player-diamonds.svg',
  torch: './assets/player-ghast-torch.svg',
  platform: './assets/player-platform.svg',
  laugh: './assets/player-laugh.svg',
  sleep: './assets/player-platform.svg',
  focus: './assets/player-ghast-torch.svg'
};

export function art(name, className = 'app-art') {
  const src = assets[name] || assets.runner;
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(src)}" alt="" loading="lazy" aria-hidden="true" />`;
}
