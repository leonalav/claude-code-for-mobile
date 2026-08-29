import { createContext, useContext } from "react";

export type DeviceKind = "phone" | "ipad";
export type AppLayout = "phone" | "tablet";

export const LayoutContext = createContext<AppLayout>("phone");

export function useLayout() {
  return useContext(LayoutContext);
}
