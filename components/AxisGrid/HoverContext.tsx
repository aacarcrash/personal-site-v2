"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type HoverState = {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
};

const HoverContext = createContext<HoverState>({
  hoveredId: null,
  setHoveredId: () => {},
});

export function HoverProvider({ children }: { children: ReactNode }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
    <HoverContext.Provider value={{ hoveredId, setHoveredId }}>
      {children}
    </HoverContext.Provider>
  );
}

export function useHoveredProject() {
  return useContext(HoverContext);
}
