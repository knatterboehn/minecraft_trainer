// Development only. Not used by default and never presented as real Minecraft data.
import { createEvent, EVENT_TYPES } from '../domain/gameEvents.js';

export function createMockWinEvent() {
  return createEvent(EVENT_TYPES.FIGHT_WIN, { source: 'mock' });
}

export function createMockLossEvent() {
  return createEvent(EVENT_TYPES.FIGHT_LOSS, { source: 'mock' });
}
