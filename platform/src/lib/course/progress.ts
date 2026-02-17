const STORAGE_KEY = 'buildai-progress';

type ExerciseProgress = {
  completed: boolean;
  lastCode: string;
  completedAt?: string;
};

type ProgressStore = Record<string, ExerciseProgress>;

function getStore(): ProgressStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStore(store: ProgressStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function exerciseKey(moduleSlug: string, exerciseSlug: string): string {
  return `day-1/${moduleSlug}/${exerciseSlug}`;
}

export function saveCode(moduleSlug: string, exerciseSlug: string, code: string): void {
  const store = getStore();
  const key = exerciseKey(moduleSlug, exerciseSlug);
  store[key] = { ...store[key], completed: store[key]?.completed ?? false, lastCode: code };
  setStore(store);
}

export function getSavedCode(moduleSlug: string, exerciseSlug: string): string | null {
  const store = getStore();
  return store[exerciseKey(moduleSlug, exerciseSlug)]?.lastCode ?? null;
}

export function markCompleted(moduleSlug: string, exerciseSlug: string): void {
  const store = getStore();
  const key = exerciseKey(moduleSlug, exerciseSlug);
  store[key] = {
    ...store[key],
    completed: true,
    lastCode: store[key]?.lastCode ?? '',
    completedAt: new Date().toISOString(),
  };
  setStore(store);
}

export function markIncomplete(moduleSlug: string, exerciseSlug: string): void {
  const store = getStore();
  const key = exerciseKey(moduleSlug, exerciseSlug);
  if (store[key]) {
    store[key].completed = false;
    delete store[key].completedAt;
    setStore(store);
  }
}

export function isCompleted(moduleSlug: string, exerciseSlug: string): boolean {
  const store = getStore();
  return store[exerciseKey(moduleSlug, exerciseSlug)]?.completed ?? false;
}

export function getCompletedCount(moduleSlug: string): number {
  const store = getStore();
  const prefix = `day-1/${moduleSlug}/`;
  return Object.entries(store).filter(
    ([key, val]) => key.startsWith(prefix) && val.completed
  ).length;
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
