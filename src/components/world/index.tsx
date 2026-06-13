import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import Map from "./map";

interface Props {
  size?: number;
  rotateWorld?: boolean;
  interactiveMode?: boolean;
  closeUp?: boolean;
  showFringe?: boolean;
  onLoaded?: () => void;
}

function WorldLoadedNotifier({ onLoaded }: { onLoaded: () => void }) {
  const notified = useRef(false);
  useFrame(() => {
    if (notified.current) {
      return;
    }
    notified.current = true;
    onLoaded();
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
  return (
    <Canvas
      camera={{
        position: [15, 10, 15],
        fov: closeUp ? 50 : 60,
      }}
      style={{
        height: closeUp ? "900px" : "100%",
      }}
      shadows
    >
      <ambientLight intensity={0.5} />
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
        {onLoaded ? <WorldLoadedNotifier onLoaded={onLoaded} /> : null}
      </Suspense>
    </Canvas>
  );
}

export default World;
