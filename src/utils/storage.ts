/**
 * Snapshot persistence — saves app state (sessions, settings) to the
 * device VM (NSUserDefaults via Capacitor Preferences) or to localStorage
 * in the browser.
 *
 * Designed to be a tiny, async, JSON-safe store. Each key holds a
 * single JSON-serializable value.
 */

import { isNative } from "./native";
import { Preferences } from "@capacitor/preferences";

export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key });
        if (value === null) return fallback;
        return JSON.parse(value) as T;
      } else {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
      }
    } catch {
      return fallback;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    const raw = JSON.stringify(value);
    if (isNative) {
      await Preferences.set({ key, value: raw });
    } else {
      window.localStorage.setItem(key, raw);
    }
  },

  async remove(key: string): Promise<void> {
    if (isNative) {
      await Preferences.remove({ key });
    } else {
      window.localStorage.removeItem(key);
    }
  },
};

/** Storage keys — keep centralized so they're typo-safe. */
export const StorageKeys = {
  SESSIONS: "claude-code:sessions",
  CONNECTED: "claude-code:connected",
  DRAFT: "claude-code:draft",
  THEME: "claude-code:theme",
} as const;