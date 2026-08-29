/**
 * Detect whether the app is running inside a Capacitor native shell.
 *
 * Used to switch between the marketing/demo layout (browser) and the
 * minimal, full-bleed native layout (iOS / Android).
 */

import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();

export const platform: "ios" | "android" | "web" = isNative
  ? (Capacitor.getPlatform() as "ios" | "android")
  : "web";

/**
 * On native, hide the URL bar and use safe areas. The web app uses the
 * browser viewport instead.
 */
export const isCapacitorIOS = platform === "ios";