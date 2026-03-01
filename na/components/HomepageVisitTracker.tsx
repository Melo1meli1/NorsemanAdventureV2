"use client";

import { useEffect } from "react";

export function HomepageVisitTracker() {
  useEffect(() => {
    fetch("/api/homepage-visit", {
      method: "POST",
    });
  }, []);

  return null;
}
