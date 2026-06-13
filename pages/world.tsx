import { Inter } from "next/font/google";
import { useState } from "react";
import World from "../src/components/world";
import PlayWorldButton from "../src/components/world/PlayWorldButton";

const inter = Inter({ subsets: ["latin"] });

export default function WorldPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [worldLoaded, setWorldLoaded] = useState(false);

  return (
    <main className={`flex h-screen w-screen ${inter.className} relative`}>
      <World
        rotateWorld={false}
        interactiveMode={isPlaying}
        showFringe
        onLoaded={() => setWorldLoaded(true)}
      />
      <PlayWorldButton
        ready={worldLoaded}
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying(!isPlaying)}
        variant="overlay"
      />
    </main>
  );
}
