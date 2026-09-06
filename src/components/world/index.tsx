import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getWorldCapabilityTelemetry,
  WorldTelemetrySession,
} from "../../lib/world-telemetry";
import Map from "./map";
import {
  resolveWorldQuality,
  WORLD_QUALITY_PROFILES,
  type WorldQuality,
  type WorldTerrainMode,
} from "./quality";
import {
  INTERACTIVE_START_TIMEOUT_MS,
  shouldDowngradeQuality,
  summarizeFrameTimes,
  type WorldPerformanceSummary,
} from "./runtime";
import WorldLoadingIndicator from "./WorldLoadingIndicator";
import WorldLighting from "./world-lighting";

const MIN_LOADING_DURATION_MS = 1_500;
const STALL_PROGRESS = 90;
const PROGRESS_DURATION_MS = 1_300;
const PERFORMANCE_SAMPLE_DURATION_MS = 5_000;

const MAP_FADE_DURATION_S = 0.5;
const MAP_OPACITY_HIDDEN = 0;
const MAP_OPACITY_LOADING = 1;
const MAP_OPACITY_VISIBLE = 1;

type WorldFailureReason = "canvas_timeout" | "context_lost" | "render_error";

interface Props {
  size?: number;
  rotateWorld?: boolean;
  interactiveMode?: boolean;
  closeUp?: boolean;
  showFringe?: boolean;
  quality?: WorldQuality;
  terrainMode?: WorldTerrainMode;
  allowQualityDowngrade?: boolean;
  onLoaded?: () => void;
  onInteractiveFailure?: () => void;
  onRetryLite?: () => void;
}

interface WorldErrorBoundaryProps {
  children: ReactNode;
  resetKey: number;
  onError: (error: Error) => void;
}

interface WorldErrorBoundaryState {
  hasError: boolean;
}

class WorldErrorBoundary extends Component<
  WorldErrorBoundaryProps,
  WorldErrorBoundaryState
