"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import type { PlaySource } from "@/lib/marketing";
import { isInstalledApp, playUrl } from "@/lib/store";

type Props = {
  source: PlaySource;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  hideWhenInstalled?: boolean;
  onClick?: () => void;
};

const subscribeToNoEvents = () => () => {};

export default function PlayStoreLink({
  source,
  className,
  children,
  ariaLabel,
  hideWhenInstalled = false,
  onClick,
}: Props) {
  const hidden = useSyncExternalStore(
    subscribeToNoEvents,
    () => hideWhenInstalled && isInstalledApp(),
    () => false,
  );

  const recordClick = () => {
    const payload = JSON.stringify({ source });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/events/outbound-play",
        new Blob([payload], { type: "application/json" })
      );
      return;
    }
    fetch("/api/events/outbound-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  };

  if (hidden) return null;

  return (
    <a
      href={playUrl(source)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        recordClick();
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
