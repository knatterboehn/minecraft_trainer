import { getState, subscribe, patchState, dispatchEvent, resetApp, exportApp, importApp } from './state/store.js';
import { createDailyQuest } from './domain/quest.js';
import { createEvent, EVENT_TYPES } from './domain/gameEvents.js';
import { renderApp } from './ui/render.js';

const root = document.querySelector('#app');
const toast = document.querySelector('#toast');
let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function render() {
  root.innerHTML = renderApp(getState());
}

subscribe(render);
render();

function navigate(screen) {
  patchState((state) => {
    state.ui.screen = screen;
  });
}

function startQuest() {
  dispatchEvent(createEvent(EVENT_TYPES.QUEST_STARTED, { source: 'manual' }));
  patchState((state) => {
    state.ui.screen = 'training';
    state.ui.lastSummaryId = null;
  });
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function updateProfileFromForm(form, targetScreen) {
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  if (!name) {
    showToast('Bitte gib einen Namen ein. Nur Leerzeichen zählen nicht.');
    return;
  }

  patchState((state) => {
    state.user.name = name;
    state.user.mainSkill = String(data.get('mainSkill') || state.user.mainSkill);
    state.user.server = String(data.get('server') || state.user.server);
    state.user.difficulty = String(data.get('difficulty') || state.user.difficulty);
    state.user.targetFights = Math.max(1, Math.min(20, Number(data.get('targetFights') || 5)));
    if (data.has('theme')) state.settings.theme = String(data.get('theme'));
    state.todayTraining.quest = createDailyQuest(state.user);
    state.ui.screen = targetScreen;
  });

  showToast(targetScreen === 'dashboard' ? 'Profil erstellt.' : 'Profil gespeichert.');
}

root.addEventListener('click', (event) => {
  const screenButton = event.target.closest('[data-screen]');
  if (screenButton) {
    const clearSummary = screenButton.dataset.action === 'clear-summary';
    patchState((state) => {
      if (clearSummary) state.ui.lastSummaryId = null;
      state.ui.screen = screenButton.dataset.screen;
    });
    return;
  }

  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  const action = actionButton.dataset.action;

  if (action === 'start-quest') startQuest();
  if (action === 'fight-win') dispatchEvent(createEvent(EVENT_TYPES.FIGHT_WIN, { source: 'manual' }));
  if (action === 'fight-loss') dispatchEvent(createEvent(EVENT_TYPES.FIGHT_LOSS, { source: 'manual' }));
  if (action === 'fight-training') dispatchEvent(createEvent(EVENT_TYPES.FIGHT_TRAINING, { source: 'manual' }));
  if (action === 'fight-undo') dispatchEvent(createEvent(EVENT_TYPES.FIGHT_UNDO, { source: 'manual' }));
  if (action === 'challenge-success') dispatchEvent(createEvent(EVENT_TYPES.CHALLENGE_SUCCESS, { source: 'manual' }));
  if (action === 'challenge-decrement') dispatchEvent(createEvent(EVENT_TYPES.CHALLENGE_DECREMENT, { source: 'manual' }));
  if (action === 'set-issue') dispatchEvent(createEvent(EVENT_TYPES.REVIEW_SET, { issue: actionButton.dataset.issue, source: 'manual' }));
  if (action === 'finish-quest') {
    const notes = root.querySelector('[data-input="notes"]')?.value || '';
    dispatchEvent(createEvent(EVENT_TYPES.NOTES_SET, { notes, source: 'manual' }));
    dispatchEvent(createEvent(EVENT_TYPES.QUEST_FINISHED, { source: 'manual' }));
    showToast('Quest gespeichert.');
  }
  if (action === 'export-data') {
    download('minecraft-trainer-export.json', exportApp());
    showToast('Export erstellt.');
  }
  if (action === 'reset-app') {
    if (confirm('App wirklich zurücksetzen? Exportiere vorher, wenn du deine Daten behalten willst.')) {
      resetApp();
      showToast('App zurückgesetzt.');
    }
  }
});

root.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.matches('[data-form="onboarding"]')) updateProfileFromForm(form, 'dashboard');
  if (form.matches('[data-form="profile"]')) updateProfileFromForm(form, 'profile');
});

root.addEventListener('change', async (event) => {
  const input = event.target;
  if (input.matches('[data-input="import"]') && input.files?.[0]) {
    try {
      const text = await input.files[0].text();
      importApp(text);
      showToast('Import erfolgreich.');
    } catch (error) {
      showToast('Import fehlgeschlagen. Bitte gültige Export-Datei wählen.');
    }
  }
});
