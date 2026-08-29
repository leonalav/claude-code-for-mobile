/**
 * Initialize Capacitor plugins on app start.
 *
 * - Hide the splash screen (we configured `launchAutoHide: true` so
 *   this is mostly a safety net)
 * - Style the status bar to match the dark theme
 *
 * Safe to call on the web — the plugins no-op when not in a native
 * shell.
 */

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { isNative } from "./native";

export function useCapacitorInit() {
  useEffect(() => {
    if (!isNative) return;

    // Style the status bar to match our dark theme.
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#141413" }).catch(() => {});

    // Ensure the splash is dismissed.
    SplashScreen.hide().catch(() => {});

    // Useful in dev: log the platform once.
    if (import.meta.env.DEV) {
      console.log(`[Claude Code Mobile] running on ${Capacitor.getPlatform()}`);
    }
  }, []);
}