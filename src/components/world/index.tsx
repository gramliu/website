import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Map from "./map";

// Dimensions
const h = 7;
const l = 10;
const w = 0.5;

const ml = l / 2;
const mw = w / 2;

function World() {
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
      <OrbitControls />
      <axesHelper args={[30]} />
      <Map />
      {/* Outside */}
      <mesh position={[ml, -mw, ml]} receiveShadow>
        <boxGeometry args={[100, w, 100]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </Canvas>
  );
}

export default World;
