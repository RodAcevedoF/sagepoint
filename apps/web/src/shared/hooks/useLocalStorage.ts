"use client";

import { useSyncExternalStore, useCallback } from "react";

const SP_STORAGE_EVENT = "sp:storage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SP_STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SP_STORAGE_EVENT, callback);
  };
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      try {
        return JSON.parse(raw) as T;
      } catch (e) {
        console.error(`[useLocalStorage] Failed to parse key "${key}":`, e);
        return initialValue;
      }
    },
    () => initialValue,
  );

  const setValue = useCallback(
    (newValue: T) => {
      window.localStorage.setItem(key, JSON.stringify(newValue));
      window.dispatchEvent(new Event(SP_STORAGE_EVENT));
    },
    [key],
  );

  return [value, setValue];
}
