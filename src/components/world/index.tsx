import { Canvas } from "@react-three/fiber";
import Map from "./map";
import { OrbitControls } from "@react-three/drei";

interface Props {
  size?: number;
  rotateWorld?: boolean;
}

function World({ size = 1, rotateWorld = true }: Props) {
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
      <Map size={size} rotateWorld={rotateWorld} />
    </Canvas>
  );
}

export default World;
