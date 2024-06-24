import { Canvas } from "@react-three/fiber";
import Map from "./map";

interface Props {
  size?: number;
}

function World({ size = 1 }: Props) {
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
      />
      <Map size={size} />
    </Canvas>
  );
}

export default World;
