import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import World from "../src/components/world";
import PlayWorldButton from "../src/components/world/PlayWorldButton";
import {
  getWorldQuality,
  getWorldTerrainMode,
  parseWorldQualityOverride,
  type WorldQuality,
  type WorldTerrainMode,
} from "../src/components/world/quality";
import { useHasSideBySideHeroLayout } from "../src/hooks/useHasSideBySideHeroLayout";

const inter = Inter({ subsets: ["latin"] });

export default function WorldPage() {
  const router = useRouter();
  const [playingOverride, setPlayingOverride] = useState<boolean | null>(null);
  const [worldLoaded, setWorldLoaded] = useState(false);
  const [worldQuality, setWorldQuality] = useState<WorldQuality>("lite");
  const [terrainMode, setTerrainMode] =
    useState<WorldTerrainMode>("preview_island");
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
    setTerrainMode(getWorldTerrainMode(hasSideBySideHeroLayout));
  }, [hasSideBySideHeroLayout, qualityOverride]);

  return (
    <main className={`flex h-screen w-screen ${inter.className} relative`}>
      <div className="flex-1 w-full h-full min-w-0">
        <World
          rotateWorld={false}
          interactiveMode={isPlaying}
          showFringe
          quality={qualityOverride ?? worldQuality}
          terrainMode={terrainMode}
          allowQualityDowngrade={!qualityOverride}
          onLoaded={() => setWorldLoaded(true)}
          onInteractiveFailure={() => setPlayingOverride(false)}
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
        onToggle={() => setPlayingOverride(!isPlaying)}
        variant="overlay"
      />
    </main>
  );
}
