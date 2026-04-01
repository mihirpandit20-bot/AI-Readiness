import { useSyncExternalStore } from "react";

interface Toast {
  id: string;
  message: string;
  variant: "default" | "success" | "destructive";
}

let toasts: Toast[] = [];
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function addToast(
  message: string,
  variant: "default" | "success" | "destructive" = "default"
) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, message, variant }];
  emitChange();
  setTimeout(() => dismissToast(id), 4000);
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return toasts;
}

export function useToasts() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
