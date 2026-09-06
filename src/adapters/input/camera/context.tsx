import { createContext, type MutableRefObject, useContext } from "react";
import type { GestureOutput } from "./gestures";

export const CameraControlsContext =
  createContext<MutableRefObject<GestureOutput> | null>(null);
export const useCameraControls = () => useContext(CameraControlsContext);
