"use client";

import { useEffect } from "react";

function getOrCreateSessionId() {
  const key = "na_session_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  // Random id (ikke personlig, bare tilfeldig)
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `sess_${Math.random().toString(16).slice(2)}${Date.now()}`;
  localStorage.setItem(key, id);
  return id;
}

export function HomepageVisitTracker() {
  useEffect(() => {
    try {
      const sessionId = getOrCreateSessionId();

      // Send "homepage visit"
      void fetch("/api/homepage-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch {
      // ignorer
    }
  }, []);

  return null;
}
