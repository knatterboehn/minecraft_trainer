# Test Report v0.51 - Minecraft Trainer

## Ziel

Ergänzung eines echten automatisierten Nutzerfluss-Tests. Die vorherigen Tests waren Smoke-/Regression-Tests. v0.51 prüft zusätzlich, ob ein Nutzer den Kern-Loop im Browser per Klicks bedienen kann.

## Ausgeführt

```bash
npm run check
npm test
npm run test:e2e
```

## Ergebnis

- Syntax-Check: bestanden
- Smoke-Test: bestanden
- Regression-Test: bestanden
- Browser-E2E-Test: bestanden

## Neuer E2E-Test

Datei: `scripts/e2e-user-flow-test.mjs`

Der Test startet Chrome/Chromium headless über das Chrome DevTools Protocol und führt echte Maus-Events aus:

- `Input.dispatchMouseEvent` für Klicks
- `Input.insertText` für Texteingaben
- Desktop-Viewport
- Mobile-Viewport
- Screenshot-Erzeugung unter `docs/e2e-screens/`

## Getesteter Nutzerfluss

1. Onboarding sichtbar
2. Name eingeben
3. Skill / Server setzen
4. Trainer starten
5. Dashboard versteht Daily Quest
6. Quest starten
7. Fight Log bedienen:
   - + Win
   - + Win
   - + Loss
   - + Trainingsfight
8. Bonus Challenge bis zum Ziel klicken
9. Erfolgsmoment prüfen: Bonus freigeschaltet
10. Kurz-Review wählen: Positioning
11. Notiz eingeben
12. Quest abschließen
13. Abschluss-Summary prüfen:
   - Quest abgeschlossen
   - XP gesammelt
   - Streak gesichert
   - Quest-Verlauf ansehen
14. Dashboard nach Abschluss prüfen:
   - Heute erledigt
   - Streak gesichert
15. Fortschritt öffnen und Quest-Verlauf prüfen
16. Analyse öffnen und nächsten Fokus prüfen
17. Profil öffnen und Export/Import/Reset-Bereich prüfen
18. Mobile Navigation prüfen:
   - Fortschritt
   - Training

## Datenprüfung im E2E-Test

Nach echten Klicks wird zusätzlich der gespeicherte App-State geprüft:

- genau eine Quest in `history`
- aktive Quest ist nach Abschluss beendet
- 4 Fights gespeichert
- 2 Wins gespeichert
- 1 Loss gespeichert
- 1 Trainingsfight gespeichert
- Bonus Challenge gespeichert
- Review-Fokus gespeichert
- Streak erhöht
- XP vergeben

## Warum der Test relevant ist

Dieser Test ersetzt keinen echten Vince-Test, ist aber deutlich näher an echtem Verhalten als reine Render-/Unit-Tests:

- Er klickt echte Buttons im Browser.
- Er füllt echte Eingabefelder.
- Er prüft sichtbare Texte nach jedem Kernschritt.
- Er prüft, ob die UI nach Zustandswechseln weiter bedienbar bleibt.
- Er deckt Desktop und Mobile-Navigation ab.

## Technische Notiz

Der Test nutzt die echten App-Module aus `src/` und das echte CSS aus `styles/original.css`. Für die Sandbox wird die App in eine leere Browserseite geladen, weil dort lokale HTTP-/File-URLs durch die Browser-Policy blockiert sein können. Die Bedienung erfolgt trotzdem im echten Chrome/Chromium-DOM mit Maus- und Texteingabe-Events.

## Status

v0.51 ist automatisiert als MVP-Release-Candidate mit simuliertem User-Flow geprüft.
