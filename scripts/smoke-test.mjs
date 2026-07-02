import assert from 'node:assert/strict';
import { createDefaultApp, STORAGE_KEY } from '../src/state/defaults.js';
import { createEvent, EVENT_TYPES, applyGameEvent } from '../src/domain/gameEvents.js';
import { recomputeProgress } from '../src/domain/progress.js';
import { deriveAnalysis } from '../src/domain/analysis.js';
import { getDailyQuestState, getLatestTodayQuest, getStreakMessage } from '../src/domain/questStatus.js';
import { renderApp } from '../src/ui/render.js';

global.document = { body: { dataset: {} } };

const app = createDefaultApp();
assert.equal(STORAGE_KEY, 'minecraftTrainerApp');
assert.equal(app.history.length, 0);
app.user.name = 'Vince';
app.ui.screen = 'dashboard';
assert.equal(getDailyQuestState(app), 'open');
assert.match(renderApp(app), /Quest starten/);

applyGameEvent(app, createEvent(EVENT_TYPES.QUEST_STARTED));
assert.ok(app.todayTraining.activeSession);
assert.equal(getDailyQuestState(app), 'active');
app.ui.screen = 'training';
assert.match(renderApp(app), /Fight Log/);

applyGameEvent(app, createEvent(EVENT_TYPES.FIGHT_WIN));
applyGameEvent(app, createEvent(EVENT_TYPES.FIGHT_WIN));
applyGameEvent(app, createEvent(EVENT_TYPES.FIGHT_LOSS));
applyGameEvent(app, createEvent(EVENT_TYPES.FIGHT_TRAINING));
applyGameEvent(app, createEvent(EVENT_TYPES.CHALLENGE_SUCCESS));
applyGameEvent(app, createEvent(EVENT_TYPES.CHALLENGE_SUCCESS));
applyGameEvent(app, createEvent(EVENT_TYPES.CHALLENGE_SUCCESS));
applyGameEvent(app, createEvent(EVENT_TYPES.REVIEW_SET, { issue: 'Positioning' }));
applyGameEvent(app, createEvent(EVENT_TYPES.NOTES_SET, { notes: 'Zu früh committed' }));
applyGameEvent(app, createEvent(EVENT_TYPES.QUEST_FINISHED));

assert.equal(app.history.length, 1);
const saved = app.history[0];
assert.equal(saved.fights, 4);
assert.equal(saved.wins, 2);
assert.equal(saved.losses, 1);
assert.equal(saved.trainingFights, 1);
assert.equal(saved.challengeDone, true);
assert.equal(saved.mainIssue, 'Positioning');
assert.equal(saved.xp, 320);
assert.equal(getDailyQuestState(app), 'completed');
assert.equal(getLatestTodayQuest(app).id, saved.id);
assert.match(getStreakMessage(app), /Streak gesichert/);

recomputeProgress(app);
assert.equal(app.progress.fights, 4);
assert.equal(app.progress.wins, 2);
assert.equal(app.progress.losses, 1);
assert.equal(app.progress.challengesDone, 1);
assert.equal(app.progress.xp, 320);

const analysis = deriveAnalysis(app.history);
assert.match(analysis.nextFocus, /Positioning/);
app.analysis = analysis;

app.ui.screen = 'dashboard';
assert.match(renderApp(app), /Heute erledigt/);
app.ui.screen = 'progress';
assert.match(renderApp(app), /Quest-Verlauf/);
app.ui.screen = 'analysis';
assert.match(renderApp(app), /Nächster Fokus/);

console.log('Smoke test passed: Quest completion, gamification loop and Progress UI are consistent.');
