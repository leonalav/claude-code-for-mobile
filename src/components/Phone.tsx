import type { ReactNode } from "react";
import { cn } from "../utils/cn";

function Signal() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden>
      <rect x="0" y="7" width="3" height="5" rx="0.6" fill="currentColor" />
      <rect x="4.5" y="5" width="3" height="7" rx="0.6" fill="currentColor" />
      <rect x="9" y="2.5" width="3" height="9.5" rx="0.6" fill="currentColor" />
      <rect x="13.5" y="0" width="3" height="12" rx="0.6" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function Wifi() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
      <path
        d="M1 4.2C4.2 1.4 11.8 1.4 15 4.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.4 6.6C5.6 4.7 10.4 4.7 12.6 6.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 8.9C7.2 7.8 8.8 7.8 10 8.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11" r="1.1" fill="currentColor" />
    </svg>
  );
}

function Battery() {
  return (
    <div className="flex items-center gap-[2px] text-ink">
      <div className="relative h-[11px] w-[22px] rounded-[3px] border border-ink/80 p-[1.5px]">
        <div className="h-full w-[70%] rounded-[1.5px] bg-ink" />
      </div>
      <div className="h-[5px] w-[1.5px] rounded-r-sm bg-ink/80" />
    </div>
  );
}

export function Phone({
  children,
  time,
  dark = false,
}: {
  children: ReactNode;
  time: string;
  dark?: boolean;
}) {
  return (
    <div className="phone-frame">
      <div className={cn("phone-screen", dark && "theme-dark")}>
        <div className="dynamic-island" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-[54px] items-end px-8 pb-[6px]">
          <span className="w-[72px] text-[15px] font-semibold tracking-tight text-ink">{time}</span>
          <div className="flex flex-1 justify-end gap-1.5 text-ink">
            <Signal />
            <Wifi />
            <Battery />
          </div>
        </div>
        {children}
        <div className="home-bar" />
      </div>
    </div>
  );
}
