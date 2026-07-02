# UX Flow - BlockCoach

**Subline:** Level up your fights.

## Nutzerrolle

Minecraft-Java-Spieler zwischen 10 und 18 Jahren, der besser werden will, Challenges mag und nicht viel Zeit mit Formularen verbringen möchte.

## Produktkern

BlockCoach ist ein gamifizierter Assistenztrainer. Er soll nicht nur Daten sammeln, sondern Trainingseffekt erzeugen:

```text
Gameplay beobachten
→ Muster erkennen
→ passende Daily Quest spielen
→ XP, Streak und Bonus erhalten
→ nächste Quest wird nützlicher
```

## Design-Freeze

Das visuelle Original-UI bleibt die Basis. Neue Features werden in bestehende Cards, Statusflächen und Quest-Logik integriert, nicht als komplett neue UI-Welt.

## Core Concepts

1. **Daily Quest** - heutiger Trainingsauftrag
2. **Fight Log** - Fight-Ergebnisse manuell oder später automatisch
3. **Bonus Challenge** - Extra-Ziel für XP
4. **Quest-Verlauf** - erledigte Quests
5. **Nächster Fokus** - was besser werden soll
6. **BlockCoach Live** - echter Minecraft-Event-Eingang, kein Fake-Live

## Flow heute

1. Dashboard öffnen.
2. Daily Quest verstehen.
3. Quest starten, wenn Minecraft bereit ist.
4. Fights loggen oder Live-Events übernehmen lassen.
5. Bonus Challenge tracken.
6. Kurz-Review wählen.
7. Quest abschließen.
8. XP, Streak, Bonus und Quest-Verlauf sehen.

## Live-Modus-Regel

Die App darf nur Live-Zustände zeigen, wenn echte Bridge-Events empfangen wurden.

- Ohne Bridge: manueller Backup-Modus.
- Mit Bridge: Live-Status + Event-Inbox.
- Mit aktiver Quest: sichere Bridge-Events werden zu GameEvents.
- Ohne aktive Quest: Live-Events bleiben in der Inbox und verändern keine Quest.

## Nicht-Ziele

- Kein Cheat.
- Kein Auto-Aim.
- Kein Auto-Klick.
- Keine Gegner-Markierung.
- Keine Fake-Daten.
- Keine neuen Modus-Menüs, die den Daily Loop verkomplizieren.

## v0.53 Integration Flow

```text
Minecraft Java
→ Fabric Client Prototype liest sichere Client-Signale
→ Local Bridge nimmt HTTP Events an
→ Web-App empfängt WebSocket Events
→ aktive Quest übernimmt nur sichere GameEvents
→ Gamification bleibt der Abschlussmoment
```

Die Live-Integration ist bewusst assistiv: Der Spieler bekommt nach und rund um Fights besseres Feedback, aber keinen unfairen Vorteil im Fight.
