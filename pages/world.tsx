import clsx from "clsx";
import World from "../src/components/world";
import { Inter } from "next/font/google";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function WorldPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <main className={`flex h-screen w-screen ${inter.className} relative`}>
      <World rotateWorld={false} interactiveMode={isPlaying} />
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={clsx(
          "absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-yellow-500 text-black rounded-lg shadow-lg hover:bg-yellow-600 transition-all",
          {
            "animate-bounce": !isPlaying,
          }
        )}
      >
        {isPlaying ? "Stop playing" : "Start playing"}
      </button>
    </main>
  );
}
