export function getTodayQuestEntries(app) {
  const today = app?.todayTraining?.date;
  const history = Array.isArray(app?.history) ? app.history : [];
  if (!today) return [];
  return history
    .filter((entry) => entry?.date === today)
    .sort((a, b) => String(b.completedAt || b.date).localeCompare(String(a.completedAt || a.date)));
}

export function getLatestTodayQuest(app) {
  return getTodayQuestEntries(app)[0] || null;
}

export function getDailyQuestState(app) {
  if (app?.todayTraining?.activeSession) return 'active';
  if (getLatestTodayQuest(app)) return 'completed';
  return 'open';
}

export function getStreakMessage(app) {
  const completedToday = Boolean(getLatestTodayQuest(app));
  const streak = Number(app?.progress?.streak || 0);

  if (completedToday) return `🔥 Streak gesichert · ${streak} ${streak === 1 ? 'Tag' : 'Tage'}`;
  if (streak > 0) return `🔥 ${streak} ${streak === 1 ? 'Tag' : 'Tage'} Streak · heute sichern`;
  return '🔥 Starte heute deine erste Streak';
}

export function getQuestWeek(app, days = 7) {
  const completedDates = new Set((Array.isArray(app?.history) ? app.history : []).map((entry) => entry.date));
  const today = new Date(`${app?.todayTraining?.date || new Date().toISOString().slice(0, 10)}T00:00:00`);

  return Array.from({ length: days }, (_, index) => {
    const offset = days - 1 - index;
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const iso = date.toISOString().slice(0, 10);
    return {
      date: iso,
      label: new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(date).replace('.', ''),
      completed: completedDates.has(iso),
      today: offset === 0
    };
  });
}
