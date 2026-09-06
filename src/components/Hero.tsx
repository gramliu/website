import clsx from "clsx";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Portrait from "../../public/images/portrait.png";
import { CameraControlsContext } from "../adapters/input/camera/context";
import social from "../config/social";
import { useHasSideBySideHeroLayout } from "../hooks/useHasSideBySideHeroLayout";
import { useWorldInteractivity } from "../hooks/useWorldInteractivity";
import World from "./world";
import CameraControlsPanel from "./world/CameraControlsPanel";
import ControlModeSwitch from "./world/ControlModeSwitch";
import KeyboardControlsPanel from "./world/KeyboardControlsPanel";
import PlayWorldButton from "./world/PlayWorldButton";
import {
  getWorldQuality,
  getWorldTerrainMode,
  type WorldQuality,
  type WorldTerrainMode,
} from "./world/quality";
import { useWorldControls } from "./world/useWorldControls";

function HeroContent() {
  return (
    <div className="flex items-center md:flex-row flex-col">
      <div className="rounded-full border-highlight border-[5px] p-2 overflow-hidden">
        <Image
          src={Portrait}
          alt="Picture of me"
          className="h-[20vh] w-auto rounded-full"
          height={512}
          width={512}
          placeholder="blur"
          priority
        />
      </div>
      <div className="mt-4 md:mt-0 ml-0 md:ml-20 text-4xl">
        <span className="font-mono text-2xl">Hi! 👋</span>
        <br />
        <br />
        I&apos;m{" "}
        <span className="font-bold font-mono text-highlight whitespace-nowrap">
          Gram Liu.
        </span>
        <br />
        <span className="text-base">Developer. Engineer. Tech Enthusiast.</span>
      </div>
    </div>
  );
}

function SocialIcons() {
  return (
    <div className="flex items-center justify-evenly w-full md:w-10/12 mt-10 mx-auto gap-10">
      {social.map(({ image, url }) => (
        <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
          <div className="mt-5 border-2 rounded-full p-4 flex items-center justify-center transition hover:bg-bgcolor-highlight">
            {image}
          </div>
        </a>
      ))}
    </div>
  );
}

export default function Hero() {
  const [wantsToPlay, setIsPlaying] = useState(false);
  const canInteract = useWorldInteractivity();
  const isPlaying = canInteract && wantsToPlay;
  const { cameraInput, controlMode, autoStartCamera, closeCamera, selectMode } =
    useWorldControls();
  const playArea = useRef<HTMLDivElement>(null);
  const stopPlaying = () => {
    closeCamera();
    setIsPlaying(false);
  };
  const [worldLoaded, setWorldLoaded] = useState(false);
  const [worldQuality, setWorldQuality] = useState<WorldQuality>("lite");
  const [terrainMode, setTerrainMode] =
    useState<WorldTerrainMode>("preview_island");
  const hasSideBySideHeroLayout = useHasSideBySideHeroLayout();

  useEffect(() => {
    setWorldQuality(
      getWorldQuality(
        hasSideBySideHeroLayout && canInteract,
        navigator.deviceMemory
      )
    );
    setTerrainMode(getWorldTerrainMode(hasSideBySideHeroLayout));
  }, [hasSideBySideHeroLayout, canInteract]);

  useEffect(() => {
    if (!canInteract && wantsToPlay) {
      closeCamera();
      setIsPlaying(false);
    }
  }, [canInteract, closeCamera, wantsToPlay]);

  useEffect(() => {
    if (!isPlaying) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    playArea.current
      ?.querySelector<HTMLButtonElement>('[aria-label="Stop playing"]')
      ?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        stopPlaying();
      }
      if (event.key !== "Tab") return;
      const buttons = Array.from(
        playArea.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href]"
        ) ?? []
      );
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [isPlaying]);

  return (
    <CameraControlsContext.Provider
      value={isPlaying && controlMode === "camera" ? cameraInput : null}
    >
      <div
        className={clsx(
          "items-center justify-center h-auto",
          "xl:flex xl:justify-center xl:items-center"
        )}
        id="home"
      >
        <div className="flex flex-col xl:w-1/2 mb-[5%] h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "spring",
              duration: 0.5,
              stiffness: 150,
              damping: 50,
            }}
          >
            <HeroContent />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 20,
              duration: 1,
              delay: 0.7,
            }}
          >
            <SocialIcons />
          </motion.div>
        </div>
        <div className="mt-[10%] pt-[10%] xl:w-1/2 h-screen" id="world">
          <div
            ref={playArea}
            {...(isPlaying
              ? {
                  role: "dialog",
                  "aria-modal": true,
                  "aria-label": "Explore the world",
                }
              : {})}
            className={
              isPlaying
                ? "fixed inset-0 z-50 bg-bgcolor-primary"
                : "grid h-full grid-rows-2"
            }
          >
            {isPlaying && (
              <button
                type="button"
                onClick={stopPlaying}
                className="absolute left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-divider/70 bg-bgcolor-primary/90 px-4 py-2 text-xs text-text-faded hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Back to homepage
                <span className="ml-1 text-[10px] opacity-70">Esc</span>
              </button>
            )}
            <div className={isPlaying ? "h-full w-full" : "min-h-[360px]"}>
              <World
                size={isPlaying ? 1 : canInteract ? 0.8 : 0.55}
                rotateWorld={!isPlaying}
                interactiveMode={isPlaying}
                closeUp={!isPlaying && canInteract}
                showFringe
                quality={worldQuality}
                terrainMode={isPlaying ? "infinite" : terrainMode}
                onLoaded={() => setWorldLoaded(true)}
                onInteractiveFailure={stopPlaying}
                onRetryLite={() => {
                  setWorldQuality("lite");
                  setIsPlaying(true);
                }}
              />
            </div>
            {canInteract && (
              <PlayWorldButton
                ready={worldLoaded}
                isPlaying={isPlaying}
                onToggle={() =>
                  isPlaying ? stopPlaying() : setIsPlaying(true)
                }
                variant={isPlaying ? "overlay" : "hero"}
                controls={
                  <ControlModeSwitch
                    mode={controlMode}
                    onChange={(mode) => {
                      selectMode(mode);
                      if (mode === "camera") setIsPlaying(true);
                    }}
                  />
                }
              />
            )}
            {isPlaying &&
              (controlMode === "camera" ? (
                <CameraControlsPanel
                  inputRef={cameraInput}
                  autoStart={autoStartCamera}
                  onStart={() => setIsPlaying(true)}
                  onClose={closeCamera}
                />
              ) : (
                <KeyboardControlsPanel isPlaying={isPlaying} />
              ))}
          </div>
        </div>
      </div>
    </CameraControlsContext.Provider>
  );
}
