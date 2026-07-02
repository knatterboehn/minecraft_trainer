import { calculateXpBreakdown } from './progress.js';

export const EVENT_TYPES = {
  QUEST_STARTED: 'quest_started',
  FIGHT_WIN: 'fight_win',
  FIGHT_LOSS: 'fight_loss',
  FIGHT_TRAINING: 'fight_training',
  FIGHT_UNDO: 'fight_undo',
  CHALLENGE_SUCCESS: 'challenge_success',
  CHALLENGE_DECREMENT: 'challenge_decrement',
  REVIEW_SET: 'review_set',
  NOTES_SET: 'notes_set',
  QUEST_FINISHED: 'quest_finished'
};

export function createEvent(type, payload = {}) {
  return {
    id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    source: payload.source || 'manual'
  };
}

function createActiveSession(quest) {
  return {
    id: `session-${Date.now()}`,
    date: quest.date,
    questId: quest.id,
    skill: quest.skill,
    server: quest.server,
    focus: quest.focus,
    targetFights: quest.targetFights,
    challengeLabel: quest.challenge.label,
    challengeTarget: quest.challenge.target,
    challengeProgress: 0,
    challengeDone: false,
    fightEvents: [],
    fights: 0,
    wins: 0,
    losses: 0,
    trainingFights: 0,
    mainIssue: 'Weiß nicht',
    notes: '',
    startedAt: new Date().toISOString(),
    completedAt: null
  };
}

function ensureSession(app) {
  if (!app.todayTraining.activeSession) {
    app.todayTraining.activeSession = createActiveSession(app.todayTraining.quest);
  }
  return app.todayTraining.activeSession;
}

function recalcSession(session) {
  const wins = session.fightEvents.filter((fight) => fight.result === 'win').length;
  const losses = session.fightEvents.filter((fight) => fight.result === 'loss').length;
  const trainingFights = session.fightEvents.filter((fight) => fight.result === 'training').length;
  session.wins = wins;
  session.losses = losses;
  session.trainingFights = trainingFights;
  session.fights = wins + losses + trainingFights;
  session.challengeDone = session.challengeProgress >= session.challengeTarget;
  return session;
}

export function applyGameEvent(app, event) {
  app.events.push(event);

  if (event.type === EVENT_TYPES.QUEST_STARTED) {
    app.todayTraining.activeSession = createActiveSession(app.todayTraining.quest);
    return app;
  }

  if (event.type === EVENT_TYPES.QUEST_FINISHED && !app.todayTraining.activeSession) {
    app.ui.lastSummaryId = null;
    return app;
  }

  const session = ensureSession(app);

  if (event.type === EVENT_TYPES.FIGHT_WIN || event.type === EVENT_TYPES.FIGHT_LOSS || event.type === EVENT_TYPES.FIGHT_TRAINING) {
    const result = event.type === EVENT_TYPES.FIGHT_WIN ? 'win' : event.type === EVENT_TYPES.FIGHT_LOSS ? 'loss' : 'training';
    session.fightEvents.push({
      id: event.id,
      result,
      createdAt: event.createdAt
    });
    recalcSession(session);
  }

  if (event.type === EVENT_TYPES.FIGHT_UNDO) {
    session.fightEvents.pop();
    recalcSession(session);
  }

  if (event.type === EVENT_TYPES.CHALLENGE_SUCCESS) {
    session.challengeProgress = Math.min(session.challengeTarget, session.challengeProgress + 1);
    recalcSession(session);
  }

  if (event.type === EVENT_TYPES.CHALLENGE_DECREMENT) {
    session.challengeProgress = Math.max(0, session.challengeProgress - 1);
    recalcSession(session);
  }

  if (event.type === EVENT_TYPES.REVIEW_SET) {
    session.mainIssue = event.payload.issue || 'Weiß nicht';
  }

  if (event.type === EVENT_TYPES.NOTES_SET) {
    session.notes = String(event.payload.notes || '').slice(0, 500);
  }

  if (event.type === EVENT_TYPES.QUEST_FINISHED) {
    recalcSession(session);
    if (session.fights <= 0) {
      app.ui.lastSummaryId = null;
      app.todayTraining.activeSession = null;
      return app;
    }
    const alreadyCompletedToday = app.history.some((entry) => entry.date === session.date);
    const sessionToSave = {
      ...session,
      completedAt: new Date().toISOString(),
      streakBonus: !alreadyCompletedToday
    };
    sessionToSave.xpBreakdown = calculateXpBreakdown(sessionToSave);
    sessionToSave.xp = sessionToSave.xpBreakdown.total;
    app.history.push(sessionToSave);
    app.ui.lastSummaryId = sessionToSave.id;
    app.todayTraining.activeSession = null;
  }

  return app;
}
