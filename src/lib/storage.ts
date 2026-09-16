// Local persistence abstraction (section 76). One place for all localStorage
// access, SSR-safe, corruption-safe, versioned. UI and store never touch
// localStorage directly.

const PREFIX = 'ramya-cook:';
const VERSION = 1;

function available(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const k = `${PREFIX}__probe`;
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const CAN_STORE = available();

export function load<T>(key: string, fallback: T): T {
  if (!CAN_STORE) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { v: number; data: T };
    if (!parsed || typeof parsed !== 'object' || parsed.v !== VERSION) return fallback;
    return parsed.data ?? fallback;
  } catch {
    // Corrupted data — fall back gracefully.
    return fallback;
  }
}

export function save<T>(key: string, data: T): void {
  if (!CAN_STORE) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify({ v: VERSION, data }));
  } catch {
    // Quota or private-mode errors are non-fatal.
  }
}

export function remove(key: string): void {
  if (!CAN_STORE) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export const storageAvailable = CAN_STORE;
