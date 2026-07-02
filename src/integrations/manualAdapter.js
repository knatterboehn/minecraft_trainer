import { createEvent, EVENT_TYPES } from '../domain/gameEvents.js';
import { dispatchEvent } from '../state/store.js';

export function manualDispatch(type, payload = {}) {
  return dispatchEvent(createEvent(type, { ...payload, source: 'manual' }));
}

export { EVENT_TYPES };
