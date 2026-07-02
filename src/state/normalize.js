import { APP_VERSION, createDefaultApp, SKILLS, SERVERS, DIFFICULTIES, THEMES, todayISO } from './defaults.js';
import { createDailyQuest } from '../domain/quest.js';
import { recomputeProgress } from '../domain/progress.js';
import { deriveAnalysis } from '../domain/analysis.js';

function safeString(value, fallback = '') {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function safeChoice(value, list, fallback) {
  return list.includes(value) ? value : fallback;
}

function validDate(value) {
  if (typeof value !== 'string') return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && value.length === 10;
}

function normalizeSession(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const date = validDate(entry.date) ? entry.date : null;
  if (!date) return null;
  const fights = Math.max(0, Number(entry.fights || 0));
  const wins = Math.max(0, Number(entry.wins || 0));
  const losses = Math.max(0, Number(entry.losses || 0));
  const trainingFights = Math.max(0, Number(entry.trainingFights || Math.max(0, fights - wins - losses)));
  const challengeTarget = Math.max(1, Math.min(20, Number(entry.challengeTarget || 1)));
  const challengeProgress = Math.max(0, Math.min(challengeTarget, Number(entry.challengeProgress || 0)));

  return {
    id: safeString(entry.id, `session-${date}-${Math.random().toString(16).slice(2)}`),
    date,
    questId: safeString(entry.questId, ''),
    skill: safeString(entry.skill, 'Allround'),
    server: safeString(entry.server, 'PvPClub'),
    focus: safeString(entry.focus, ''),
    targetFights: Math.max(1, Math.min(20, Number(entry.targetFights || fights || 5))),
    challengeLabel: safeString(entry.challengeLabel, 'Bonus Challenge'),
    challengeTarget,
    challengeProgress,
    challengeDone: Boolean(entry.challengeDone) || challengeProgress >= challengeTarget,
    fightEvents: Array.isArray(entry.fightEvents) ? entry.fightEvents : [],
    fights: wins + losses + trainingFights || fights,
    wins,
    losses,
    trainingFights,
    mainIssue: safeString(entry.mainIssue, 'Weiß nicht'),
    notes: safeString(entry.notes, '').slice(0, 500),
    startedAt: safeString(entry.startedAt, ''),
    completedAt: safeString(entry.completedAt, ''),
    streakBonus: Boolean(entry.streakBonus),
    xpBreakdown: entry.xpBreakdown || null,
    xp: Math.max(0, Number(entry.xp || entry.xpBreakdown?.total || 0))
  };
}


function normalizeActiveSession(entry, quest, today) {
  if (!entry || typeof entry !== 'object') return null;
  const date = validDate(entry.date) ? entry.date : today;
  if (date !== today) return null;

  const fightEvents = Array.isArray(entry.fightEvents)
    ? entry.fightEvents
        .filter((fight) => fight && ['win', 'loss', 'training'].includes(fight.result))
        .map((fight, index) => ({
          id: safeString(fight.id, `fight-${date}-${index}`),
          result: fight.result,
          createdAt: safeString(fight.createdAt, '')
        }))
    : [];

  const wins = fightEvents.filter((fight) => fight.result === 'win').length;
  const losses = fightEvents.filter((fight) => fight.result === 'loss').length;
  const trainingFights = fightEvents.filter((fight) => fight.result === 'training').length;
  const challengeTarget = Math.max(1, Math.min(20, Number(entry.challengeTarget || quest.challenge.target || 1)));
  const challengeProgress = Math.max(0, Math.min(challengeTarget, Number(entry.challengeProgress || 0)));

  return {
    id: safeString(entry.id, `session-${date}`),
    date,
    questId: safeString(entry.questId, quest.id),
    skill: safeString(entry.skill, quest.skill),
    server: safeString(entry.server, quest.server),
    focus: safeString(entry.focus, quest.focus),
    targetFights: Math.max(1, Math.min(20, Number(entry.targetFights || quest.targetFights || 5))),
    challengeLabel: safeString(entry.challengeLabel, quest.challenge.label),
    challengeTarget,
    challengeProgress,
    challengeDone: Boolean(entry.challengeDone) || challengeProgress >= challengeTarget,
    fightEvents,
    fights: wins + losses + trainingFights,
    wins,
    losses,
    trainingFights,
    mainIssue: safeString(entry.mainIssue, 'Weiß nicht'),
    notes: safeString(entry.notes, '').slice(0, 500),
    startedAt: safeString(entry.startedAt, ''),
    completedAt: null
  };
}

export function normalizeApp(raw) {
  const base = createDefaultApp();
  const source = raw && typeof raw === 'object' ? raw : {};

  base.meta = {
    version: APP_VERSION,
    createdAt: safeString(source.meta?.createdAt, base.meta.createdAt),
    updatedAt: new Date().toISOString()
  };

  base.ui = {
    screen: safeString(source.ui?.screen, 'dashboard'),
    lastSummaryId: source.ui?.lastSummaryId || null
  };

  base.user = {
    name: safeString(source.user?.name, ''),
    mainSkill: safeChoice(source.user?.mainSkill, SKILLS, 'Sword PvP'),
    server: safeChoice(source.user?.server, SERVERS, 'PvPClub'),
    difficulty: safeChoice(source.user?.difficulty, DIFFICULTIES, 'Normal'),
    targetFights: Math.max(1, Math.min(20, Number(source.user?.targetFights || 5)))
  };

  base.settings = {
    theme: safeChoice(source.settings?.theme, THEMES, 'emerald'),
    dataMode: source.settings?.dataMode === 'bridge' ? 'bridge' : 'manual'
  };

  const today = todayISO();
  const quest = createDailyQuest(base.user);
  base.todayTraining = {
    date: today,
    quest,
    activeSession: normalizeActiveSession(source.todayTraining?.activeSession, quest, today)
  };

  base.history = Array.isArray(source.history) ? source.history.map(normalizeSession).filter(Boolean) : [];
  base.events = Array.isArray(source.events) ? source.events.filter((event) => event && typeof event === 'object') : [];

  recomputeProgress(base);
  base.analysis = deriveAnalysis(base.history);

  if (!base.user.name) base.ui.screen = 'onboarding';
  return base;
}
