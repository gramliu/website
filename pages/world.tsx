import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useState } from "react";
import World from "../src/components/world";
import PlayWorldButton from "../src/components/world/PlayWorldButton";

const inter = Inter({ subsets: ["latin"] });

export default function WorldPage() {
  const router = useRouter();
  const [playingOverride, setPlayingOverride] = useState<boolean | null>(null);
  const [worldLoaded, setWorldLoaded] = useState(false);

  const queryWantsInteractive =
    router.isReady && router.query.mode === "interactive";
  const isPlaying = playingOverride ?? queryWantsInteractive;

  return (
    <main className={`flex h-screen w-screen ${inter.className} relative`}>
      <div className="flex-1 w-full h-full min-w-0">
        <World
          rotateWorld={false}
          interactiveMode={isPlaying}
          showFringe
          onLoaded={() => setWorldLoaded(true)}
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
