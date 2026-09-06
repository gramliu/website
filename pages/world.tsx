import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { CameraControlsContext } from "../src/adapters/input/camera/context";
import { emptyGestures } from "../src/adapters/input/camera/gestures";
import World from "../src/components/world";
import CameraControlsPanel from "../src/components/world/CameraControlsPanel";
import PlayWorldButton from "../src/components/world/PlayWorldButton";
import {
  getWorldQuality,
  parseWorldQualityOverride,
  type WorldQuality,
} from "../src/components/world/quality";
import { useHasSideBySideHeroLayout } from "../src/hooks/useHasSideBySideHeroLayout";

const inter = Inter({ subsets: ["latin"] });

export default function WorldPage() {
  const router = useRouter();
  const cameraInput = useRef(emptyGestures());
  const [controlOverride, setControlOverride] = useState<
    "keyboard" | "camera" | null
  >(null);
  const [autoStartCamera, setAutoStartCamera] = useState(false);
  const controlMode =
    controlOverride ??
    (router.isReady && router.query.controls === "camera"
      ? "camera"
      : "keyboard");
  const closeCamera = () => {
    cameraInput.current = emptyGestures();
    setControlOverride("keyboard");
    setAutoStartCamera(false);
  };
  const [playingOverride, setPlayingOverride] = useState<boolean | null>(null);
  const [worldLoaded, setWorldLoaded] = useState(false);
  const [worldQuality, setWorldQuality] = useState<WorldQuality>("lite");
  const hasSideBySideHeroLayout = useHasSideBySideHeroLayout();

  const qualityOverride = router.isReady
    ? parseWorldQualityOverride(router.query.quality)
    : undefined;

  const queryWantsInteractive =
    router.isReady && router.query.mode === "interactive";
  const isPlaying = playingOverride ?? queryWantsInteractive;

  useEffect(() => {
    setWorldQuality(
      qualityOverride ?? getWorldQuality(hasSideBySideHeroLayout)
    );
  }, [hasSideBySideHeroLayout, qualityOverride]);

  return (
    <CameraControlsContext.Provider
      value={controlMode === "camera" ? cameraInput : null}
    >
      <main className={`flex h-screen w-screen ${inter.className} relative`}>
        <div className="flex-1 w-full h-full min-w-0">
          <World
            rotateWorld={false}
            interactiveMode={isPlaying}
            showFringe
            quality={qualityOverride ?? worldQuality}
            terrainMode="infinite"
            allowQualityDowngrade={!qualityOverride}
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
        <PlayWorldButton
          ready={worldLoaded}
          isPlaying={isPlaying}
          onToggle={() => {
            if (isPlaying) closeCamera();
            setPlayingOverride(!isPlaying);
          }}
          controls={
            <div
              role="group"
              aria-label="Control mode"
              className="flex rounded-lg border border-white/20 bg-slate-950/90 p-1 text-sm text-white"
            >
              <button
                type="button"
                aria-pressed={controlMode === "keyboard"}
                onClick={closeCamera}
                className={`rounded-md px-2 py-2 ${controlMode === "keyboard" ? "bg-white/20" : "hover:bg-white/10"}`}
              >
                Keyboard
              </button>
              <button
                type="button"
                aria-pressed={controlMode === "camera"}
                onClick={() => {
                  if (controlMode !== "camera") {
                    cameraInput.current = emptyGestures();
                    setAutoStartCamera(true);
                    setControlOverride("camera");
                    setPlayingOverride(true);
                  }
                }}
                className={`rounded-md px-2 py-2 ${controlMode === "camera" ? "bg-white/20" : "hover:bg-white/10"}`}
              >
                Camera
              </button>
            </div>
          }
          variant="overlay"
        />
        {controlMode === "camera" && (
          <CameraControlsPanel
            inputRef={cameraInput}
            autoStart={autoStartCamera}
            onStart={() => setPlayingOverride(true)}
            onClose={closeCamera}
          />
        )}
      </main>
    </CameraControlsContext.Provider>
  );
}
