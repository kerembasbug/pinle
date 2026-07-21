"use client";

import { useState } from "react";

export default function CopyEmbedCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" onClick={copy} className="btn btn-cream px-5 py-2 text-sm">
      {copied ? "Kopyalandı ✓" : "Embed kodunu kopyala"}
    </button>
  );
}
