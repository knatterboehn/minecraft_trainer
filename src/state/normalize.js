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

  return {
    id: safeString(entry.id, `session-${date}-${Math.random().toString(16).slice(2)}`),
    date,
    questId: safeString(entry.questId, ''),
    skill: safeString(entry.skill, 'Allround'),
    server: safeString(entry.server, 'PvPClub'),
    focus: safeString(entry.focus, ''),
    targetFights: Math.max(1, Math.min(20, Number(entry.targetFights || fights || 5))),
    challengeLabel: safeString(entry.challengeLabel, 'Bonus Challenge'),
    challengeTarget: Math.max(1, Math.min(20, Number(entry.challengeTarget || 1))),
    challengeProgress: Math.max(0, Number(entry.challengeProgress || 0)),
    challengeDone: Boolean(entry.challengeDone),
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

  base.todayTraining = {
    date: todayISO(),
    quest: createDailyQuest(base.user),
    activeSession: source.todayTraining?.activeSession || null
  };

  base.history = Array.isArray(source.history) ? source.history.map(normalizeSession).filter(Boolean) : [];
  base.events = Array.isArray(source.events) ? source.events.filter((event) => event && typeof event === 'object') : [];

  recomputeProgress(base);
  base.analysis = deriveAnalysis(base.history);

  if (!base.user.name) base.ui.screen = 'onboarding';
  return base;
}
