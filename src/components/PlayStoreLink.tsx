"use client";

import type { ReactNode } from "react";
import type { PlaySource } from "@/lib/marketing";
import { playUrl } from "@/lib/store";

type Props = {
  source: PlaySource;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

export default function PlayStoreLink({ source, className, children, ariaLabel }: Props) {
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

  return (
    <a
      href={playUrl(source)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={recordClick}
    >
      {children}
    </a>
  );
}
