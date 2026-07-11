import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import World from "../src/components/world";
import PlayWorldButton from "../src/components/world/PlayWorldButton";
import {
  getWorldQuality,
  getWorldTerrainMode,
  type WorldQuality,
  type WorldTerrainMode,
} from "../src/components/world/quality";
import { useIsDesktop } from "../src/hooks/useIsDesktop";

const inter = Inter({ subsets: ["latin"] });

export default function WorldPage() {
  const router = useRouter();
  const [playingOverride, setPlayingOverride] = useState<boolean | null>(null);
  const [worldLoaded, setWorldLoaded] = useState(false);
  const [worldQuality, setWorldQuality] = useState<WorldQuality>("lite");
  const [terrainMode, setTerrainMode] =
    useState<WorldTerrainMode>("preview_island");
  const isDesktop = useIsDesktop();

  const queryWantsInteractive =
    router.isReady && router.query.mode === "interactive";
  const isPlaying = playingOverride ?? queryWantsInteractive;

  useEffect(() => {
    setWorldQuality(getWorldQuality(isDesktop));
    setTerrainMode(getWorldTerrainMode(isDesktop));
  }, [isDesktop]);

  return (
    <main className={`flex h-screen w-screen ${inter.className} relative`}>
      <div className="flex-1 w-full h-full min-w-0">
        <World
          rotateWorld={false}
          interactiveMode={isPlaying}
          showFringe
          quality={worldQuality}
          terrainMode={terrainMode}
          onLoaded={() => setWorldLoaded(true)}
          onInteractiveFailure={() => setPlayingOverride(false)}
          onRetryLite={() => {
            setWorldQuality("lite");
            setPlayingOverride(true);
          }}
        />
      </div>
      <PlayWorldButton
        ready={worldLoaded}
        isPlaying={isPlaying}
        terrainMode={terrainMode}
        onToggle={() => setPlayingOverride(!isPlaying)}
        variant="overlay"
      />
    </main>
  );
}
