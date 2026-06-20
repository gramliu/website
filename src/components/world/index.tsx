import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Map from "./map";
import WorldLoadingIndicator from "./WorldLoadingIndicator";

const MIN_LOADING_DURATION_MS = 1_500;
const STALL_PROGRESS = 100;
const PROGRESS_DURATION_MS = 1_300;

const MAP_FADE_DURATION_S = 0.5;
const MAP_OPACITY_HIDDEN = 0;
const MAP_OPACITY_LOADING = 1;
const MAP_OPACITY_VISIBLE = 1;

interface Props {
  size?: number;
  rotateWorld?: boolean;
  interactiveMode?: boolean;
  closeUp?: boolean;
  showFringe?: boolean;
  onLoaded?: () => void;
}

function WorldLoadedNotifier({ onReady }: { onReady: () => void }) {
  const notified = useRef(false);
  useFrame(() => {
    if (notified.current) {
      return;
    }
    notified.current = true;
    onReady();
  });
  return null;
}

function World({
  size = 1,
  rotateWorld = true,
  interactiveMode = false,
  closeUp = false,
  showFringe = false,
  onLoaded,
}: Props) {
  const [assetsReady, setAssetsReady] = useState(false);
  const [minDurationMet, setMinDurationMet] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const onLoadedCalled = useRef(false);
  const loadingCompleteRef = useRef(false);

  const notifyLoaded = useCallback(() => {
    if (!onLoaded || onLoadedCalled.current || !loadingCompleteRef.current) {
      return;
    }
    onLoadedCalled.current = true;
    onLoaded();
  }, [onLoaded]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinDurationMet(true);
    }, MIN_LOADING_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const loadingComplete = assetsReady && minDurationMet;

  useEffect(() => {
    loadingCompleteRef.current = loadingComplete;
  }, [loadingComplete]);

  useEffect(() => {
    if (loadingComplete) {
      setOverlayVisible(false);
    }
  }, [loadingComplete]);

  useEffect(() => {
    if (loadingComplete) {
      setDisplayProgress(100);
      return;
    }

    const startTime = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / PROGRESS_DURATION_MS);
      setDisplayProgress(t * STALL_PROGRESS);

      if (t < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [loadingComplete]);

  const indicatorProgress = loadingComplete ? 100 : displayProgress;

  return (
    <div
      className="relative w-full h-full"
      style={{ height: closeUp ? "900px" : undefined }}
    >
      <AnimatePresence onExitComplete={notifyLoaded}>
        {overlayVisible ? (
          <motion.div
            key="world-loading-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MAP_FADE_DURATION_S }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-bgcolor-primary/80 pointer-events-auto"
          >
            <WorldLoadingIndicator progress={indicatorProgress} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: MAP_OPACITY_HIDDEN }}
        animate={{
          opacity: assetsReady
            ? loadingComplete
              ? MAP_OPACITY_VISIBLE
              : MAP_OPACITY_LOADING
            : MAP_OPACITY_HIDDEN,
        }}
        transition={{ duration: MAP_FADE_DURATION_S }}
      >
        <Canvas
          camera={{
            position: [15, 10, 15],
            fov: closeUp ? 50 : 60,
          }}
          className="h-full"
          shadows
        >
          <ambientLight intensity={0.38} />
          <directionalLight
            position={[1, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-bias={-0.0005}
            shadow-normalBias={0.02}
          />
          {!rotateWorld ? (
            <>
              <OrbitControls enabled={!interactiveMode} />
            </>
          ) : null}
          <Suspense fallback={null}>
            <Map
              size={size}
              rotateWorld={rotateWorld}
              interactiveMode={interactiveMode}
              showFringe={showFringe}
            />
            <WorldLoadedNotifier onReady={() => setAssetsReady(true)} />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  );
}

export default World;
