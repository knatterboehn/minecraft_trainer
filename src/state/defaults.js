import { createDailyQuest } from '../domain/quest.js';
import { createDefaultBridgeState } from '../integrations/minecraftBridgeAdapter.js';

export const APP_VERSION = '0.59';
export const STORAGE_KEY = 'minecraftTrainerApp';

export const SKILLS = ['Sword PvP', 'Bow', 'Mace', 'UHC', 'Bedwars', 'Allround'];
export const SERVERS = ['PvPClub', 'Hoplite', 'Minemen', 'Cubecraft', 'Hypixel', 'Anderer Server'];
export const DIFFICULTIES = ['Locker', 'Normal', 'Schwer'];
export const THEMES = ['emerald', 'redstone', 'diamond', 'amethyst', 'netherite'];

export function todayISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function createDefaultApp() {
  const user = {
    name: '',
    mainSkill: 'Sword PvP',
    server: 'PvPClub',
    difficulty: 'Normal',
    targetFights: 5
  };

  return {
    meta: {
      version: APP_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ui: {
      screen: 'dashboard',
      lastSummaryId: null
    },
    user,
    settings: {
      theme: 'emerald',
      dataMode: 'manual'
    },
    progress: {
      xp: 0,
      level: 1,
      rank: 'Neu',
      streak: 0,
      lastQuestDate: null,
      wins: 0,
      losses: 0,
      fights: 0,
      challengesDone: 0
    },
    todayTraining: {
      date: todayISO(),
      quest: createDailyQuest(user),
      activeSession: null
    },
    analysis: {
      strengths: [],
      reviewZones: [],
      nextFocus: 'Starte deine erste Daily Quest.'
    },
    history: [],
    events: [],
    integrations: {
      minecraftBridge: createDefaultBridgeState()
    }
  };
}
