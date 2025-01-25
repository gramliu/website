import { Canvas } from "@react-three/fiber";
import Map from "./map";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";
import { onKeyDown, onKeyUp } from "./keycontrols";

interface Props {
  size?: number;
  rotateWorld?: boolean;
  interactiveMode?: boolean;
}

function World({ size = 1, rotateWorld = true, interactiveMode = false }: Props) {
  useEffect(() => {
    if (interactiveMode) {
      // Add key listeners when interactive mode is enabled
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      return () => {
        // Clean up listeners when component unmounts
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      };
    }
  }, [interactiveMode]);

  return (
    <Canvas camera={{ position: [15, 10, 15], fov: 60 }} shadows>
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
          <OrbitControls />
        </>
      ) : null}
      <Map size={size} rotateWorld={rotateWorld} interactiveMode={interactiveMode} />
    </Canvas>
  );
}

export default World;
