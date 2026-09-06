import { useRef, useState } from "react";
import { emptyGestures } from "../../adapters/input/camera/gestures";

export type ControlMode = "keyboard" | "camera";

export function useWorldControls(preferredMode: ControlMode = "keyboard") {
  const cameraInput = useRef(emptyGestures());
  const [override, setOverride] = useState<ControlMode | null>(null);
  const [autoStartCamera, setAutoStartCamera] = useState(false);
  const controlMode = override ?? preferredMode;
  const closeCamera = () => {
    cameraInput.current = emptyGestures();
    setOverride("keyboard");
    setAutoStartCamera(false);
  };
  const selectMode = (mode: ControlMode) => {
    if (mode === controlMode) return;
    cameraInput.current = emptyGestures();
    setOverride(mode);
    setAutoStartCamera(mode === "camera");
  };
  return { cameraInput, controlMode, autoStartCamera, closeCamera, selectMode };
}
