import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CameraControlsContext } from "../src/adapters/input/camera/context";
import World from "../src/components/world";
import CameraControlsPanel from "../src/components/world/CameraControlsPanel";
import ControlModeSwitch from "../src/components/world/ControlModeSwitch";
import KeyboardControlsPanel from "../src/components/world/KeyboardControlsPanel";
import PlayWorldButton from "../src/components/world/PlayWorldButton";
import {
  getWorldQuality,
  parseWorldQualityOverride,
  type WorldQuality,
} from "../src/components/world/quality";
import { useWorldControls } from "../src/components/world/useWorldControls";
import { useHasSideBySideHeroLayout } from "../src/hooks/useHasSideBySideHeroLayout";

import { useWorldInteractivity } from "../src/hooks/useWorldInteractivity";

const inter = Inter({ subsets: ["latin"] });

export default function WorldPage() {
  const router = useRouter();
  const canInteract = useWorldInteractivity();
  const { cameraInput, controlMode, autoStartCamera, closeCamera, selectMode } =
    useWorldControls(
      canInteract && router.isReady && router.query.controls === "camera"
        ? "camera"
        : "keyboard"
    );
  const [playingOverride, setPlayingOverride] = useState<boolean | null>(null);
  const [worldLoaded, setWorldLoaded] = useState(false);
  const [worldQuality, setWorldQuality] = useState<WorldQuality>("full");
  const hasSideBySideHeroLayout = useHasSideBySideHeroLayout();

  const qualityOverride = router.isReady
    ? parseWorldQualityOverride(router.query.quality)
    : undefined;

  const queryWantsInteractive =
    router.isReady && router.query.mode === "interactive";
  const isPlaying = canInteract && (playingOverride ?? queryWantsInteractive);

  useEffect(() => {
    if (!canInteract && controlMode === "camera") closeCamera();
  }, [canInteract, closeCamera, controlMode]);

  useEffect(() => {
    setWorldQuality(
      qualityOverride ??
        getWorldQuality(
          hasSideBySideHeroLayout,
          navigator.deviceMemory,
          canInteract
        )
    );
  }, [hasSideBySideHeroLayout, qualityOverride, canInteract]);

  return (
    <CameraControlsContext.Provider
      value={controlMode === "camera" ? cameraInput : null}
    >
      <main className={`flex h-screen w-screen ${inter.className} relative`}>
        <div className="flex-1 w-full h-full min-w-0">
          <World
            size={canInteract ? 1 : 0.6}
            rotateWorld={!canInteract}
            interactiveMode={isPlaying}
            showFringe
            quality={worldQuality}
            terrainMode={canInteract ? "infinite" : "preview_island"}
            onLoaded={() => setWorldLoaded(true)}
            onInteractiveFailure={() => {
              setPlayingOverride(false);
              closeCamera();
            }}
            onRetryLite={
              qualityOverride
                ? undefined
                : () => {
                    setWorldQuality("lite");
                    setPlayingOverride(true);
                  }
            }
          />
        </div>
        {canInteract && (
          <PlayWorldButton
            ready={worldLoaded}
            isPlaying={isPlaying}
            onToggle={() => {
              if (isPlaying) closeCamera();
              setPlayingOverride(!isPlaying);
            }}
            controls={
              <ControlModeSwitch
                mode={controlMode}
                onChange={(mode) => {
                  selectMode(mode);
                  if (mode === "camera" && controlMode !== "camera")
                    setPlayingOverride(true);
                }}
              />
            }
            variant="overlay"
          />
        )}
        {canInteract &&
          (controlMode === "camera" ? (
            <CameraControlsPanel
              inputRef={cameraInput}
              autoStart={autoStartCamera}
              onStart={() => setPlayingOverride(true)}
              onClose={closeCamera}
            />
          ) : (
            <KeyboardControlsPanel isPlaying={isPlaying} />
          ))}
      </main>
    </CameraControlsContext.Provider>
  );
}
