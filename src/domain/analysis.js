import { getWinrate } from './progress.js';

export function deriveAnalysis(history = []) {
  const sessions = Array.isArray(history) ? history : [];
  if (sessions.length === 0) {
    return {
      strengths: [],
      reviewZones: [],
      nextFocus: '🎯 Starte deine erste Daily Quest.'
    };
  }

  const bySkill = new Map();
  const issues = new Map();

  sessions.forEach((entry) => {
    const skill = entry.skill || 'Allround';
    if (!bySkill.has(skill)) {
      bySkill.set(skill, { skill, sessions: 0, fights: 0, wins: 0, losses: 0, challenges: 0 });
    }
    const bucket = bySkill.get(skill);
    bucket.sessions += 1;
    bucket.fights += Number(entry.fights || 0);
    bucket.wins += Number(entry.wins || 0);
    bucket.losses += Number(entry.losses || 0);
    if (entry.challengeDone) bucket.challenges += 1;

    if (entry.mainIssue && entry.mainIssue !== 'Weiß nicht') {
      issues.set(entry.mainIssue, (issues.get(entry.mainIssue) || 0) + 1);
    }
  });

  const skills = Array.from(bySkill.values()).map((item) => ({
    ...item,
    winrate: getWinrate(item.wins, item.losses),
    challengeRate: item.sessions ? Math.round((item.challenges / item.sessions) * 100) : 0
  }));

  const strengths = skills
    .filter((item) => item.fights >= 5 && item.winrate >= 55)
    .sort((a, b) => b.winrate - a.winrate)
    .slice(0, 2)
    .map((item) => `${item.skill}: ${item.winrate}% Winrate über ${item.fights} Fights.`);

  const reviewZones = skills
    .filter((item) => item.fights >= 5 && item.winrate < 45)
    .sort((a, b) => a.winrate - b.winrate)
    .slice(0, 2)
    .map((item) => `${item.skill}: ${item.winrate}% Winrate. Nächste Quest einfacher und fokussierter spielen.`);

  const topIssue = Array.from(issues.entries()).sort((a, b) => b[1] - a[1])[0];
  let nextFocus = '🧠 Spiele die nächste Quest mit einem klaren Fokus.';
  if (topIssue) {
    nextFocus = `${topIssue[0]} taucht am häufigsten auf. Nächste Quest nur darauf achten.`;
  } else if (reviewZones.length > 0) {
    nextFocus = reviewZones[0];
  }

  return { strengths, reviewZones, nextFocus };
}
