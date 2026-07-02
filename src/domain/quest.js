function todayISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

const focusBySkill = {
  'Sword PvP': 'Nicht blind W-keyen. Nach dem ersten Hit bewusst Abstand resetten.',
  Bow: 'Ruhig aimen. Erst Strafing lesen, dann schießen.',
  Mace: 'Nicht panic-droppen. Setup vorbereiten, dann committen.',
  UHC: 'Healing und Commit bewusst entscheiden, nicht autopiloten.',
  Bedwars: 'First Rush klar spielen. Kein unnötiges Risiko beim Void.',
  Allround: 'Nur einen Fokus pro Fight setzen und danach kurz bewerten.'
};

const challengeBySkill = {
  'Sword PvP': { label: 'Schaffe 3 bewusste Abstand-Resets.', target: 3 },
  Bow: { label: 'Treffe 3 saubere Opening-Shots.', target: 3 },
  Mace: { label: 'Schaffe 2 vorbereitete Mace-Setups.', target: 2 },
  UHC: { label: 'Triff 3 klare Heal-Entscheidungen.', target: 3 },
  Bedwars: { label: 'Gewinne 2 First-Rush-Situationen.', target: 2 },
  Allround: { label: 'Halte deinen Fokus in 3 Fights bewusst ein.', target: 3 }
};

const hintsBySkill = {
  'Sword PvP': ['Vor Fight: Hotbar bereit?', 'Im Fight: Abstand nach erstem Hit?', 'Nach Fight: Warum verloren?'],
  Bow: ['Vor Fight: Crosshair ruhig?', 'Im Fight: Strafing lesen', 'Nach Fight: Hast du gepanikt?'],
  Mace: ['Vor Fight: Escape geplant?', 'Im Fight: Drop nicht erzwingen', 'Nach Fight: War das Setup vorbereitet?'],
  UHC: ['Vor Fight: Healing ready?', 'Im Fight: Commit bewusst?', 'Nach Fight: Warst du zu greedy?'],
  Bedwars: ['Vor Fight: First Rush Plan?', 'Im Fight: Void-Risiko prüfen', 'Nach Fight: War der Trade sinnvoll?'],
  Allround: ['Vor Fight: ein Fokus', 'Im Fight: ruhig bleiben', 'Nach Fight: einen Fehler merken']
};

export function createDailyQuest(user) {
  const skill = user?.mainSkill || 'Sword PvP';
  const server = user?.server || 'PvPClub';
  const targetFights = Number.isFinite(Number(user?.targetFights)) ? Math.max(1, Math.min(20, Number(user.targetFights))) : 5;
  const challenge = challengeBySkill[skill] || challengeBySkill.Allround;

  return {
    id: `quest-${todayISO()}-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    date: todayISO(),
    title: `${targetFights} ${skill}-Fights`,
    skill,
    server,
    targetFights,
    focus: focusBySkill[skill] || focusBySkill.Allround,
    challenge: {
      label: challenge.label,
      target: challenge.target,
      progress: 0
    },
    hints: hintsBySkill[skill] || hintsBySkill.Allround
  };
}

export function ensureTodayQuest(app) {
  const today = todayISO();
  if (!app.todayTraining || app.todayTraining.date !== today || !app.todayTraining.quest) {
    app.todayTraining = {
      date: today,
      quest: createDailyQuest(app.user),
      activeSession: null
    };
  }
  return app.todayTraining.quest;
}
