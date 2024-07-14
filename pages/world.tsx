import World from "../src/components/world";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`flex h-screen w-screen ${inter.className}`}>
      <World rotateWorld={false} />
    </main>
  );
}
