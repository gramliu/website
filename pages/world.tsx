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
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all ${
          !isPlaying ? "animate-bounce" : ""
        }`}
      >
        {isPlaying ? "Stop playing" : "Start playing"}
      </button>
    </main>
  );
}