> {
  public state: WorldErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): WorldErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    this.props.onError(error);
  }

  public componentDidUpdate(previousProps: WorldErrorBoundaryProps): void {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  public render(): ReactNode {
    return this.state.hasError ? null : this.props.children;
  }
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

function InteractiveReadyNotifier({ onReady }: { onReady: () => void }) {
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

function WorldPerformanceReporter({
  onSample,
}: {
  onSample: (
    summary: WorldPerformanceSummary & {
      drawCalls: number;
      geometries: number;
      textures: number;
    }
  ) => void;
}) {
  const startedAt = useRef<number | null>(null);
  const frameTimes = useRef<number[]>([]);

  useFrame((state, delta) => {
    if (document.hidden) {
      startedAt.current = null;
      frameTimes.current = [];
      return;
    }
    const now = performance.now();
    startedAt.current ??= now;
    frameTimes.current.push(delta * 1_000);

    if (now - startedAt.current < PERFORMANCE_SAMPLE_DURATION_MS) {
      return;
    }

    onSample({
      ...summarizeFrameTimes(frameTimes.current),
      drawCalls: state.gl.info.render.calls,
      geometries: state.gl.info.memory.geometries,
      textures: state.gl.info.memory.textures,
    });
    startedAt.current = now;
    frameTimes.current = [];
  });

  return null;
}

function World({
  size = 1,
  rotateWorld = true,
  interactiveMode = false,
  closeUp = false,
  showFringe = false,
  quality = "full",
  terrainMode = "infinite",
  allowQualityDowngrade = true,
  onLoaded,
  onInteractiveFailure,
  onRetryLite,
}: Props) {
  const [assetsReady, setAssetsReady] = useState(false);
  const [minDurationMet, setMinDurationMet] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [activeQuality, setActiveQuality] = useState<WorldQuality>(() =>
    resolveWorldQuality(quality, interactiveMode, terrainMode)
  );
  const [failure, setFailure] = useState<WorldFailureReason | null>(null);
  const downgradedRef = useRef(false);
  const recoveringRef = useRef(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null
  );
  const [webglVersion, setWebglVersion] = useState("unknown");
  const onLoadedCalled = useRef(false);
  const loadingCompleteRef = useRef(false);
  const interactiveReadyRef = useRef(false);
  const interactiveModeRef = useRef(interactiveMode);
  const failureRef = useRef<WorldFailureReason | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const wasInteractiveRef = useRef(false);
  const activeQualityRef = useRef<WorldQuality>(activeQuality);
  const terrainModeRef = useRef<WorldTerrainMode>(terrainMode);
  const webglVersionRef = useRef(webglVersion);
  const onInteractiveFailureRef = useRef(onInteractiveFailure);
  const telemetryRef = useRef(new WorldTelemetrySession());

  const effectiveQuality = resolveWorldQuality(
    activeQuality,
    interactiveMode,
    terrainMode
  );
  const qualityProfile = WORLD_QUALITY_PROFILES[effectiveQuality];
  const effectiveInteractiveMode = interactiveMode && !failure;
  const effectiveShowFringe = showFringe;

  useEffect(() => {
    setActiveQuality(downgradedRef.current ? "lite" : quality);
  }, [quality]);

  useEffect(() => {
    interactiveModeRef.current = interactiveMode;
  }, [interactiveMode]);

  useEffect(() => {
    activeQualityRef.current = effectiveQuality;
  }, [effectiveQuality]);

  useEffect(() => {
    terrainModeRef.current = terrainMode;
  }, [terrainMode]);

  useEffect(() => {
    webglVersionRef.current = webglVersion;
  }, [webglVersion]);

  useEffect(() => {
    onInteractiveFailureRef.current = onInteractiveFailure;
  }, [onInteractiveFailure]);

  const notifyLoaded = useCallback(() => {
    if (!onLoaded || onLoadedCalled.current || !loadingCompleteRef.current) {
      return;
    }
    onLoadedCalled.current = true;
    onLoaded();
  }, [onLoaded]);

  const handleRuntimeFailure = useCallback((reason: WorldFailureReason) => {
    if (failureRef.current || recoveringRef.current) {
      return;
    }
    // A new renderer releases the failed context and applies lite's smaller
    // drawing buffer and non-antialiased allocation. Never retry full quality.
    if (
      interactiveModeRef.current &&
      activeQualityRef.current === "full" &&
      !downgradedRef.current
    ) {
      recoveringRef.current = true;
      downgradedRef.current = true;
      activeQualityRef.current = "lite";
      setActiveQuality("lite");
      setAssetsReady(false);
      setOverlayVisible(true);
      setCanvasKey((current) => current + 1);
      telemetryRef.current.trackOnce("world_quality_downgraded", {
        from_quality: "full",
        to_quality: "lite",
        reason,
        world_mode: terrainModeRef.current,
      });
      return;
    }
    failureRef.current = reason;
    setFailure(reason);

    const qualityAtFailure = activeQualityRef.current;
    if (reason === "context_lost") {
      telemetryRef.current.trackOnce("world_context_lost", {
        quality: qualityAtFailure,
        world_mode: terrainModeRef.current,
      });
    } else {
      telemetryRef.current.trackOnce("world_render_error", {
        quality: qualityAtFailure,
        world_mode: terrainModeRef.current,
        reason,
      });
    }
    telemetryRef.current.trackOnce("world_fallback", {
      quality: qualityAtFailure,
      world_mode: terrainModeRef.current,
      reason,
      fallback: "unavailable",
    });
    onInteractiveFailureRef.current?.();
  }, []);

  const handleInteractiveReady = useCallback(() => {
    if (!interactiveModeRef.current || interactiveReadyRef.current) {
      return;
    }
    interactiveReadyRef.current = true;
    telemetryRef.current.trackOnce("world_interactive_ready", {
      quality: activeQualityRef.current,
      world_mode: terrainModeRef.current,
      webgl: webglVersionRef.current,
      startup_ms: Math.round(performance.now() - (startedAtRef.current ?? 0)),
    });
  }, []);

  const handlePerformanceSample = useCallback(
    (
      summary: WorldPerformanceSummary & {
        drawCalls: number;
        geometries: number;
        textures: number;
      }
    ) => {
      telemetryRef.current.trackOnce("world_performance_sample", {
        quality: activeQualityRef.current,
        world_mode: terrainModeRef.current,
        average_frame_ms: Math.round(summary.averageFrameMs),
        p95_frame_ms: Math.round(summary.p95FrameMs),
        sample_count: summary.sampleCount,
        draw_calls: summary.drawCalls,
        geometries: summary.geometries,
        textures: summary.textures,
      });

      if (
        allowQualityDowngrade &&
        interactiveModeRef.current &&
        activeQualityRef.current === "full" &&
        shouldDowngradeQuality(summary)
      ) {
        downgradedRef.current = true;
        activeQualityRef.current = "lite";
        setActiveQuality("lite");
        setAssetsReady(false);
        setOverlayVisible(true);
        setCanvasKey((current) => current + 1);
        telemetryRef.current.trackOnce("world_quality_downgraded", {
          from_quality: "full",
          to_quality: "lite",
          world_mode: terrainModeRef.current,
          p95_frame_ms: Math.round(summary.p95FrameMs),
        });
      }
    },
    [allowQualityDowngrade]
  );

  useEffect(() => {
    if (!interactiveMode) {
      if (wasInteractiveRef.current) {
        telemetryRef.current.trackOnce("world_stopped", {
          quality: activeQualityRef.current,
          world_mode: terrainMode,
        });
      }
      wasInteractiveRef.current = false;
      return;
    }

    wasInteractiveRef.current = true;
    interactiveReadyRef.current = false;
    startedAtRef.current = performance.now();
    telemetryRef.current.trackOnce("world_start_requested", {
      ...getWorldCapabilityTelemetry(activeQualityRef.current, terrainMode),
    });
  }, [interactiveMode, terrainMode]);

  useEffect(() => {
    recoveringRef.current = false;
  }, [canvasKey]);

  useEffect(() => {
    if (failure || (assetsReady && !interactiveMode)) return;
    const timeoutId = window.setTimeout(() => {
      if (!assetsReady || (interactiveMode && !interactiveReadyRef.current)) {
        handleRuntimeFailure("canvas_timeout");
      }
    }, INTERACTIVE_START_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [assetsReady, canvasKey, failure, handleRuntimeFailure, interactiveMode]);

  useEffect(() => {
    if (!canvasElement) {
      return;
    }
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      handleRuntimeFailure("context_lost");
    };
    canvasElement.addEventListener("webglcontextlost", handleContextLost);
    return () =>
      canvasElement.removeEventListener("webglcontextlost", handleContextLost);
  }, [canvasElement, handleRuntimeFailure]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinDurationMet(true);
    }, MIN_LOADING_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const loadingComplete = (assetsReady || !!failure) && minDurationMet;

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

  const retryLite = () => {
    if (!failure) {
      return;
    }
    downgradedRef.current = true;
    setAssetsReady(false);
    setOverlayVisible(true);
    failureRef.current = null;
    setFailure(null);
    activeQualityRef.current = "lite";
    setActiveQuality("lite");
    setCanvasKey((current) => current + 1);
    onRetryLite?.();
  };

  const indicatorProgress = loadingComplete ? 100 : displayProgress;

  return (
    <div
      className={`relative w-full h-full${closeUp ? " xl:h-[900px]" : ""}`}
      data-world-quality={effectiveQuality}
      data-world-status={
        failure ? "unavailable" : assetsReady ? "ready" : "loading"
      }
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
        {!failure && (
          <WorldErrorBoundary
            resetKey={canvasKey}
            onError={() => handleRuntimeFailure("render_error")}
          >
            <Canvas
              key={canvasKey}
              camera={{
                position: [15, 10, 15],
                fov: closeUp ? 50 : 60,
              }}
              className="h-full"
              dpr={qualityProfile.dpr}
              gl={{
                antialias: qualityProfile.antialias,
                powerPreference:
                  effectiveQuality === "lite"
                    ? "low-power"
                    : "high-performance",
              }}
              shadows={qualityProfile.shadows}
              fallback={
                <div className="flex h-full items-center justify-center text-center text-text-faded">
                  3D preview is not supported on this device.
                </div>
              }
              onCreated={({ gl }) => {
                setCanvasElement(gl.domElement);
                const version = gl.capabilities.isWebGL2 ? "webgl2" : "webgl1";
                webglVersionRef.current = version;
                setWebglVersion(version);
              }}
            >
              <WorldLighting quality={effectiveQuality} />
              {!rotateWorld ? (
                <OrbitControls
                  makeDefault
                  enabled={!effectiveInteractiveMode}
                />
              ) : null}
              <Suspense fallback={null}>
                {/* Center the taller mobile island, including its tree canopy. */}
                <group position={[0, closeUp && size > 1 ? -4.5 : 0, 0]}>
                  <Map
                    size={size}
                    rotateWorld={rotateWorld}
                    interactiveMode={effectiveInteractiveMode}
                    showFringe={effectiveShowFringe}
                    quality={effectiveQuality}
                    terrainMode={terrainMode}
                  />
                </group>
                <WorldLoadedNotifier onReady={() => setAssetsReady(true)} />
                <WorldPerformanceReporter onSample={handlePerformanceSample} />
                {effectiveInteractiveMode ? (
                  <>
                    <InteractiveReadyNotifier
                      onReady={handleInteractiveReady}
                    />
                  </>
                ) : null}
              </Suspense>
            </Canvas>
          </WorldErrorBoundary>
        )}
      </motion.div>
      {failure ? (
        <div className="absolute inset-x-4 top-1/2 z-20 mx-auto flex max-w-sm -translate-y-1/2 flex-col items-center gap-3 rounded-lg bg-bgcolor-primary/90 p-4 text-center shadow-lg">
          <span>
            The 3D preview could not load on this device. You can keep browsing.
            {interactiveMode && " Or retry in lite mode."}
          </span>
          {interactiveMode ? (
            <button
              type="button"
              onClick={retryLite}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-black transition-all hover:bg-yellow-600"
            >
              Try lite mode
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default World;
