import { useEffect, useState } from "react";

export const KEY_BINDINGS = {
  W: ["KeyW", "ArrowUp"],
  A: ["KeyA", "ArrowLeft"],
  S: ["KeyS", "ArrowDown"],
  D: ["KeyD", "ArrowRight"],
  SPACE: ["Space"],
  R: ["KeyR"],
} as const;
export type DisplayKey = keyof typeof KEY_BINDINGS;
export function isKeyPressed(codes: ReadonlySet<string>, key: DisplayKey) {
  return KEY_BINDINGS[key].some((code) => codes.has(code));
}
const supported = new Set<string>(Object.values(KEY_BINDINGS).flat());
const empty: ReadonlySet<string> = new Set();

/** Display feedback only; gameplay owns prevention of browser keyboard defaults. */
export function usePressedKeys(enabled: boolean): ReadonlySet<string> {
  const [pressed, setPressed] = useState<ReadonlySet<string>>(empty);
  useEffect(() => {
    setPressed(empty);
    if (!enabled) return;
    const down = (event: KeyboardEvent) => {
      if (!supported.has(event.code)) return;
      setPressed((previous) =>
        previous.has(event.code)
          ? previous
          : new Set([...Array.from(previous), event.code])
      );
    };
    const up = (event: KeyboardEvent) => {
      if (!supported.has(event.code)) return;
      setPressed((previous) => {
        if (!previous.has(event.code)) return previous;
        const next = new Set(previous);
        next.delete(event.code);
        return next;
      });
    };
    const reset = () => setPressed(empty);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [enabled]);
  return enabled ? pressed : empty;
}
