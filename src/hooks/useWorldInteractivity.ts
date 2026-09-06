import { useMediaQuery } from "./useMediaQuery";

// Start with the lightweight preview during hydration. Touch-only devices do
// not need keyboard/camera controls or the infinite terrain cache.
export function useWorldInteractivity(): boolean {
  return useMediaQuery("(min-width: 768px) and (any-pointer: fine)");
}
