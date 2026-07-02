import assert from 'node:assert/strict';
import { createDefaultApp, STORAGE_KEY, todayISO } from '../src/state/defaults.js';
import { normalizeApp } from '../src/state/normalize.js';
import { createEvent, EVENT_TYPES, applyGameEvent } from '../src/domain/gameEvents.js';
import { calculateXpBreakdown, getLevel, getRank, getWinrate, recomputeProgress } from '../src/domain/progress.js';
import { deriveAnalysis } from '../src/domain/analysis.js';
import { getDailyQuestState, getLatestTodayQuest, getQuestWeek, getStreakMessage } from '../src/domain/questStatus.js';
import { renderApp } from '../src/ui/render.js';
import { escapeHtml } from '../src/ui/html.js';

global.document = { body: { dataset: {} } };

function event(type, payload = {}) {
  return createEvent(type, { source: 'test', ...payload });
}

function finishQuest(app, { wins = 0, losses = 0, training = 0, challenge = 0, issue = 'Weiß nicht', notes = '' } = {}) {
  applyGameEvent(app, event(EVENT_TYPES.QUEST_STARTED));
  for (let i = 0; i < wins; i += 1) applyGameEvent(app, event(EVENT_TYPES.FIGHT_WIN));
  for (let i = 0; i < losses; i += 1) applyGameEvent(app, event(EVENT_TYPES.FIGHT_LOSS));
  for (let i = 0; i < training; i += 1) applyGameEvent(app, event(EVENT_TYPES.FIGHT_TRAINING));
  for (let i = 0; i < challenge; i += 1) applyGameEvent(app, event(EVENT_TYPES.CHALLENGE_SUCCESS));
  applyGameEvent(app, event(EVENT_TYPES.REVIEW_SET, { issue }));
  applyGameEvent(app, event(EVENT_TYPES.NOTES_SET, { notes }));
  applyGameEvent(app, event(EVENT_TYPES.QUEST_FINISHED));
  recomputeProgress(app);
  app.analysis = deriveAnalysis(app.history);
  return app.history.at(-1);
}

function freshApp(name = 'Vince') {
  const app = createDefaultApp();
  app.user.name = name;
  return app;
}

