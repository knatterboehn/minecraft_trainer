import { STORAGE_KEY, createDefaultApp } from './defaults.js';
import { normalizeApp } from './normalize.js';
import { recomputeProgress } from '../domain/progress.js';
import { deriveAnalysis } from '../domain/analysis.js';
import { applyGameEvent } from '../domain/gameEvents.js';

let state = normalizeApp(readRawState());
const listeners = new Set();

function readRawState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultApp();
    return JSON.parse(raw);
  } catch (error) {
    return createDefaultApp();
  }
}

function persist() {
  state.meta.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function notify() {
  listeners.forEach((listener) => listener(state));
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setState(updater) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  state = normalizeApp(next);
  persist();
  notify();
  return state;
}

export function patchState(mutator) {
  mutator(state);
  state = normalizeApp(state);
  persist();
  notify();
  return state;
}

export function dispatchEvent(event) {
  applyGameEvent(state, event);
  recomputeProgress(state);
  state.analysis = deriveAnalysis(state.history);
  state = normalizeApp(state);
  persist();
  notify();
  return state;
}

export function resetApp() {
  state = createDefaultApp();
  persist();
  notify();
  return state;
}

export function importApp(jsonText) {
  const parsed = JSON.parse(jsonText);
  state = normalizeApp(parsed);
  persist();
  notify();
  return state;
}

export function exportApp() {
  return JSON.stringify(state, null, 2);
}
