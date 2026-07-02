const RANKS = [
  { name: 'Legend', xp: 15000 },
  { name: 'Pro', xp: 8000 },
  { name: 'Elite', xp: 4000 },
  { name: 'Fortgeschritten', xp: 1500 },
  { name: 'Neu', xp: 0 }
];

export function getLevel(xp) {
  return 1 + Math.floor(Math.max(0, Number(xp) || 0) / 500);
}

export function getRank(xp) {
  const safeXp = Math.max(0, Number(xp) || 0);
  return RANKS.find((rank) => safeXp >= rank.xp)?.name || 'Neu';
}

export function calculateXpBreakdown(session) {
  const fights = Number(session?.fights || 0);
  const wins = Number(session?.wins || 0);
  const losses = Number(session?.losses || 0);
  const challengeDone = Boolean(session?.challengeDone);
  const streakBonus = Boolean(session?.streakBonus);

  const completed = fights > 0 ? 100 : 0;
  const winXp = wins * 30;
  const lossXp = losses * 10;
  const challengeXp = challengeDone ? 100 : 0;
  const streakXp = streakBonus ? 50 : 0;
  const total = completed + winXp + lossXp + challengeXp + streakXp;

  return {
    completed,
    wins: winXp,
    losses: lossXp,
    challenge: challengeXp,
    streak: streakXp,
    total
  };
}

function isValidDate(value) {
  if (typeof value !== 'string') return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function daysBetween(a, b) {
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.round((end - start) / 86400000);
}

export function recomputeProgress(app) {
  const history = Array.isArray(app.history) ? app.history : [];
  const sorted = history.filter((entry) => isValidDate(entry.date)).sort((a, b) => a.date.localeCompare(b.date));

  let xp = 0;
  let wins = 0;
  let losses = 0;
  let fights = 0;
  let challengesDone = 0;
  let streak = 0;
  let lastDate = null;

  sorted.forEach((entry) => {
    xp += Number(entry.xp || entry.xpBreakdown?.total || 0);
    wins += Number(entry.wins || 0);
    losses += Number(entry.losses || 0);
    fights += Number(entry.fights || 0);
    if (entry.challengeDone) challengesDone += 1;

    if (lastDate === null) {
      streak = 1;
    } else if (entry.date === lastDate) {
      // same day does not increase streak
    } else if (daysBetween(lastDate, entry.date) === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
    lastDate = entry.date;
  });

  app.progress = {
    xp,
    level: getLevel(xp),
    rank: getRank(xp),
    streak,
    lastQuestDate: lastDate,
    wins,
    losses,
    fights,
    challengesDone
  };

  return app.progress;
}

export function getWinrate(wins, losses) {
  const total = Number(wins || 0) + Number(losses || 0);
  if (total === 0) return 0;
  return Math.round((Number(wins || 0) / total) * 100);
}