function assertIncludes(haystack, needles, context) {
  for (const needle of needles) assert.match(haystack, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${context}: missing ${needle}`);
}

// Storage contract and default onboarding state.
assert.equal(STORAGE_KEY, 'minecraftTrainerApp');
assert.equal(normalizeApp({ user: { name: '   ' } }).ui.screen, 'onboarding');

// HTML escaping protects user-entered content in rendered output.
assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
const injected = normalizeApp({ user: { name: '<img src=x onerror=alert(1)>', mainSkill: 'Sword PvP', server: 'PvPClub' } });
injected.ui.screen = 'dashboard';
const injectedHtml = renderApp(injected);
assert.doesNotMatch(injectedHtml, /<img src=x onerror=alert\(1\)>/);
assert.match(injectedHtml, /&lt;img src=x onerror=alert\(1\)&gt;/);

// Normalize invalid import data without crashing or leaking invalid choices.
const normalized = normalizeApp({
  ui: { screen: 'dashboard' },
  user: { name: '  Vince  ', mainSkill: 'Invalid', server: 'Bad', difficulty: 'Impossible', targetFights: 999 },
  settings: { theme: 'rainbow', dataMode: 'bridge' },
  history: [
    { date: 'not-a-date', fights: 99 },
    { date: todayISO(), wins: 2, losses: 1, trainingFights: 1, challengeTarget: 3, challengeProgress: 3, challengeDone: false, xp: 0 }
  ],
  todayTraining: {
    activeSession: {
      date: '2000-01-01',
      fightEvents: [{ result: 'win' }],
      challengeTarget: 0,
      challengeProgress: 99
    }
  }
});
assert.equal(normalized.user.name, 'Vince');
assert.equal(normalized.user.mainSkill, 'Sword PvP');
assert.equal(normalized.user.server, 'PvPClub');
assert.equal(normalized.user.difficulty, 'Normal');
assert.equal(normalized.user.targetFights, 20);
assert.equal(normalized.settings.theme, 'emerald');
assert.equal(normalized.settings.dataMode, 'bridge');
assert.equal(normalized.history.length, 1);
assert.equal(normalized.history[0].challengeDone, true);
assert.equal(normalized.todayTraining.activeSession, null);

// Same-day active sessions are preserved, sanitized and safe to render.
const activeImport = normalizeApp({
  user: { name: 'Vince', mainSkill: 'Sword PvP', server: 'PvPClub', targetFights: 5 },
  todayTraining: {
    activeSession: {
      date: todayISO(),
      fightEvents: [{ result: 'win' }, { result: 'bad' }, { result: 'loss' }],
      challengeTarget: 0,
      challengeProgress: 99,
      notes: 'x'.repeat(800)
    }
  }
});
assert.equal(activeImport.todayTraining.activeSession.fights, 2);
assert.equal(activeImport.todayTraining.activeSession.challengeTarget, 3);
assert.equal(activeImport.todayTraining.activeSession.challengeProgress, 3);
assert.equal(activeImport.todayTraining.activeSession.notes.length, 500);
activeImport.ui.screen = 'training';
assert.match(renderApp(activeImport), /Quest läuft/);

// XP, level, rank and winrate formulas.
assert.deepEqual(calculateXpBreakdown({ fights: 4, wins: 2, losses: 1, challengeDone: true, streakBonus: true }), {
  completed: 100,
  wins: 60,
  losses: 10,
  challenge: 100,
  streak: 50,
  total: 320
});
assert.equal(getLevel(0), 1);
assert.equal(getLevel(999), 2);
assert.equal(getRank(0), 'Neu');
assert.equal(getRank(1500), 'Fortgeschritten');
assert.equal(getWinrate(2, 1), 67);
assert.equal(getWinrate(0, 0), 0);

// Quest lifecycle: open -> active -> completed.
const app = freshApp();
assert.equal(getDailyQuestState(app), 'open');
assert.match(renderApp(app), /Quest starten/);
applyGameEvent(app, event(EVENT_TYPES.QUEST_STARTED));
assert.equal(getDailyQuestState(app), 'active');
assert.equal(app.todayTraining.activeSession.fights, 0);
applyGameEvent(app, event(EVENT_TYPES.FIGHT_WIN));
applyGameEvent(app, event(EVENT_TYPES.FIGHT_LOSS));
applyGameEvent(app, event(EVENT_TYPES.FIGHT_TRAINING));
assert.equal(app.todayTraining.activeSession.fights, 3);
assert.equal(app.todayTraining.activeSession.wins, 1);
assert.equal(app.todayTraining.activeSession.losses, 1);
assert.equal(app.todayTraining.activeSession.trainingFights, 1);
applyGameEvent(app, event(EVENT_TYPES.FIGHT_UNDO));
assert.equal(app.todayTraining.activeSession.fights, 2);
assert.equal(app.todayTraining.activeSession.trainingFights, 0);
for (let i = 0; i < 10; i += 1) applyGameEvent(app, event(EVENT_TYPES.CHALLENGE_SUCCESS));
assert.equal(app.todayTraining.activeSession.challengeProgress, app.todayTraining.activeSession.challengeTarget);
assert.equal(app.todayTraining.activeSession.challengeDone, true);
for (let i = 0; i < 10; i += 1) applyGameEvent(app, event(EVENT_TYPES.CHALLENGE_DECREMENT));
assert.equal(app.todayTraining.activeSession.challengeProgress, 0);
assert.equal(app.todayTraining.activeSession.challengeDone, false);
applyGameEvent(app, event(EVENT_TYPES.CHALLENGE_SUCCESS));
applyGameEvent(app, event(EVENT_TYPES.REVIEW_SET, { issue: 'Aim' }));
applyGameEvent(app, event(EVENT_TYPES.NOTES_SET, { notes: 'Timing prüfen' }));
applyGameEvent(app, event(EVENT_TYPES.QUEST_FINISHED));
recomputeProgress(app);
app.analysis = deriveAnalysis(app.history);
assert.equal(app.history.length, 1);
assert.equal(getDailyQuestState(app), 'completed');
assert.equal(getLatestTodayQuest(app).mainIssue, 'Aim');
assert.match(getStreakMessage(app), /Streak gesichert/);
assert.equal(app.progress.fights, 2);
assert.equal(app.progress.wins, 1);
assert.equal(app.progress.losses, 1);

// Finishing without a fight does not create a broken active quest.
const noFightApp = freshApp();
applyGameEvent(noFightApp, event(EVENT_TYPES.QUEST_FINISHED));
assert.equal(noFightApp.history.length, 0);
assert.equal(noFightApp.todayTraining.activeSession, null);
applyGameEvent(noFightApp, event(EVENT_TYPES.QUEST_STARTED));
applyGameEvent(noFightApp, event(EVENT_TYPES.QUEST_FINISHED));
assert.equal(noFightApp.history.length, 0);
assert.equal(noFightApp.todayTraining.activeSession, null);

// Same-day extra quest is saved but does not grant another streak bonus.
const sameDayApp = freshApp();
const first = finishQuest(sameDayApp, { wins: 2, losses: 1, training: 1, challenge: 3, issue: 'Positioning' });
const second = finishQuest(sameDayApp, { wins: 1, losses: 0, training: 0, challenge: 0, issue: 'Aim' });
assert.equal(first.streakBonus, true);
assert.equal(first.xp, 320);
assert.equal(second.streakBonus, false);
assert.equal(second.xp, 130);
assert.equal(sameDayApp.progress.streak, 1);
assert.equal(sameDayApp.progress.xp, 450);

// Multi-day streaks: duplicate days do not inflate; gaps reset.
const streakApp = freshApp();
streakApp.history = [
  { date: '2026-07-01', wins: 1, losses: 0, fights: 1, xp: 130, challengeDone: false },
  { date: '2026-07-01', wins: 1, losses: 0, fights: 1, xp: 130, challengeDone: false },
  { date: '2026-07-02', wins: 1, losses: 0, fights: 1, xp: 130, challengeDone: false },
  { date: '2026-07-04', wins: 1, losses: 0, fights: 1, xp: 130, challengeDone: false }
];
recomputeProgress(streakApp);
assert.equal(streakApp.progress.streak, 1);
assert.equal(streakApp.progress.lastQuestDate, '2026-07-04');

// Analysis uses real saved data and avoids fake diagnosis on empty history.
assert.match(deriveAnalysis([]).nextFocus, /erste Daily Quest/);
const analysis = deriveAnalysis([
  { skill: 'Sword PvP', fights: 6, wins: 5, losses: 1, challengeDone: true, mainIssue: 'Aim' },
  { skill: 'Sword PvP', fights: 6, wins: 1, losses: 5, challengeDone: false, mainIssue: 'Aim' },
  { skill: 'Bow', fights: 6, wins: 1, losses: 5, challengeDone: false, mainIssue: 'Movement' }
]);
assert.match(analysis.nextFocus, /Aim/);
assert.ok(analysis.reviewZones.length >= 1);

// Render smoke tests across all app states and screens.
const renderStates = [];
const open = freshApp();
renderStates.push(['open-dashboard', open, 'dashboard', ['🎯', 'Daily Quest', 'Quest starten']]);
const active = freshApp();
applyGameEvent(active, event(EVENT_TYPES.QUEST_STARTED));
applyGameEvent(active, event(EVENT_TYPES.FIGHT_WIN));
renderStates.push(['active-training', active, 'training', ['⚔️ Fight Log', 'Kurz-Review', 'Quest abschließen']]);
const done = freshApp();
finishQuest(done, { wins: 2, losses: 1, training: 1, challenge: 3, issue: 'Decision' });
renderStates.push(['done-dashboard', done, 'dashboard', ['✅ Heute erledigt', 'Streak gesichert', 'Fortschritt ansehen']]);
renderStates.push(['done-training-summary', done, 'training', ['✅ Quest abgeschlossen', 'Quest-Verlauf ansehen', 'Nächster Fokus']]);
renderStates.push(['progress', done, 'progress', ['Quest-Verlauf', 'Diese Woche', 'Abgeschlossene Quests']]);
renderStates.push(['analysis', done, 'analysis', ['Nächster Fokus', 'Darauf achten', 'Starke Muster']]);
renderStates.push(['profile', done, 'profile', ['Export / Import', 'App zurücksetzen', 'Fights pro Quest']]);

for (const [name, state, screen, needles] of renderStates) {
  state.ui.screen = screen;
  const html = renderApp(state);
  assertIncludes(html, needles, name);
  assert.doesNotMatch(html, /undefined|NaN|\[object Object\]/, `${name}: rendered invalid value`);
}

// Concept language gate: no old duplicate terms in user-facing screens.
for (const state of [open, active, done]) {
  for (const screen of ['dashboard', 'training', 'progress', 'analysis', 'profile']) {
    state.ui.screen = screen;
    const html = renderApp(state);
    assert.doesNotMatch(html, /Tages-Challenge|Coach-Check|Gespeicherte Sessions|Matches gespeichert|Training öffnen/);
  }
}

// Week view always has seven days and marks today.
const week = getQuestWeek(done);
assert.equal(week.length, 7);
assert.equal(week.filter((day) => day.today).length, 1);

console.log('Regression tests passed: data safety, quest loop, gamification states, render states and concept language are consistent.');
