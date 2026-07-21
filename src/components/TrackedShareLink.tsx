"use client";

import type { ReactNode } from "react";
import type { ShareSource } from "@/lib/marketing";

type Props = {
  href: string;
  source: ShareSource;
  className?: string;
  children: ReactNode;
  ariaLabel: string;
};

export default function TrackedShareLink({ href, source, className, children, ariaLabel }: Props) {
  const recordClick = () => {
    const payload = JSON.stringify({ source });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/events/share",
        new Blob([payload], { type: "application/json" })
      );
      return;
    }
    fetch("/api/events/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <a
      href={href}
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
