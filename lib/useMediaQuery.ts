"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media-query hook. Returns `null` until mounted so the server render
 * and the first client render agree (no hydration mismatch); after mount it
 * returns the live boolean. Callers should gate on `=== true` / `=== false` and
 * treat `null` as "not known yet" (render a neutral placeholder).
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
