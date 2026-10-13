"use client";

import { useSyncExternalStore } from "react";
import type { PersonaKey } from "./i18n";

export type Focus = PersonaKey | "home" | "other";

type SceneState = {
  /** Which node the camera flies to (driven by the route). */
  focus: Focus;
  /** Node highlighted by hovering a tab or card. */
  hover: PersonaKey | null;
  /** True while a page transition is playing — the scene "warps". */
  warp: boolean;
};

let state: SceneState = { focus: "home", hover: null, warp: false };
const listeners = new Set<() => void>();

export const sceneStore = {
  get: () => state,
  set(patch: Partial<SceneState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useScene<T>(select: (s: SceneState) => T): T {
  return useSyncExternalStore(
    sceneStore.subscribe,
    () => select(state),
    () => select(state),
  );
}
